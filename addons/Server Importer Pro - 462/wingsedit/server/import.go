package server

import (
	"fmt"
	"github.com/apex/log"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/pkg/sftp"
	"github.com/pterodactyl/wings/environment"
	"github.com/secsy/goftp"
	"golang.org/x/crypto/ssh"
)

type Runes []rune

func (s *Server) Import(sync bool, user string, password string, host string, port int, srcLocation string, dstLocation string, Type string) error {
	if sync {
		s.Log().Info("syncing server state with remote source before executing import process")
		if err := s.Sync(); err != nil {
			return err
		}
	}

	var err error
	s.Events().Publish(ImportStartedEvent, "")
	if Type == "ftp" || port == 21 {
		err = s.internalImportFtp(user, password, host, port, srcLocation, dstLocation)

	} else {
		err = s.internalImport(user, password, host, port, srcLocation, dstLocation)
	}
	s.Log().WithField("was_successful", err == nil).Debug("notifying panel of server import state")

	if err = s.SyncImportState(err == nil); err != nil {
		s.Log().WithField("error", err).Error("failed to notify panel of server import state")
		return err
	}

	s.Events().Publish(ImportCompletedEvent, "")

	return err
}

func (s *Server) ImportNew(user string, password string, host string, port int, srcLocation string, dstLocation string, Type string, Wipe bool) error {
	if s.Environment.State() != environment.ProcessOfflineState {
		s.Log().Debug("waiting for server instance to enter a stopped state")
		s.Environment.SetState(environment.ProcessOfflineState)
		if err := s.Environment.WaitForStop(s.Context(), time.Second*10, true); err != nil {
			return err
		}
	}
	if Wipe {
		err := s.Filesystem().TruncateRootDirectory()
		if err != nil {
			return err
		}
	}
	if !strings.HasSuffix(dstLocation, "/") {
		dstLocation = dstLocation + "/"
	}

	if Type == "sftp" {
		if !strings.HasPrefix(srcLocation, "/") {
			srcLocation = "/" + srcLocation
		}
		if !strings.HasSuffix(srcLocation, "/") {
			srcLocation = srcLocation + "/"
		}
	} else {

		if !strings.HasPrefix(srcLocation, "/") {

			srcLocation = "/" + srcLocation
		}
	}

	return s.Import(true, user, password, host, port, srcLocation, dstLocation, Type)
}

func (s *Server) internalImport(user string, password string, host string, port int, srcLocation string, dstLocation string) error {

	s.Log().Info("beginning import process for server")
	if err := s.ServerImporter(user, password, host, port, srcLocation, dstLocation); err != nil {
		return err
	}
	s.Log().Info("completed import process for server")
	return nil
}

func (s *Server) ServerImporter(user string, password string, host string, port int, srcLocation string, dstLocation string) error {
	config := ssh.ClientConfig{
		User: user,
		Auth: []ssh.AuthMethod{
			ssh.Password(password),
		},

		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
	}

	addr := host + ":" + strconv.Itoa(port)
	conn, err := ssh.Dial("tcp", addr, &config)
	if err != nil {
		s.Log().WithField("error", err).Error("Failed to connect to to [" + addr + "]")
		return err
	}
	sc, err := sftp.NewClient(conn)
	if err != nil {
		s.Log().WithField("error", err).Error("Unable to start SFTP subsystem.")
		return err
	}
	files, err := sc.ReadDir(srcLocation)
	if err != nil {
		s.Log().WithField("error", err).Error("Unable to list remote dir.")
		return err
	}

	for _, f := range files {
		var name string

		name = f.Name()

		if f.IsDir() {
			strRune := Runes(name)
			reversed := strRune.ReverseString()
			numberOfSlash := strings.Index(name, "/")
			if string(reversed[numberOfSlash+1]) != "" {
				err := s.Filesystem().CreateDirectory(name, srcLocation)
				if err != nil {
					s.Log().WithField("error", err).Error("Unable to create remote dir")
					return err
				}
			}
			if err := eisdir("."+srcLocation+name+"/", sc, srcLocation, dstLocation, s); err != nil {
				return err
			}

		}
		if !f.IsDir() {
			if err := downloadFilesFromSftpServer(name, sc, dstLocation, srcLocation, s); err != nil {
				return err
			}
		}
	}
	return nil

}

