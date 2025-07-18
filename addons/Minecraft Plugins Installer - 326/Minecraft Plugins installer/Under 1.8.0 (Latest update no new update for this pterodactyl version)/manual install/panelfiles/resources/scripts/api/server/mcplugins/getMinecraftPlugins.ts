import useSWR from 'swr';
import http, { PaginatedResult } from '@/api/http';
import { createContext, useContext } from 'react';

interface ctx {
  page: number;
  setPage: (value: number | ((s: number) => number)) => void;
  searchFilter: string;
  setSearchFilter: (value: string | ((s: string) => string)) => void;
  version: string;
  setVersion: (value: string | ((s: string) => string)) => void;
}

export const Context = createContext<ctx>({
  page: 1,
  setPage: () => 1,
  searchFilter: '',
  setSearchFilter: () => '',
  version: '',
  setVersion: () => '',
});

export default (type: string, category: string, uuid: string) => {
  const { page, searchFilter, version } = useContext(Context);

  return useSWR<PaginatedResult<any>>(['server:minecraftPlugins', page, searchFilter, version], async () => {
    const { data } = await http.get(`/api/client/servers/${uuid}/plugins`, {
      params: { size: 20, page: page, type, category, searchFilter, version },
      timeout: 60000,
    });

    return {
      items: data || [],
      pagination: { total: 13170, count: data.length, perPage: 20, currentPage: page, totalPages: 1317 },
    };
  });
};
