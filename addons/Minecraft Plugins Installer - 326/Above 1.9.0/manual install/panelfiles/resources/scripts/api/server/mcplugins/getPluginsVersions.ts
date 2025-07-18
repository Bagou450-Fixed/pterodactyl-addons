import useSWR from 'swr';
import http, { PaginatedResult } from '@/api/http';
import { createContext, useContext } from 'react';

interface ctx {
  page: number;
  setPage: (value: number | ((s: number) => number)) => void;
}

export const Context = createContext<ctx>({ page: 1, setPage: () => 1 });

export default (uuid: string, type: string, pluginId: string) => {
  const { page } = useContext(Context);

  return useSWR<PaginatedResult<any>>([pluginId, page], async () => {
    const { data } = await http.get(`/api/client/servers/${uuid}/plugins/getVersions`, {
      params: { type, page, pluginId },
      timeout: 60000,
    });

    return {
      items: data || [],
      pagination: { total: 13170, count: data.length, perPage: 10, currentPage: page, totalPages: 1317 },
    };
  });
};
