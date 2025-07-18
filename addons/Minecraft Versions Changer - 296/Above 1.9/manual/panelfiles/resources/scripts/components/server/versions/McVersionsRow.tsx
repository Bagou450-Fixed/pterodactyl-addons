import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import tw from 'twin.macro';
import GreyRowBox from '@/components/elements/GreyRowBox';
import { ServerContext } from '@/state/server';
import Button from '@/components/elements/Button';
import deleteFiles from '@/api/server/files/deleteFiles';
import { ApplicationStore } from '@/state';
import { Actions, useStoreActions } from 'easy-peasy';
import ConfirmationModal from '@/components/elements/ConfirmationModal';
import setSelectedDockerImage from '@/api/server/setSelectedDockerImage';
import InstallMinecraftVersion from '@/api/server/version/InstallMinecraftVersion';
import getVersionFileSize from '@/api/server/version/getVersionFileSize';
import decompressFiles from '@/api/server/files/decompressFiles';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { bytesToString } from '@/lib/formatters';
import renameFiles from '@/api/server/files/renameFiles';

interface Props {
  minecraftVersions: any;
  className?: string;
  stype: string;
  type: string;
  modpacktype: string;
}

export default ({ minecraftVersions, className, stype, type, modpacktype }: Props) => {
  const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
  const [disabled, setDisabled] = useState(false);
  const { addFlash, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);
  const [visible, setVisible] = useState(false);
  const [pourcentage, setPourcentage] = useState('');
  const name = stype.charAt(0).toUpperCase() + stype.slice(1) + ' ' + minecraftVersions.version;
  let dockerimage = 'ghcr.io/pterodactyl/yolks:java_8';
  if(stype !== 'modpacks') {
    if (parseInt(minecraftVersions.version.slice(2)) >= 17) {
      dockerimage = 'ghcr.io/pterodactyl/yolks:java_16';
    }
    if (parseInt(minecraftVersions.version.slice(2)) >= 18) {
      dockerimage = 'ghcr.io/pterodactyl/yolks:java_17';
    }
  } else if (minecraftVersions.mcversion) {
    if (parseInt(minecraftVersions.mcversion) >= 17) {
      dockerimage = 'ghcr.io/pterodactyl/yolks:java_16';
    }
    if (parseInt(minecraftVersions.mcversion) >= 18) {
      dockerimage = 'ghcr.io/pterodactyl/yolks:java_17';
    }
  }
console.log(dockerimage)
  function clear() {
    clearFlashes();
  }
  const Install = () => {
    setVisible(false);
    setDisabled(true);
    setPourcentage('Delete old versions...');
    deleteFiles(uuid, '/', ['server.jar', 'zip.zip', 'libraries', 'fontfiles', 'worldshape', 'oresources', 'resources', 'structures', 'scripts', 'unix_args.txt', 'user_jvm_args.txt', 'config', 'mods'])
      .then(() => {
        InstallMinecraftVersion(
          uuid,
          type.charAt(0).toUpperCase() + type.slice(1) + ' ' + minecraftVersions.version,
          stype,
          minecraftVersions,
          type
        )
          .then((data) => {
            setPourcentage('Setup requirements...');
            let filename =
              stype === 'forge' || stype === 'fabric' || stype === 'modpacks'
                ? modpacktype === 'others'
                ? minecraftVersions.url.replace(/^.*[\\/]/, '')
                : `${minecraftVersions.version}.zip`
                : stype === 'magma' ?
                `${minecraftVersions.version}.jar`
                : `${minecraftVersions.version}`;
            if(stype === 'mohist') {
              filename = `${minecraftVersions.version}`
            }
            let oldsize = 0;
            const Download = setInterval(function () {
              getVersionFileSize(uuid, filename)
                .then((size) => {
                  if (data !== size) {
                    setPourcentage(
                      `Download in progress ${bytesToString(size)}/${bytesToString(data)} (${bytesToString(
                        size - oldsize
                      )}/s)`
                    );
                    oldsize = size;
                  } else {
                    clearInterval(Download);
                    if (filename.endsWith('tar.xz') || filename.endsWith('zip') || filename.endsWith('tar.gz')) {
                      setPourcentage('Decompress files...');
                      decompressFiles(uuid, '/', filename)
                        .then(() => {
                          setPourcentage('Delete compressed file...');
                          deleteFiles(uuid, '/', [filename])
                            .then(() => {
                              setPourcentage('Change java version...');
                              setSelectedDockerImage(uuid, dockerimage).then(() => {
                                addFlash({
                                  key: 'server:minecraftVersion',
                                  type: 'success',
                                  message: 'Version changed successfully',
                                });
                                setDisabled(false);
                                setTimeout(clear, 3000);
                              });
                            })
                            .catch((err) => {
                              clearInterval(Download);
                              addFlash({
                                key: 'server:minecraftVersion',
                                type: 'error',
                                message: "Can't install the version.",
                              });
                              console.log(err);
                              setDisabled(false);
                              setTimeout(clear, 3000);
                            });
                        })
                        .catch((err) => {
                          clearInterval(Download);
                          addFlash({
                            key: 'server:minecraftVersion',
                            type: 'error',
                            message: "Can't install the version.",
                          });
                          console.log(err);
                          setDisabled(false);
                          setTimeout(clear, 3000);
                        });
                    } else {
                      setPourcentage('Rename files...');
                      renameFiles(uuid, '/', [{ from: filename, to: 'server.jar' }])
                        .then(() => {
                          setPourcentage('Change java version...');
                          setSelectedDockerImage(uuid, dockerimage)
                            .then(() => {
                              addFlash({
                                key: 'server:minecraftVersion',
                                type: 'success',
                                message: 'Version changed successfully',
                              });
                              setDisabled(false);
                              setTimeout(clear, 3000);
                            })
                            .catch((err) => {
                              clearInterval(Download);
                              addFlash({
                                key: 'server:minecraftVersion',
                                type: 'error',
                                message: "Can't install the version.",
                              });
                              console.log(err);
                              setDisabled(false);
                              setTimeout(clear, 3000);
                            });
                        })
                        .catch((err) => {
                          clearInterval(Download);
                          addFlash({
                            key: 'server:minecraftVersion',
                            type: 'error',
                            message: "Can't install the version.",
                          });
                          console.log(err);
                          setDisabled(false);
                          setTimeout(clear, 3000);
                        });
                    }
                  }
                })
                .catch((err) => {
                  clearInterval(Download);
                  addFlash({
                    key: 'server:minecraftVersion',
                    type: 'error',
                    message: "Can't install the version.",
                  });
                  console.log(err);
                  setDisabled(false);
                });
            }, 1000);
          })
          .catch((error) => {
            addFlash({
              key: 'server:minecraftVersion',
              type: 'error',
              message: "Can't install the version.",
            });
            console.log(error);
            setDisabled(false);
          });
      })
      .catch((error) => {
        addFlash({
          key: 'server:minecraftVersion',
          type: 'error',
          message: "Can't install the version.",
        });
        console.log(error);
        setDisabled(false);
      });
  };
  return (
    <GreyRowBox css={tw`grid grid-rows-2`} className={className}>
      <SpinnerOverlay fixed={true} size={'large'} visible={disabled}>
        <div css={tw`text-white mt-2`}>{pourcentage}</div>
      </SpinnerOverlay>
      <ConfirmationModal
        visible={visible}
        title={`Install the ${name}?`}
        buttonText={'Install'}
        onConfirmed={() => Install()}
        onModalDismissed={() => setVisible(false)}
      >
        <p css={tw`text-neutral-300`}>This action remove server.jar,libraries,mods,resources,scripts,fontfiles,oresources and config folder from the server.</p>
        <p css={tw`text-neutral-300`}>Are you sure you want to continue?</p>
      </ConfirmationModal>
      <div css={tw`mx-auto`}>
        <div css={tw`flex`}>
          <img src={stype !== 'modpacks' ? `https://cdn.bagou450.com/img/${stype}-icon.jpg` : modpacktype !== 'others' ? `https://cdn.bagou450.com/img/modpacks/${minecraftVersions.name.toLowerCase()}.png` : minecraftVersions.icon} css={tw`mr-3 h-8 w-8`} />
            {stype === 'modpacks' ? (
              <p css={tw`my-auto`}>
                {modpacktype === 'others' ? minecraftVersions.name : minecraftVersions.version}{' : '}
                <span css={tw`text-cyan-600`}>{minecraftVersions.mcversion} </span>
              </p>
            ):(
              <p css={tw`my-auto`}>
                {stype.charAt(0).toUpperCase() + stype.slice(1) + ': '}
                <span css={tw`text-cyan-600`}>{minecraftVersions.version} </span>
              </p>
            )}

        </div>
      </div>
      <div css={tw`mx-auto mt-2`}>
        <Button
          type={'button'}
          color={'grey'}
          isSecondary
          onClick={() => setVisible(true)}
          isLoading={disabled}
          title='Install'
        >
          <p css={disabled ? tw`mr-4 ml-4 invisible` : tw`mr-4 ml-4`}>
            <FontAwesomeIcon icon={faDownload} /> Install
          </p>
        </Button>
      </div>
    </GreyRowBox>
  );
};


