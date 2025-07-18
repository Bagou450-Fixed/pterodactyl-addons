import React, { useContext, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import tw from 'twin.macro';
import useFlash from '@/plugins/useFlash';
import GreyRowBox from '@/components/elements/GreyRowBox';
import { ServerContext } from '@/state/server';
import Button from '@/components/elements/Button';
import { ApplicationStore } from '@/state';
import { Actions, useStoreActions } from 'easy-peasy';
import Spinner from '@/components/elements/Spinner';
import Pagination from '@/components/elements/PaginationMcMods';
import getMinecraftMcModsVersions, {
  Context as ServerMcModsVersionsContext,
} from '@/api/server/mcmods/getMinecraftMcModsVersions';
import installMcMods from '@/api/server/mcmods/installMcMods';

interface Props {
  minecraftMcMods: any;
  type: string;
}

const McModsVersionsRow = ({ minecraftMcMods, type }: Props) => {
  const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
  const [loading, setLoading] = useState(false);
  const { page, setPage } = useContext(ServerMcModsVersionsContext);

  const { clearAndAddHttpError } = useFlash();
  const { addFlash, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

  const { data: MinecraftMcModsVersions, error, isValidating } = getMinecraftMcModsVersions(minecraftMcMods.id, type);
  console.log(MinecraftMcModsVersions);
  const installmod = (version: { downloadUrl: any; files: { url: any }[] }) => {
    clearFlashes();
    setLoading(true);
    const downloadurl = type !== 'modrinth' ? version.downloadUrl : version.files[0].url;

    installMcMods(uuid, minecraftMcMods.id, downloadurl)
      .then(() => {
        addFlash({
          key: minecraftMcMods.id,
          type: 'success',
          message: 'Mod installed successfully',
        });
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        clearAndAddHttpError({ key: minecraftMcMods.id, error });

        setLoading(false);
      });
  };
  return (
    <>
      {!MinecraftMcModsVersions || (error && isValidating) ? (
        <Spinner size='large' centered />
      ) : (
        <Pagination data={MinecraftMcModsVersions} onPageSelect={setPage} customcss={`grid grid-cols-2 gap-4`}>
          {({ items }) =>
            !items.length ? (
              <p css={tw`text-center text-sm text-neutral-300 col-span-2`}>
                {page > 1
                  ? "Looks like we've run out of minecraft mods to show you, try going back a page."
                  : 'It looks like there are no minecraft mods matching search criteria.'}
              </p>
            ) : (
              items.map((version, index) => (
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
                      <div css={tw`flex items-center text-sm mb-1`}>
                        {type !== 'modrinth' ? version.displayName : version.name}
                      </div>
                      <p css={tw`mt-1 md:mt-0 text-xs truncate`}>
                        Minecraft version:{' '}
                        {type !== 'modrinth' ? version.gameVersions.join(',') : version.game_versions.join(',')}
                      </p>
                      <p
                        css={tw`mt-1 md:mt-0 text-xs truncate`}
                        title={
                          type !== 'modrinth'
                            ? version.fileLength / 1000000 + 'mb'
                            : version.files[0].url / 1000000 + 'mb'
                        }
                      >
                        Size:{' '}
                        {type !== 'modrinth'
                          ? Math.round((version.fileLength / 1000000) * 100) / 100
                          : Math.round((version.files[0].size / 1000000) * 100) / 100}
                        mb
                      </p>
                    </div>
                  </div>

                  <div css={tw`mt-4 md:mt-0 ml-6`} style={{ marginRight: '-0.5rem' }}>
                    <Button
                      type={'button'}
                      aria-label={'Install'}
                      isSecondary
                      onClick={() => installmod(version)}
                      title='Download and Install'
                      disabled={type !== 'modrinth' ? !version.isAvailable : false}
                      isLoading={loading}
                    >
                      <FontAwesomeIcon icon={faDownload} />
                    </Button>
                  </div>
                </GreyRowBox>
              ))
            )
          }
        </Pagination>
      )}
    </>
  );
};
export default ({ minecraftMcMods, type }: Props) => {
  const [page, setPage] = useState<number>(1);

  return (
    <ServerMcModsVersionsContext.Provider value={{ page, setPage }}>
      <McModsVersionsRow key={minecraftMcMods.id} minecraftMcMods={minecraftMcMods} type={type} />
    </ServerMcModsVersionsContext.Provider>
  );
};

