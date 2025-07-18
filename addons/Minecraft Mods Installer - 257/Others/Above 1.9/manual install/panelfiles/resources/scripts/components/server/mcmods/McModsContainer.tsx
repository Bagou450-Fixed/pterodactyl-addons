import React, { useContext, useEffect, useState } from 'react';
import Spinner from '@/components/elements/Spinner';
import useFlash from '@/plugins/useFlash';
import { Form, Formik } from 'formik';
import McModsRow from '@/components/server/mcmods/McModsRow';
import tw from 'twin.macro';
import Field from '@/components/elements/Field';
import { object, string } from 'yup';
import getMinecraftMcMods, { Context as ServerMcModsContext } from '@/api/server/mcmods/getMinecraftMcMods';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Pagination from '@/components/elements/PaginationMcMods';
import Select from '@/components/elements/Select';
import getMinecraftVersions from '@/api/server/mcmods/getMinecraftVersions';
import { ServerContext } from '@/state/server';

interface Values {
  search: string;
}

const McModsContainer = () => {
  const { page, setPage, searchFilter, setSearchFilter, type, setType, version, setVersion, loader, setLoader } =
    useContext(ServerMcModsContext);
  const { clearFlashes, clearAndAddHttpError } = useFlash();
  const { data: minecraftMcMods, error, isValidating } = getMinecraftMcMods();
  const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
  const submit = ({ search }: Values) => {
    clearFlashes('minecraftMcMods');
    setSearchFilter(search);
  };
  useEffect(() => {
    if (!error) {
      clearFlashes('minecraftMcMods');

      return;
    }

    clearAndAddHttpError({ error, key: 'minecraftMcMods' });
  }, [error]);
  const [versions, setVersions] = useState([{ id: 1 }]);
  if (versions.length === 1) {
    getMinecraftVersions(uuid)
      .then((data) => {
        setVersions(data);
      })
      .catch((e) => {
        clearAndAddHttpError({ error: e, key: 'minecraftMcMods' });
      });
  }
  if (!minecraftMcMods || (error && isValidating) || versions.length === 1) {
    return <Spinner size={'large'} centered />;
  }
  return (
    <ServerContentBlock title={'Minecraft Mods'} css={tw`bg-transparent`}>
      <div css={tw`flex gap-4 mb-4`}>
        <div css={tw`w-full sm:w-3/6 gap-4`}>
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
        <Select
          css={tw`w-full sm:w-1/6 inset-x-0 bottom-0 mt-6`}
          onChange={(e) => setType(e.target.value)}
          defaultValue={type}
        >
          <option value={'curseforge'}>Curseforge</option>
          <option value={'modrinth'}>Modrinth</option>
        </Select>
        <Select
          css={
            type === 'curseforge' && version === ''
              ? tw`w-full sm:w-2/6 inset-x-0 bottom-0 mt-6`
              : tw`w-full sm:w-1/6 inset-x-0 bottom-0 mt-6`
          }
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
        {type === 'modrinth' && (
          <Select
            css={tw`w-full sm:w-1/6 inset-x-0 bottom-0 mt-6`}
            onChange={(e) => setLoader(e.target.value)}
            defaultValue={loader}
          >
            <option value={''}>All Loaderes</option>
            <option value={'forge'}>Forge</option>
            <option value={'fabric'}>Fabric</option>
          </Select>
        )}
        {type === 'curseforge' && version !== '' && (
          <Select
            css={tw`w-full sm:w-1/6 inset-x-0 bottom-0 mt-6`}
            onChange={(e) => setLoader(e.target.value)}
            defaultValue={loader}
          >
            <option value={''}>All Loaderes</option>
            <option value={'forge'}>Forge</option>
            <option value={'fabric'}>Fabric</option>
          </Select>
        )}
      </div>
      <Pagination data={minecraftMcMods} onPageSelect={setPage} customcss={`grid grid-cols-2 gap-4`}>
        {({ items }) =>
          !items.length ? (
            <p css={tw`text-center text-sm text-neutral-300 col-span-2`}>
              {page > 1
                ? "Looks like we've run out of minecraft mods to show you, try going back a page."
                : 'It looks like there are no minecraft mods matching search criteria.'}
            </p>
          ) : (
            items.map((minecraftMcMods) => (
              <McModsRow key={minecraftMcMods.id} minecraftMcMods={minecraftMcMods} type={type} />
            ))
          )
        }
      </Pagination>
    </ServerContentBlock>
  );
};

export default () => {
  const [page, setPage] = useState<number>(1);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [type, setType] = useState<string>('curseforge');
  const [version, setVersion] = useState<string>('');
  const [loader, setLoader] = useState<string>('');

  return (
    <ServerMcModsContext.Provider
      value={{ page, setPage, searchFilter, setSearchFilter, type, setType, version, setVersion, loader, setLoader }}
    >
      <McModsContainer />
    </ServerMcModsContext.Provider>
  );
};

