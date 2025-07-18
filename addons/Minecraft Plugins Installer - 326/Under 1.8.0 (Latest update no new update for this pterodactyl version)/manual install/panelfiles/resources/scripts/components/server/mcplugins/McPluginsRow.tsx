import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faExternalLinkAlt, faListAlt, faStar, faTrash } from '@fortawesome/free-solid-svg-icons';
import tw from 'twin.macro';
import useFlash from '@/plugins/useFlash';
import GreyRowBox from '@/components/elements/GreyRowBox';
import Button from '@/components/elements/Button';
import deleteFiles from '@/api/server/files/deleteFiles';
import { ApplicationStore } from '@/state';
import { Actions, useStoreActions } from 'easy-peasy';
import installPlugin from '@/api/server/mcplugins/installPlugin';
import uninstallPlugin from '@/api/server/mcplugins/uninstallPlugin';
import Modal from '@/components/elements/Modal';
import McPluginsVersionsRow from './McPluginsVersionsRow';
import FlashMessageRender from '@/components/FlashMessageRender';
import { formatDistanceToNow } from 'date-fns';
import getMinecraftPlugins from '@/api/server/mcplugins/getMinecraftPlugins';

interface Props {
  minecraftPlugins: any;
  className?: string;
  uuid: string;
  type: string;
  category: string;
  nameoftype: string;
}

