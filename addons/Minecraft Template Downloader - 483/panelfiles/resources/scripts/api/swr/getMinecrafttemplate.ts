import useSWR from 'swr';
import http from '@/api/http';

export default () => {
    return useSWR([ 'server:minecrafttemplate' ], async () => {
        const { data } = await http.get('/api/client/minecrafttemplate', { timeout: 60000 });

        return data;
    },);
};
