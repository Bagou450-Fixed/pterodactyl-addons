import useSWR from 'swr';
import http, { getPaginationSet, PaginatedResult } from '@/api/http';
import { ServerBanIp } from '@/api/server/types';
import { rawDataToServerBanIP } from '@/api/transformers';
import { ServerContext } from '@/state/server';
import { createContext, useContext } from 'react';

interface ctx {
    page: number;
    setPage: (value: number | ((s: number) => number)) => void;
}

export const Context = createContext<ctx>({ page: 1, setPage: () => 1 });

export default () => {
    const { page } = useContext(Context);
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);

    return useSWR<PaginatedResult<ServerBanIp>>([ 'server:baniplist', uuid, page ], async () => {
        const { data } = await http.get(`/api/client/servers/${uuid}/baniplist`, { params: { page } });

        return ({
            items: (data.data || []).map(rawDataToServerBanIP),
            pagination: getPaginationSet(data.meta.pagination),
        });
    });
};
