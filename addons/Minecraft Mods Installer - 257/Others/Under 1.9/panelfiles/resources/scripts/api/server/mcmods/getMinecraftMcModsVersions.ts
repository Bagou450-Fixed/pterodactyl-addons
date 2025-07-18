import useSWR from 'swr';
import http, { PaginatedResult } from '@/api/http';
import { createContext, useContext } from 'react';
import { ServerContext } from '@/state/server';

interface ctx {
  page: number;
  setPage: (value: number | ((s: number) => number)) => void;
}

export const Context = createContext<ctx>({ page: 1, setPage: () => 1 });

export default (modId: string, type: string) => {
  const { page } = useContext(Context);
  const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);

  return useSWR<PaginatedResult<any>>([modId, page, type], async () => {
    const { data } = await http.get(`/api/client/servers/${uuid}/mods/versions`, {
      params: { page, modId, type },
      timeout: 60000,
    });

    return {
      items: data || [],
      pagination: { total: 13170, count: data.length, perPage: 5, currentPage: page, totalPages: 1317 },
    };
  });
};
