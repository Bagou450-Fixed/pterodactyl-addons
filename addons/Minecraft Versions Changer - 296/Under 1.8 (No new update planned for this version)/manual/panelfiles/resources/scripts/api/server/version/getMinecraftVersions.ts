import useSWR from 'swr';
import { createContext, useContext } from 'react';
import { ServerContext } from '@/state/server';
import http, { PaginatedResult } from '@/api/http';
interface ctx {
  page: number;
  setPage: (value: number | ((s: number) => number)) => void;
  searchFilter: string;
  setSearchFilter: (value: string | ((s: string) => string)) => void;
  versionsType: string;
  setVersionsType: (value: string | ((s: string) => string)) => void;
  modpacktype: string;
  setModpacktype: (value: string | ((s: string) => string)) => void;
}

export const MinecraftVersionsContext = createContext<ctx>({ page: 1, setPage: () => 1, searchFilter: '', setSearchFilter: () => '', modpacktype: 'curseforge', setModpacktype: () => '',versionsType: 'vanilla', setVersionsType: () => ''});

export default () => {
  const { page, searchFilter, modpacktype, versionsType } = useContext(MinecraftVersionsContext);
  const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
  return useSWR<PaginatedResult<any>>([ 'server:minecraftVersion',  page, searchFilter, modpacktype, versionsType ], async () => {
    console.log(versionsType)
    const { data } = await http.get(`/api/client/servers/${uuid}/versions/listversion`, {
      params: { versionsType, page, modpacktype },
      timeout: 60000,
    });

      return {
          items: (data.data || []),
          pagination: { total: data.page*16, count: data.data.length, perPage: 16, currentPage: page, totalPages: data.page },
      };
  });
};

