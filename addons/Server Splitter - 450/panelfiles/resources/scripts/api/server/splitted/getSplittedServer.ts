import useSWR from 'swr';
import http from '@/api/http';

interface Response {
    master: string;
    servers: [];
    splitted: boolean;
    splitlimit: number
    total: {
        cpu: number;
        disk: number;
        memory: number;
        swap: number;
    };
    totalall: {
        cpu: number;
        disk: number;
        memory: number;
        swap: number;
    };
}

export default (uuid: string) => useSWR([ uuid, '/splitted' ], async (): Promise<Response> => {
    const { data } = await http.get(`/api/client/servers/${uuid}/splitted`);

    return { master: data.data.master, servers: data.data.servers, splitted: data.data.splitted, splitlimit: data.data.split_limit, total: data.data.total, totalall: data.data.totalall || [] };
}, { errorRetryCount: 3 });
