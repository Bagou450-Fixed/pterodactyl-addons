import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import tw from 'twin.macro';
import useFlash from '@/plugins/useFlash';
import GreyRowBox from '@/components/elements/GreyRowBox';
import Modal from '@/components/elements/Modal';
import Button from '@/components/elements/Button';
import FlashMessageRender from '@/components/FlashMessageRender';
import Parser from 'html-react-parser';
import ReactMarkdown from 'react-markdown';
import getMinecraftMcModpacksDescription from '@/api/server/mcmodpacks/getMinecraftMcModpacksDescription';
import { ServerContext } from '@/state/server';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { ApplicationStore } from '@/state';
import { Actions, useStoreActions } from 'easy-peasy';
import deleteFiles from '@/api/server/files/deleteFiles';
import InstallMinecraftModPack from '@/api/server/mcmodpacks/InstallMinecraftModPack';
import getMinecraftModPackFileSize from '@/api/server/mcmodpacks/getMinecraftModPackFileSize';
import { bytesToString } from '@/lib/formatters';
import decompressFiles from '@/api/server/files/decompressFiles';
import setSelectedDockerImage from '@/api/server/setSelectedDockerImage';

interface Props {
  minecraftMcModpack: any;
  className?: string;
  type: string;
}

export default ({ minecraftMcModpack, className, type }: Props) => {
  const { clearAndAddHttpError } = useFlash();
  const [visible, setVisible] = useState('');
  const [infoload, setInfoLoad] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pourcentage, setPourcentage] = useState('');
  const [description, setDescription] = useState('');
  const { addFlash, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);
  const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
  function clear() {
    clearFlashes();
  }
  if (type === 'modrinth') {
    minecraftMcModpack.id = minecraftMcModpack.project_id;
    minecraftMcModpack.name = minecraftMcModpack.title;
    minecraftMcModpack.logo = { thumbnailUrl: minecraftMcModpack.icon_url };
    minecraftMcModpack.links = { websiteUrl: `https://modrinth.com/mod/${minecraftMcModpack.slug}` };
    minecraftMcModpack.summary = minecraftMcModpack.description;
  }
  const getDescription = () => {
    setInfoLoad(true);
    if (['curseforge', 'modrinth'].includes(type)) {
      getMinecraftMcModpacksDescription(uuid, minecraftMcModpack.id, type)
        .then((data) => {
          setDescription(data);
          setInfoLoad(false);
          setVisible('informations');
        })
        .catch((e) => clearAndAddHttpError({ key: minecraftMcModpack.id, error: e }));
    } else {
      setDescription(minecraftMcModpack.description);
      setInfoLoad(false);
      setVisible('informations');
    }
  };
  const InstallFTBORTECHNIC = () => {
    setDisabled(true);
    setLoading(true);
    setPourcentage('Delete old versions...');
    deleteFiles(uuid, '/', [
      'server.jar',
      'zip.zip',
      'libraries',
      'fontfiles',
      'worldshape',
      'oresources',
      'resources',
      'structures',
      'scripts',
      'unix_args.txt',
      'user_jvm_args.txt',
      'config',
      'mods',
    ])
      .then(() => {
        InstallMinecraftModPack(uuid, minecraftMcModpack.name, minecraftMcModpack, type, 0)
          .then(() => {
            setLoading(false);
            setDisabled(false);
            addFlash({
              key: 'server:minecraftModpacks',
              type: 'success',
              message: 'Modpacks in installation. Wait the server installation for use it.',
            });
          })
          .catch((error) => {
            addFlash({
              key: 'server:minecraftModpacks',
              type: 'error',
              message: "Can't install the version. The modpack maybe don't have a server pack.",
            });
            console.log(error);
            setDisabled(false);
            setLoading(false);
          });
      })
      .catch((error) => {
        addFlash({
          key: 'server:minecraftModpacks',
          type: 'error',
          message: "Can't install the version.",
        });
        console.log(error);
        setDisabled(false);
      });
  };
  const InstallVoidswrath = () => {
    setDisabled(true);
    setLoading(true);
    setPourcentage('Delete old versions...');
    deleteFiles(uuid, '/', [
      'server.jar',
      'zip.zip',
      'libraries',
      'fontfiles',
      'worldshape',
      'oresources',
      'resources',
      'structures',
      'scripts',
      'unix_args.txt',
      'user_jvm_args.txt',
      'config',
      'mods',
    ])
      .then(() => {
        InstallMinecraftModPack(uuid, minecraftMcModpack.name, minecraftMcModpack, type, 0)
          .then((data) => {
            setPourcentage('Setup requirements...');
            const filename = minecraftMcModpack.downloadlink.replace(/^.*[\\/]/, '');
            let oldsize = 0;
            let dockerimage = 'ghcr.io/pterodactyl/yolks:java_8';
            if (parseInt(minecraftMcModpack.versions.slice(2)) >= 17) {
              dockerimage = 'ghcr.io/pterodactyl/yolks:java_16';
            }
            if (parseInt(minecraftMcModpack.versions.slice(2)) >= 18) {
              dockerimage = 'ghcr.io/pterodactyl/yolks:java_17';
            }
            const Download = setInterval(function () {
              getMinecraftModPackFileSize(uuid, filename)
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
                    setPourcentage('Decompress files...');
                    decompressFiles(uuid, '/', filename)
                      .then(() => {
                        setPourcentage('Delete compressed file...');
                        deleteFiles(uuid, '/', [filename])
                          .then(() => {
                            setPourcentage('Change java version...');
                            setSelectedDockerImage(uuid, dockerimage).then(() => {
                              InstallMinecraftModPack(uuid, minecraftMcModpack.name, minecraftMcModpack, type, 1)
                                .then(() => {
                                  addFlash({
                                    key: 'server:minecraftModpacks',
                                    type: 'success',
                                    message: 'Modpack changed successfully',
                                  });
                                  setDisabled(false);
                                  setLoading(false);
                                  setTimeout(clear, 3000);
                                })
                                .catch(() => {
                                  addFlash({
                                    key: 'server:minecraftModpacks',
                                    type: 'error',
                                    message: "Can't install the modpack.",
                                  });
                                });
                            });
                          })
                          .catch((err) => {
                            clearInterval(Download);
                            addFlash({
                              key: 'server:minecraftModpacks',
                              type: 'error',
                              message: "Can't install the modpack.",
                            });
                            console.log(err);
                            setDisabled(false);
                            setTimeout(clear, 3000);
                          });
                      })
                      .catch((err) => {
                        clearInterval(Download);
                        addFlash({
                          key: 'server:minecraftModpacks',
                          type: 'error',
                          message: "Can't install the modpack.",
                        });
                        console.log(err);
                        setDisabled(false);
                        setTimeout(clear, 3000);
                      });
                  }
                })
                .catch((err) => {
                  clearInterval(Download);
                  addFlash({
                    key: 'server:minecraftModpacks',
                    type: 'error',
                    message: "Can't install the modpack.",
                  });
                  console.log(err);
                  setDisabled(false);
                });
            }, 1000);
          })
          .catch((error) => {
            addFlash({
              key: 'server:minecraftModpacks',
              type: 'error',
              message: "Can't install the version.",
            });
            console.log(error);
            setDisabled(false);
          });
      })
      .catch((error) => {
        addFlash({
          key: 'server:minecraftModpacks',
          type: 'error',
          message: "Can't install the version.",
        });
        console.log(error);
        setDisabled(false);
      });
  };
  return (
    <GreyRowBox css={tw`flex-wrap md:flex-nowrap items-center mb-2`} className={className}>
      <SpinnerOverlay fixed={true} size={'large'} visible={loading}>
        <div css={tw`text-white mt-2`}>{pourcentage}</div>
      </SpinnerOverlay>
      <Modal
        visible={visible === 'informations'}
        onDismissed={() => {
          setVisible('');
        }}
      >
        <FlashMessageRender byKey={minecraftMcModpack.id} css={tw`mb-4`} />
        {type === 'ftb' ? <ReactMarkdown>{description}</ReactMarkdown> : Parser(description)}
      </Modal>
      <div css={tw`flex items-center truncate w-full md:flex-1`}>
        <div css={tw`flex flex-col truncate`}>
          <div css={tw`flex items-center text-sm mb-1`}>
            <div
              css={tw`w-10 h-10 rounded-lg bg-white border-2 border-neutral-800 overflow-hidden hidden md:block`}
              title={minecraftMcModpack.name}
            >
              <img alt={minecraftMcModpack.name} src={minecraftMcModpack.logo.thumbnailUrl} />
            </div>
            <a
              href={
                type === 'curseforge' || type === 'modrinth'
                  ? minecraftMcModpack.links.websiteUrl
                  : minecraftMcModpack.link
              }
              css={tw`ml-4 break-words truncate`}
              title={minecraftMcModpack.summary}
            >
              {minecraftMcModpack.name}
              {!['technicpack', 'voidswrath'].includes(type) && (
                <>
                  <br />
                  <div css={tw`text-2xs text-neutral-400`}>Description (Hover me)</div>
                </>
              )}
            </a>
            <br />
          </div>
          <p css={tw`mt-1 md:mt-0 text-xs truncate`}>
            {type === 'modrinth' || type === 'ftb' ? (
              <p>{minecraftMcModpack.display_categories.join(', ')} </p>
            ) : (
              type === 'curseforge' &&
              minecraftMcModpack.categories.map((category: any, index: any) => (
                <img
                  css={index > 0 ? tw`ml-1 w-8 h-8 inline` : tw`w-8 h-8 inline`}
                  key={category.name}
                  src={category.iconUrl}
                  alt={category.name}
                  title={category.name}
                />
              ))
            )}
          </p>
        </div>
      </div>

      <div css={tw`mt-4 md:mt-0 ml-6 grid grid-rows-2 gap-y-2`} style={{ marginRight: '-0.5rem' }}>
        <Button
          type={'button'}
          aria-label={'More Informations'}
          onClick={() => getDescription()}
          title='More Informations'
          isLoading={infoload}
          isSecondary
        >
          <FontAwesomeIcon icon={faPaperclip} /> Informations
        </Button>

        <Button
          type={'button'}
          aria-label={'Install'}
          disabled={disabled}
          onClick={() => {
            if (type === 'voidswrath') {
              InstallVoidswrath();
            } else if (type === 'ftb' || type === 'technicpack' || type === 'curseforge') {
              InstallFTBORTECHNIC();
            } else {
              setVisible('versions');
            }
          }}
          title='Download and Install'
        >
          <FontAwesomeIcon icon={faDownload} /> Install
        </Button>
      </div>
    </GreyRowBox>
  );
};
