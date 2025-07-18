import React, { useContext, useEffect, useState } from 'react';
import Spinner from '@/components/elements/Spinner';
import useFlash from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import McVersionsRow from './McVersionsRow';
import { ServerContext } from '@/state/server';
import getMinecraftVersions, { MinecraftVersionsContext } from '@/api/server/version/getMinecraftVersions';
import GreyRowBox from '@/components/elements/GreyRowBox';
import Select from '@/components/elements/Select';
import Pagination from '@/components/elements/PaginationMc';

const custom = false;

const VersionSelect = () => {
  const { versionsType, setVersionsType, setPage, modpacktype, setModpacktype } = useContext(MinecraftVersionsContext);
  return (
    <><p>
      <span css={tw`font-bold`}>Version selector</span>
      <br />
      Select the version you want to run your server with.
    </p><Select
      onChange={(e) => { console.log(e.target.value); setVersionsType(e.target.value); setPage(1); } }
      defaultValue={versionsType}
    >
        <option key={1} value={'vanilla'}>
          Vanilla
        </option>
        <option key={2} value={'snapshot'}>
          Snapshot
        </option>
        <option key={3} value={'spigot'}>
          Spigot
        </option>
        <option key={4} value={'paper'}>
          Paper
        </option>
        <option key={5} value={'purpur'}>
          Purpur
        </option>
        <option key={6} value={'sponge'}>
          Sponge
        </option>
        <option key={7} value={'bungeecord'}>
          Bungeecord
        </option>
        <option key={8} value={'waterfall'}>
          Waterfall
        </option>
        <option key={9} value={'velocity'}>
          Velocity
        </option>
        <option key={10} value={'forge'}>
          Forge
        </option>
        <option key={11} value={'fabric'}>
          Fabric
        </option>
        <option key={12} value={'mohist'}>
          Mohist
        </option>
        <option key={13} value={'magma'}>
          Magma
        </option>
        <option key={14} value={'catserver'}>
          Catserver
        </option>
        <option key={15} value={'modpacks'}>
          Modpacks
        </option>
        {custom && (
          <option key={16} value={'others'}>
            Others
          </option>
        )}
      </Select><div css={versionsType !== 'modpacks' ? tw`hidden` : tw`flex grid grid-cols-2 col-span-2`}>
        <p>
          Select the platform you want to search modpacks.
        </p>
        <Select
          onChange={(e) => { setModpacktype(e.target.value); setPage(1); } }
          defaultValue={modpacktype}
        >
          <option key={1} value={'curseforge'}>
            CurseForge
          </option>
          <option key={2} value={'technic'}>
            Technic Platform
          </option>
          <option key={3} value={'others'}>
            Others
          </option>
        </Select>
      </div></>
  )
}
const McVersionsVanillaContainer = () => {
  const { clearFlashes, clearAndAddHttpError } = useFlash();
  const mcversion = ServerContext.useStoreState((state) => state.server.data!.mcversion);
  const { data: minecraftVersions, error, isValidating } = getMinecraftVersions();
  const { versionsType, setPage, modpacktype } = useContext(MinecraftVersionsContext);

  useEffect(() => {
    if (!error) {
      clearFlashes('server:minecraftVersion');

      return;
    }

    clearAndAddHttpError({ error, key: 'server:minecraftVersion' });
  }, [error]);
  if (!minecraftVersions || (error && isValidating)) {
    return <Spinner size={'large'} centered />;
  }
  return (
    <ServerContentBlock title={'Minecraft Version ' + versionsType}>
      <FlashMessageRender byKey={'server:minecraftVersion'} css={tw`mb-2`} />
      {mcversion !== null && (
        <p css={tw`text-lg text-center mb-2`}>
          Current version: <span css={tw`text-cyan-600`}>{mcversion.charAt(0).toUpperCase() + mcversion.slice(1)}</span>
        </p>
      )}

        <Pagination data={minecraftVersions} onPageSelect={setPage} custompage={'grid grid-cols-1 md:grid-cols-3'} customcss={tw`md:col-span-3`}> 
          {({ items }) =>
            !items.length ? (
              <>
                <GreyRowBox css={tw`grid grid-cols-2 col-span-2 mt-2 mr-2`}>
                  <VersionSelect/>
                </GreyRowBox>
                <p css={tw`text-center text-sm text-neutral-300 col-span-3`}>Can&apos;t find any version on the server</p>
              </>
            ) : (
              <>
                <GreyRowBox css={tw`grid grid-cols-2 col-span-2 mt-2 mr-2`}>
                  <VersionSelect/>
                </GreyRowBox>
        {items.map((minecraftVersions, index) => (
                <McVersionsRow
                  key={index}
                  minecraftVersions={minecraftVersions}
                  type={versionsType}
                  stype={versionsType}
                  modpacktype={modpacktype}
                  css={tw`mt-2 mr-2`}
                />
              ))}
              </>
            )
          }
        </Pagination>
    </ServerContentBlock>
  );
};

export default () => {
  const [ page, setPage ] = useState<number>(1);
  const [ searchFilter, setSearchFilter ] = useState<string>('');
  const [ versionsType, setVersionsType ] = useState<string>('vanilla');
  const [ modpacktype, setModpacktype ] = useState<string>('curseforge');

  return (
      <MinecraftVersionsContext.Provider value={{ page, setPage, searchFilter, setSearchFilter, modpacktype, setModpacktype, versionsType, setVersionsType }}>
          <McVersionsVanillaContainer/>
      </MinecraftVersionsContext.Provider>
  );
};


