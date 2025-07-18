import React, { useContext, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faStar, faTrash } from '@fortawesome/free-solid-svg-icons';
import tw from 'twin.macro';
import useFlash from '@/plugins/useFlash';
import Button from '@/components/elements/Button';
import deleteFiles from '@/api/server/files/deleteFiles';
import { ApplicationStore } from '@/state';
import { Actions, useStoreActions } from 'easy-peasy';
import installPlugin from '@/api/server/mcplugins/installPlugin';
import uninstallPlugin from '@/api/server/mcplugins/uninstallPlugin';
import { formatDistanceToNow } from 'date-fns';
import { ServerContext } from '@/state/server';
import Spinner from '@/components/elements/Spinner';
import getPluginsVersions, { Context as PluginsVersionsContext } from '@/api/server/mcplugins/getPluginsVersions';
import Pagination from '@/components/elements/Pagination';
import GreyRowBox from '@/components/elements/GreyRowBox';
import { Dialog } from '@/components/elements/dialog';

interface Props {
  minecraftPlugins: any;
  nameoftype: string;
  installed: number;
  className?: string;
}

const McPluginsVersionsRow = ({ minecraftPlugins, nameoftype, installed }: Props) => {
  const { clearAndAddHttpError } = useFlash();
  const { addFlash, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);
  const [disable, setDisable] = useState(false);
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState('');

  const [Installed, setInstalled] = useState(installed);
  const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
  const { setPage } = useContext(PluginsVersionsContext);

  const {
    data: pluginVersions,
    error,
    isValidating,
  } = getPluginsVersions(
    uuid,
    nameoftype,
    nameoftype === 'Bukkit'
      ? minecraftPlugins.links.discussion.replace('https://dev.bukkit.org/projects/', '')
      : minecraftPlugins.id
  );
  useEffect(() => {
    if (!error) {
      clearFlashes('server:minecraftMcPlugins' + name);

      return;
    }
    clearAndAddHttpError({ error, key: 'server:minecraftMcPlugins' + name });
  }, [error]);

  if (!pluginVersions || (error && isValidating)) {
    return <Spinner size={'large'} centered />;
  }
  function clear() {
    clearFlashes();
  }
  let iconurl = 'https://static.spigotmc.org/styles/spigot/xenresource/resource_icon.png';
  if (nameoftype === 'PolyMart') {
    iconurl = minecraftPlugins.thumbnailURL;
  } else if (minecraftPlugins.icon.url !== '' && minecraftPlugins.icon.url !== undefined) {
    iconurl = !['Bukkit', 'PolyMart'].includes(nameoftype)
      ? 'https://www.spigotmc.org/' + minecraftPlugins.icon.url
      : minecraftPlugins.icon.url;
  }

  const testedVersions = [];

  for (const versions in minecraftPlugins.testedVersions) {
    testedVersions.push(minecraftPlugins.testedVersions[versions]);
  }
  const install = () => {
    setDisable(true);
    if (minecraftPlugins.file.type === 'external') {
      addFlash({
        key: 'server:minecraftMcPlugins',
        type: 'warning',
        message:
          "This plugins can't be installed because the plugins files was not on spigotmc please install it manualy from this url https://www.spigotmc.org/" +
          minecraftPlugins.file.url +
          '. You can also see if this plugins are on bukkit with the bukkit tab.',
      });
      setDisable(false);
      setTimeout(clear, 15000);
    } else {
      installPlugin(
        uuid,
        minecraftPlugins.name,
        `https://cdn.spiget.org/file/spiget-resources/${minecraftPlugins.id}.jar`
      )
        .then(() => {
          addFlash({
            key: 'server:minecraftMcPlugins',
            type: 'success',
            message: 'Plugins installed successfully',
          });
          setDisable(false);
          setInstalled(1);
          setTimeout(clear, 3000);
        })
        .catch(function (error) {
          setDisable(false);
          addFlash({
            key: 'server:minecraftMcPlugins',
            type: 'error',
            message: `This plugin has too large a size, it must be installed manually (${error})`,
          });
          setTimeout(clear, 3000);
        });
    }
  };
  const uninstall = () => {
    setDisable(true);
    if (minecraftPlugins.file.type === 'external') {
      addFlash({
        key: 'server:minecraftMcPlugins',
        type: 'warning',
        message:
          "This plugins can't be removed because the plugins files was not on spigotmc please remove it manualy ",
      });
      setDisable(false);
      setTimeout(clear, 15000);
    } else {
      deleteFiles(uuid, '/plugins', [`${minecraftPlugins.name}.jar`])
        .then(() => {
          uninstallPlugin(uuid, minecraftPlugins.name)
            .then(() => {
              addFlash({
                key: 'server:minecraftMcPlugins',
                type: 'success',
                message: 'Plugins removed successfully',
              });
              setDisable(false);
              setInstalled(0);
              setTimeout(clear, 3000);
            })
            .catch(function (error) {
              setDisable(false);
              clearAndAddHttpError({ key: 'minecraftMcPlugins', error });
            });
        })
        .catch(function (error) {
          setDisable(false);
          clearAndAddHttpError({ key: 'minecraftMcPlugins', error });
        });
    }
  };
  const installbukkit = () => {
    setDisable(true);
    installPlugin(uuid, minecraftPlugins.name, link)
      .then(() => {
        addFlash({
          key: minecraftPlugins.name,
          type: 'success',
          message: 'Plugins installed successfully',
        });
        setDisable(false);
        setInstalled(1);
        setTimeout(clear, 3000);
      })
      .catch(function (error) {
        setDisable(false);
        addFlash({
          key: minecraftPlugins.name,
          type: 'error',
          message: `A error occured. (${error})`,
        });
        setTimeout(clear, 3000);
      });
  };
  return (
    <div>
      <Dialog.Confirm
        open={open}
        onClose={() => setOpen(false)}
        title={`Install custom version.`}
        confirm={'Open'}
        onConfirmed={() => {
          if (nameoftype === 'PolyMart') {
            window.open(`https://polymart.org/resource/${minecraftPlugins.id}/updates`);
          } else {
            window.open(link);
          }
          setOpen(false);
        }}
      >
        For install a custom plugin version you need to download it yourself on spigot.
      </Dialog.Confirm>
      {!['Bukkit', 'PolyMart'].includes(nameoftype) && (
        <div css={tw`sm:flex`}>
          <div css={tw`flex items-center text-sm mb-1 cursor-pointer `}>
            <img
              css={tw`w-10 h-10 rounded-lg cursor-pointer mr-4`}
              onClick={() => window.open(`https://spigotmc.org/resources/bagou.${minecraftPlugins.id}`, '_blank')}
              alt={minecraftPlugins.name}
              src={iconurl}
            />

            <div>
              <h1 css={tw`text-lg`}>{minecraftPlugins.name}</h1>
              <p css={tw`text-sm`}>{minecraftPlugins.tag}</p>
            </div>
          </div>
          <div css={tw`text-base  mx-6`}>
            <p>
              Author:{' '}
              <a
                css={tw`text-blue-400`}
                href={`https://spigotmc.org/members/${minecraftPlugins.author.id}`}
                target={'_blank'}
                rel='noreferrer'
              >
                https://spigotmc.org/members/{minecraftPlugins.author.id}
              </a>
            </p>
            {minecraftPlugins.contributors !== null ?? <p>Contributor: {minecraftPlugins.contributors}</p>}
            <p>Versions: {minecraftPlugins.testedVersions.join()}</p>
            <p>Downloads: {minecraftPlugins.downloads}</p>
            <p>
              Released:{' '}
              {formatDistanceToNow(new Date(minecraftPlugins.releaseDate * 1000), {
                includeSeconds: true,
                addSuffix: true,
              })}
            </p>
            <p>
              Updated:{' '}
              {formatDistanceToNow(new Date(minecraftPlugins.updateDate * 1000), {
                includeSeconds: true,
                addSuffix: true,
              })}
            </p>
          </div>
          <div css={tw`flex-none mt-2 my-auto`}>
            <Button
              type={'button'}
              color={Installed === 1 ? 'red' : 'green'}
              css={tw`sm:w-36 mt-6 w-full`}
              onClick={() => {
                if (Installed === 0) {
                  install();
                } else {
                  uninstall();
                }
              }}
              title={Installed === 1 ? 'Uninstall' : 'Install'}
              disabled={disable}
              isLoading={disable}
            >
              <FontAwesomeIcon icon={Installed === 1 ? faTrash : faDownload} />{' '}
              {Installed === 1 ? 'Uninstall' : 'Install Latest'}
            </Button>
          </div>
        </div>
      )}
      <p css={tw`mt-2 text-center font-semibold`}>Others Versions</p>
      <div css={tw`grid grid-cols-2 gap-4 mt-2`}>
        <Pagination data={pluginVersions} customcss={tw`mt-4 flex justify-center col-span-2`} onPageSelect={setPage}>
          {({ items }) =>
            !items.length ? (
              <p css={tw`text-center text-sm text-neutral-300 col-span-2`}>
                {'It looks like there are no minecraft plugins versions matching search criteria.'}
              </p>
            ) : (
              items.map((pluginVersion, index) => (
                <GreyRowBox
                  key={index}
                  css={
                    index > 1
                      ? tw`flex-wrap md:flex-nowrap items-center mt-2`
                      : tw`flex-wrap md:flex-nowrap items-center`
                  }
                >
                  <div css={tw`flex items-center truncate w-full md:flex-1`}>
                    <div css={tw`flex flex-col truncate`}>
                      <div css={tw`flex items-center text-sm mb-1`}>{pluginVersion.name}</div>
                      {!['Bukkit', 'PolyMart'].includes(nameoftype) && (
                        <>
                          <p css={tw`mt-1 md:mt-0 text-xs truncate`}>
                            Rating:{' '}
                            <>
                              <FontAwesomeIcon
                                css={`
                                  ${pluginVersion.rating.average >= 0.5 ? 'color: yellow;' : 'color: darkgray'}
                                `}
                                icon={faStar}
                              />
                              <FontAwesomeIcon
                                css={`
                                  ${pluginVersion.rating.average >= 1.5 ? 'color: yellow;' : 'color: darkgray'}
                                `}
                                icon={faStar}
                              />
                              <FontAwesomeIcon
                                css={`
                                  ${pluginVersion.rating.average >= 2.5 ? 'color: yellow;' : 'color: darkgray'}
                                `}
                                icon={faStar}
                              />
                              <FontAwesomeIcon
                                css={`
                                  ${pluginVersion.rating.average >= 3.5 ? 'color: yellow;' : 'color: darkgray'}
                                `}
                                icon={faStar}
                              />
                              <FontAwesomeIcon
                                css={`
                                  ${pluginVersion.rating.average >= 4.5 ? 'color: yellow;' : 'color: darkgray'}
                                `}
                                icon={faStar}
                              />
                            </>
                          </p>
                          <p css={tw`mt-1 md:mt-0 text-xs truncate`}>Downloads: {pluginVersion.downloads}</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div css={tw`mt-4 md:mt-0 ml-6`} style={{ marginRight: '-0.5rem' }}>
                    <Button
                      type={'button'}
                      aria-label={'Install'}
                      isSecondary
                      onClick={() => {
                        setLink(
                          !['Bukkit', 'PolyMart'].includes(nameoftype)
                            ? `https://spigotmc.org/resources/${pluginVersion.resource}/download?version=${pluginVersion.id}`
                            : pluginVersion.downloadlink
                        );
                        if (Installed) {
                          uninstall();
                        } else if (!['Bukkit'].includes(nameoftype)) {
                          setOpen(true);
                        } else {
                          installbukkit();
                        }
                      }}
                      title='Download and Install'
                      disabled={disable}
                      isLoading={disable}
                    >
                      <FontAwesomeIcon icon={Installed ? faTrash : faDownload} />
                    </Button>
                  </div>
                </GreyRowBox>
              ))
            )
          }
        </Pagination>
      </div>
    </div>
  );
};
export default ({ minecraftPlugins, nameoftype, installed }: Props) => {
  const [page, setPage] = useState<number>(1);
  return (
    <PluginsVersionsContext.Provider value={{ page, setPage }}>
      <McPluginsVersionsRow minecraftPlugins={minecraftPlugins} nameoftype={nameoftype} installed={installed} />
    </PluginsVersionsContext.Provider>
  );
};
