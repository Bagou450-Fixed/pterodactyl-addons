import React, { useContext, useEffect, useState } from 'react';
import Spinner from '@/components/elements/Spinner';
import useFlash from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import McPluginsRow from './McPluginsRow';
import { ServerContext } from '@/state/server';
import getMinecraftPlugins, { Context as ServerPluginsContext } from '@/api/server/mcplugins/getMinecraftPlugins';
import { Form, Formik } from 'formik';
import Field from '@/components/elements/Field';
import { object, string } from 'yup';
import Pagination from '@/components/elements/Pagination';
import UploadButton from './UploadButton';
import { useParams } from 'react-router-dom';
import Select from '@/components/elements/Select';
import getMinecraftVersions from '@/api/server/mcplugins/getMinecraftVersions';
interface Values {
  search: string;
}
interface ParamTypes {
  name: string;
  type: string;
  category: string;
}

const McPluginsSpigotContainer = () => {
  const custom = false;

  const { clearFlashes, clearAndAddHttpError } = useFlash();
  let { name, type, category } = useParams<ParamTypes>();
  if (name === undefined) {
    name = 'Spigot';
    type = '1';
    category = '4';
  }
  const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
  const serverId = ServerContext.useStoreState((state) => state.server.data!.id);
  const { page, setPage, searchFilter, setSearchFilter, version, setVersion } = useContext(ServerPluginsContext);
  const { data: minecraftPlugins, error, isValidating } = getMinecraftPlugins(type, category, uuid);
  const [versions, setVersions] = useState([{ id: 1 }]);
  if (versions.length === 1) {
    getMinecraftVersions(uuid, name)
      .then((data) => {
        setVersions(data);
      })
      .catch((e) => {
        clearAndAddHttpError({ error: e, key: 'minecraftMcMods' });
      });
  }
  const submit = ({ search }: Values) => {
    clearFlashes('server:minecraftMcPlugins' + name);
    setSearchFilter(search);
  };
  useEffect(() => {
    if (!error) {
      clearFlashes('server:minecraftMcPlugins' + name);

      return;
    }
    clearAndAddHttpError({ error, key: 'server:minecraftMcPlugins' + name });
  }, [error]);

  if (!minecraftPlugins || (error && isValidating)) {
    return (
      <ServerContentBlock title={'Minecraft ' + name}>
        <div css={tw`flex flex-wrap mb-4 gap-4`}>
          <UploadButton css={tw`w-full sm:w-2/12 inset-x-0 bottom-0 mt-6`} />
          <div css={tw`w-full sm:w-5/12 sm:mt-0 mt-2`}>
            <Formik
              onSubmit={submit}
              initialValues={{
                search: searchFilter,
              }}
              validationSchema={object().shape({
                search: string().optional().min(1),
              })}
            >
              <Form>
                <Field id={'search'} name={'search'} label={'Search'} type={'text'} />
              </Form>
            </Formik>
          </div>
          {versions[0].id !== -1 && (
            <Select
              css={tw`w-full sm:w-1/6 inset-x-0 bottom-0 mt-6`}
              onChange={(e) => setVersion(e.target.value)}
              defaultValue={version}
            >
              <option value={''}>All Versions</option>
              {versions.length !== 1 &&
                versions.map((item, index) => {
                  return (
                    <option value={item.id} key={index}>
                      {item.id}
                    </option>
                  );
                })}
            </Select>
          )}
          <Select
            css={
              versions[0].id !== -1
                ? tw`w-full sm:w-1/6 inset-x-0 bottom-0 mt-6`
                : tw`w-full sm:w-2/6 inset-x-0 bottom-0 mt-6`
            }
            onChange={(e) => location.replace(`/server/${serverId}/plugins/${e.target.value}`)}
            defaultValue={`${name}/${type}/${category}`}
          >
            <option key={0} value={'Spigot/1/4'}>
              Spigot
            </option>
            <option key={1} value={'Bungeecord-Spigot/1/2'}>
              Bungeecord Spigot
            </option>
            <option key={2} value={'Bungeecord/1/3'}>
              Bungeecord
            </option>
            <option key={3} value={'Bukkit/2/-1'}>
              Bukkit
            </option>
            <option key={4} value={'PolyMart/3/-1'}>
              PolyMart
            </option>
            {custom && (
              <option key={5} value={'Others/4/-1'}>
                Others
              </option>
            )}

            <option key={6} value={'Installed/5/-1'}>
              Installed
            </option>
          </Select>
        </div>
        <Spinner size={'large'} centered />
      </ServerContentBlock>
    );
  }
  return (
    <ServerContentBlock title={'Minecraft ' + name}>
      <FlashMessageRender byKey={'server:minecraftMcPlugins' + name} css={tw`mb-4`} />
      <div css={tw`flex flex-wrap mb-4 gap-4`}>
        <UploadButton css={tw`w-full sm:w-2/12 inset-x-0 bottom-0 mt-6`} />
        <div css={tw`w-full sm:w-5/12 sm:mt-0 mt-2`}>
          <Formik
            onSubmit={submit}
            initialValues={{
              search: searchFilter,
            }}
            validationSchema={object().shape({
              search: string().optional().min(1),
            })}
          >
            <Form>
              <Field id={'search'} name={'search'} label={'Search'} type={'text'} />
            </Form>
          </Formik>
        </div>
        {versions[0].id !== -1 && (
          <Select
            css={tw`w-full sm:w-1/6 inset-x-0 bottom-0 mt-6`}
            onChange={(e) => setVersion(e.target.value)}
            defaultValue={version}
          >
            <option value={''}>All Versions</option>
            {versions.length !== 1 &&
              versions.map((item, index) => {
                return (
                  <option value={item.id} key={index}>
                    {item.id}
                  </option>
                );
              })}
          </Select>
        )}
        <Select
          css={
            versions[0].id !== -1
              ? tw`w-full sm:w-1/6 inset-x-0 bottom-0 mt-6`
              : tw`w-full sm:w-2/6 inset-x-0 bottom-0 mt-6`
          }
          onChange={(e) => location.replace(`/server/${serverId}/plugins/${e.target.value}`)}
          defaultValue={`${name}/${type}/${category}`}
        >
          <option key={0} value={'Spigot/1/4'}>
            Spigot
          </option>
          <option key={1} value={'Bungeecord-Spigot/1/2'}>
            Bungeecord Spigot
          </option>
          <option key={2} value={'Bungeecord/1/3'}>
            Bungeecord
          </option>
          <option key={3} value={'Bukkit/2/-1'}>
            Bukkit
          </option>
          <option key={4} value={'PolyMart/3/-1'}>
            PolyMart
          </option>
          {custom && (
            <option key={5} value={'Others/4/-1'}>
              Others
            </option>
          )}

          <option key={6} value={'Installed/5/-1'}>
            Installed
          </option>
        </Select>
      </div>
      <div css={tw`grid grid-cols-1 sm:grid-cols-2`}>
        <Pagination data={minecraftPlugins} customcss={tw`mt-4 flex justify-center col-span-2`} onPageSelect={setPage}>
          {({ items }) =>
            !items.length ? (
              <p css={tw`text-center text-sm text-neutral-300 col-span-2`}>
                {page > 1
                  ? "Looks like we've run out of minecraft plugins to show you, try going back a page."
                  : 'It looks like there are no minecraft plugins matching search criteria.'}
              </p>
            ) : (
              items.map((minecraftPlugins, index) => (
                <McPluginsRow
                  key={index}
                  category={category}
                  minecraftPlugins={minecraftPlugins}
                  uuid={uuid}
                  type={type}
                  nameoftype={name}
                  css={tw`mt-2 mr-2`}
                />
              ))
            )
          }
        </Pagination>
      </div>
    </ServerContentBlock>
  );
};

export default () => {
  const [page, setPage] = useState<number>(1);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [version, setVersion] = useState<string>('');

  return (
    <ServerPluginsContext.Provider value={{ page, setPage, searchFilter, setSearchFilter, version, setVersion }}>
      <McPluginsSpigotContainer />
    </ServerPluginsContext.Provider>
  );
};

