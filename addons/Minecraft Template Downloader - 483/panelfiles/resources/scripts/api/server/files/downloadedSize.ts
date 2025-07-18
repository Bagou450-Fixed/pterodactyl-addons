import http from '@/api/http';

export default async (uuid: string, path: string) => {
    const { data } = await http.post(`/api/client/servers/${uuid}/files/downloadedSize`, { path });

    return (data || 0);
};
