import http from '@/api/http';

export default async (uuid: string, url: string) => {
    const { data } = await http.post(`/api/client/servers/${uuid}/files/fileSize`, { url });

    return (data || 0);
};