export default ({ minecraftPlugins, className, uuid, type, category, nameoftype }: Props) => {
  const { clearAndAddHttpError } = useFlash();
  const [disable, setDisable] = useState(false);
  const [Installed, setInstalled] = useState(type === '4' ? 1 : minecraftPlugins.installed);
  const { addFlash, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);
  const { mutate } = getMinecraftPlugins(type, category, uuid);

  let iconurl = 'https://static.spigotmc.org/styles/spigot/xenresource/resource_icon.png';
  if (type !== '5') {
    if (type === '3') {
      iconurl = minecraftPlugins.thumbnailURL;
      minecraftPlugins.name = minecraftPlugins.title;
      minecraftPlugins.file = { type: 'internal' };
      minecraftPlugins.testedVersions = minecraftPlugins.supportedMinecraftVersions;
      minecraftPlugins.tag = minecraftPlugins.subtitle;
      minecraftPlugins.rating = { average: minecraftPlugins.averageReview };
      minecraftPlugins.downloadlink = `polymart-${minecraftPlugins.id}`;
    } else if (minecraftPlugins.icon.url !== '' && minecraftPlugins.icon.url !== undefined) {
      iconurl = type === '1' ? 'https://www.spigotmc.org/' + minecraftPlugins.icon.url : minecraftPlugins.icon.url;
    }
  }
  const [visible, setVisible] = useState(false);
  const testedVersions = [];

  for (const versions in minecraftPlugins.testedVersions) {
    testedVersions.push(minecraftPlugins.testedVersions[versions]);
  }
  const install = () => {
    clearFlashes();
    setDisable(true);
    if (minecraftPlugins.file.type === 'external') {
      addFlash({
        key: 'server:minecraftMcPlugins' + nameoftype,
        type: 'warning',
        message:
          "This plugins can't be installed because the plugins files was not on spigotmc please install it manualy from this url https://www.spigotmc.org/" +
          minecraftPlugins.file.url +
          '. You can also see if this plugins are on bukkit with the bukkit tab.',
      });
      setDisable(false);
      mutate();
    } else {
      installPlugin(
        uuid,
        minecraftPlugins.name,
        type === '1'
          ? `https://cdn.spiget.org/file/spiget-resources/${minecraftPlugins.id}.jar`
          : minecraftPlugins.downloadlink
      )
        .then(() => {
          addFlash({
            key: 'server:minecraftMcPlugins' + nameoftype,
            type: 'success',
            message: 'Plugins installed successfully',
          });
          setDisable(false);
          setInstalled(1);
          mutate();
        })
        .catch(function (error) {
          setDisable(false);
          addFlash({
            key: 'server:minecraftMcPlugins' + nameoftype,
            type: 'error',
            message: `This plugin has too large a size, it must be installed manually (${error})`,
          });
          mutate();
        });
    }
  };
  const uninstall = () => {
    clearFlashes();
    setDisable(true);
    if (minecraftPlugins.file.type === 'external') {
      addFlash({
        key: 'server:minecraftMcPlugins' + nameoftype,
        type: 'warning',
        message:
          "This plugins can't be removed because the plugins files was not on spigotmc please remove it manualy ",
      });
      mutate();
      setDisable(false);
    } else {
      deleteFiles(uuid, '/plugins', [`${minecraftPlugins.name}.jar`])
        .then(() => {
          uninstallPlugin(uuid, minecraftPlugins.name)
            .then(() => {
              addFlash({
                key: 'server:minecraftMcPlugins' + nameoftype,
                type: 'success',
                message: 'Plugins removed successfully',
              });
              setDisable(false);
              setInstalled(0);
              mutate();
            })
            .catch(function (error) {
              setDisable(false);
              clearAndAddHttpError({ key: 'minecraftMcPlugins', error });
            });
        })
        .catch(function (error) {
          setDisable(false);
          mutate();
          clearAndAddHttpError({ key: 'minecraftMcPlugins', error });
        });
    }
  };
  return (
    <GreyRowBox
      css={tw`flex-wrap md:flex-nowrap items-center grid grid-cols-2 sm:grid-rows-1 sm:flex`}
      className={className}
    >
      {['1', '2', '3'].includes(type) && (
        <Modal visible={visible} onDismissed={() => setVisible(false)}>
          <FlashMessageRender byKey={type === '1' ? minecraftPlugins.id : minecraftPlugins.name} css={tw`mb-4`} />
          <McPluginsVersionsRow minecraftPlugins={minecraftPlugins} nameoftype={nameoftype} installed={Installed} />
        </Modal>
      )}
      <div css={tw`flex items-center truncate md:w-full md:flex-1 `}>
        <div css={tw`flex flex-col truncate`}>
          <div
            css={tw`flex items-center text-sm mb-1 cursor-pointer `}
            onClick={() =>
              window.open(
                type === '1'
                  ? `https://spigotmc.org/resources/bagou.${minecraftPlugins.id}`
                  : type === '3'
                  ? minecraftPlugins.url
                  : type === '2' && minecraftPlugins.links.discussion,
                '_blank'
              )
            }
          >
            <img
              css={tw`w-10 h-10 rounded-lg`}
              alt={minecraftPlugins.name}
              src={iconurl}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                currentTarget.src = 'https://static.spigotmc.org/styles/spigot/xenresource/resource_icon.png';
              }}
            />

            <p css={tw`ml-2`}>
              {minecraftPlugins.name}
              <br />
              {['1', '3'].includes(type) && (
                <>
                  <FontAwesomeIcon
                    css={`
                      ${minecraftPlugins.rating.average >= 0.5 ? 'color: yellow;' : 'color: darkgray'}
                    `}
                    icon={faStar}
                  />
                  <FontAwesomeIcon
                    css={`
                      ${minecraftPlugins.rating.average >= 1.5 ? 'color: yellow;' : 'color: darkgray'}
                    `}
                    icon={faStar}
                  />
                  <FontAwesomeIcon
                    css={`
                      ${minecraftPlugins.rating.average >= 2.5 ? 'color: yellow;' : 'color: darkgray'}
                    `}
                    icon={faStar}
                  />
                  <FontAwesomeIcon
                    css={`
                      ${minecraftPlugins.rating.average >= 3.5 ? 'color: yellow;' : 'color: darkgray'}
                    `}
                    icon={faStar}
                  />
                  <FontAwesomeIcon
                    css={`
                      ${minecraftPlugins.rating.average >= 4.5 ? 'color: yellow;' : 'color: darkgray'}
                    `}
                    icon={faStar}
                  />
                </>
              )}
              {type === '2' && <span css={tw`text-neutral-500`}>By {minecraftPlugins.author}</span>}
            </p>
          </div>
          {Installed === 1 ? (
            minecraftPlugins.installdate ? (
              <p css={tw`text-sm mt-2`}>Installed the {minecraftPlugins.installdate}</p>
            ) : (
              <p css={tw`text-sm mt-2`}>Installed today</p>
            )
          ) : (
            <>
              {minecraftPlugins.premium ? (
                <p css={tw`mt-1 md:mt-0 text-xs truncate text-yellow-500`}>PREMIUM ADDON</p>
              ) : (
                <>
                  {minecraftPlugins.file.type === 'external' ? (
                    <p css={tw`mt-1 md:mt-0 text-xs truncate text-yellow-500`}>EXTERNAL DOWNLOAD</p>
                  ) : (
                    <p css={tw`mt-1 md:mt-0 text-xs truncate cursor-help`} title={minecraftPlugins.tag}>
                      {minecraftPlugins.tag}
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
      {['1', '3'].includes(type) && (
        <div
          css={tw`flex-1 hidden md:block md:flex-none md:ml-5 md:w-48 mt-4 md:mt-0 md:text-center cursor-help`}
          title={`Versions: ${type === '3' ? testedVersions : minecraftPlugins.testedVersions.join()}`}
        >
          <p css={tw`text-2xs text-neutral-500 uppercase mt-1`}>Versions</p>
          {type === '3' ? (
            <p>{testedVersions}</p>
          ) : (
            <>
              <p>From: {testedVersions[0]}</p>
              <p>To: {testedVersions[testedVersions.length - 1]}</p>
            </>
          )}
        </div>
      )}
      {type === '2' && (
        <div
          css={tw`flex-1 hidden md:block md:flex-none md:ml-5 md:w-48 mt-4 md:mt-0 md:text-center cursor-help`}
          title={minecraftPlugins.updatedate}
        >
          <p css={tw`text-2xs text-neutral-500 uppercase mt-1`}>Update Date</p>
          <p>
            {formatDistanceToNow(Date.parse(minecraftPlugins.updatedate), {
              includeSeconds: true,
              addSuffix: true,
            })}
          </p>
        </div>
      )}
      <div css={tw`mt-4 md:mt-0 ml-6`} style={{ marginRight: '-0.5rem' }}>
        <>
          {minecraftPlugins.file.type === 'external' || minecraftPlugins.premium ? (
            <Button
              type={'button'}
              color={'primary'}
              onClick={() => {
                window.open(`https://spigotmc.org/resources/bagou.${minecraftPlugins.id}`);
              }}
              title={'Go to'}
              disabled={disable}
              isLoading={disable}
            >
              <FontAwesomeIcon icon={faExternalLinkAlt} /> Go to
            </Button>
          ) : type === '5' ? (
            <Button
              type={'button'}
              color={'red'}
              css={tw`mb-2`}
              onClick={() => {
                uninstall();
              }}
              title={'Uninstall'}
              disabled={disable}
              isLoading={disable}
            >
              <FontAwesomeIcon icon={faTrash} /> Uninstall
            </Button>
          ) : (
            <div css={['1', '2'].includes(type) ? tw`grid grid-rows-2` : tw`grid`}>
              <Button
                type={'button'}
                color={Installed === 0 ? 'green' : 'red'}
                css={tw`mb-2`}
                onClick={() => {
                  if (Installed === 0) {
                    install();
                  } else {
                    uninstall();
                  }
                }}
                title={Installed === 0 ? 'Install' : 'Uninstall'}
                disabled={disable}
                isLoading={disable}
              >
                <FontAwesomeIcon icon={Installed === 1 ? faTrash : faDownload} />{' '}
                {Installed === 1 ? 'Uninstall' : 'Install'}
              </Button>
              {['1', '2', '3'].includes(type) && (
                <Button
                  type={'button'}
                  color={'primary'}
                  css={tw`mt-2`}
                  onClick={() => setVisible(true)}
                  title={'View'}
                  disabled={disable}
                  isLoading={disable}
                >
                  <FontAwesomeIcon icon={faListAlt} /> View
                </Button>
              )}
            </div>
          )}
        </>
      </div>
    </GreyRowBox>
  );
};