func eisdir(dir string, sc *sftp.Client, srcLocation string, dstLocation string, s *Server) error {
	files, err := sc.ReadDir(dir)

	if err != nil {
		s.Log().WithField("error", err).Error("Unable to list remote dir")
		return err
	}
	for _, f := range files {
		var name string

		name = f.Name()

		if f.IsDir() {
			strRune := Runes(name)
			reversed := strRune.ReverseString()
			numberOfSlash := strings.Index(name, "/")
			if string(reversed[numberOfSlash+1]) != "" {
				err := s.Filesystem().CreateDirectory(name, dir)
				if err != nil {
					s.Log().WithField("error", err).Error("Unable to create remote dir [" + name + dir + "]")
					return err
				}

			}
			err := eisdir(dir+name+"/", sc, srcLocation, dstLocation, s)
			if err != nil {
				return err
			}
		}
		if !f.IsDir() {
			numberOfSlash := strings.LastIndex(dir+name, "/")
			if numberOfSlash != -1 {
				pathToCreate := dir[:numberOfSlash]
				err := s.Filesystem().CreateDirectory("", pathToCreate)  
				if err != nil {
					s.Log().WithField("error", err).Error("Unable to create remote dir [" + pathToCreate + "]")
					return err
				}
			}

			if err := downloadFilesFromSftpServer(name, sc, dir, srcLocation, s); err != nil {
				return err
			}
		}

	}
	return nil
}
func (str Runes) ReverseString() (revStr Runes) {
	l := len(str)
	revStr = make(Runes, l)
	for i := 0; i <= l/2; i++ {
		revStr[i], revStr[l-1-i] = str[l-1-i], str[i]
	}
	return revStr
}
func downloadFilesFromSftpServer(name string, sc *sftp.Client, folder string, srcFolder string, s *Server) error {
	srcFile, err := sc.OpenFile(folder+name, os.O_RDONLY)
	if err != nil {
		s.Log().WithField("error", err).Error("Unable to open remote file")
		return err
	}
	defer func(srcFile *sftp.File) {
		err := srcFile.Close()
		if err != nil {
			s.Log().WithField("error", err).Error("Unable to close sftp session")
		}
	}(srcFile)

	dstPath := strings.ReplaceAll(strings.ReplaceAll(folder+"/"+srcFolder+name, "//", "/"), "./", "")

	srcFileInfo, err := srcFile.Stat()
	if err != nil {
		s.Log().WithField("error", err).Error("Unable to get source file info")
		return err
	}
	srcFileSize := srcFileInfo.Size()

	err = s.Filesystem().Write(strings.ReplaceAll(dstPath, "//", "/"), srcFile, srcFileSize, 0644)
	if err != nil {
		s.Log().WithField("error", err).Error("Unable to write to local file")
		return err
	}
	return nil
}
func (s *Server) SyncImportState(successful bool) error {
	return s.client.SetImportStatus(s.Context(), s.ID(), successful)
}

func (s *Server) internalImportFtp(user string, password string, host string, port int, srcLocation string, dstLocation string) error {
	s.Log().Info("beginning import process for server")
	if err := s.ServerImporterFtp(user, password, host, port, srcLocation, dstLocation); err != nil {
		return err
	}
	s.Log().Info("completed import process for server")
	return nil
}

func (s *Server) ServerImporterFtp(user string, password string, host string, port int, srcLocation string, dstLocation string) error {
	config := goftp.Config{
		User:               user,
		Password:           password,
		ConnectionsPerHost: 10,
		Timeout:            10 * time.Second,
	}

	addr := fmt.Sprintf("%s:%d", host, port)
	sc, err := goftp.DialConfig(config, addr)
	if err != nil {
		s.Log().WithField("error", err).Error("Failed to connect to to [" + addr + "]")
		return err
	}
	files, err := sc.ReadDir("." + srcLocation)
	if err != nil {
		s.Log().WithField("error", err).Error("Unable to list remote ftp dir")
		return err
	}

	for _, f := range files {

		var name string

		name = f.Name()
		if f.IsDir() {
			err := s.Filesystem().CreateDirectory(name, dstLocation)
			if err != nil {
				s.Log().WithField("error", err).Error("Unable to create directory [" + name + "]")
				return err
			}

			if err := isDirFtp(filepath.Join(srcLocation, name)+"/", sc, srcLocation, filepath.Join(dstLocation, name), s); err != nil {
				return err
			}
		}
		if !f.IsDir() {

			if err := downloadFilesFromFtpServer(name, sc, "", srcLocation); err != nil {
				return err
			}
		}
	}
	return nil

}

func isDirFtp(dir string, sc *goftp.Client, srcLocation string, dstLocation string, s *Server) error {
	files, err := sc.ReadDir("./" + srcLocation + "/" + dir)

	if err != nil {
		s.Log().WithField("error", err).Error("Unable to list remote ftp eisdir")

		return err
	}
	for _, f := range files {
		var name string

		name = f.Name()

		if f.IsDir() {
			strRune := Runes(name)
			reversed := strRune.ReverseString()
			numberOfSlash := strings.Index(name, "/")
			if string(reversed[numberOfSlash+1]) != "" {

				err := s.Filesystem().CreateDirectory(name, dir)
				if err != nil {
					s.Log().WithField("error", err).Error("Unable to create directory [" + dir + name + "]")
					return err
				}
			}
			err := isDirFtp(dir+name+"/", sc, srcLocation, dstLocation, s)
			if err != nil {
				s.Log().WithField("error", err).Error("Unable to check a dir.")

				return err
			}
		}
		if !f.IsDir() {
			numberOfSlash := strings.LastIndex(dir+name, "/")
			if numberOfSlash != -1 {
				pathToCreate := dir[:numberOfSlash]
				err := s.Filesystem().CreateDirectory("", pathToCreate) 
				if err != nil {
					s.Log().WithField("error", err).Error("Unable to create directory [" + pathToCreate + "]")
					return err
				}
			}
			if err := downloadFilesFromFtpServer(name, sc, dir, srcLocation); err != nil {
				return err
			}
		}

	}
	return nil
}
func downloadFilesFromFtpServer(name string, sc *goftp.Client, folder string, srcLocation string) error {

	dstFile, err := os.Create(strings.Replace(folder+"/"+srcLocation+"/"+name, "//", "/", -1))
	if err != nil {
		return err
	}
	defer func(dstFile *os.File) {
		err := dstFile.Close()
		if err != nil {
			log.WithField("error", err).Warn("Can't close a file.")
		}
	}(dstFile)
	err = sc.Retrieve("."+srcLocation+"/"+srcLocation+name, dstFile)
	if err != nil {
		return err
	}
	return nil
}
