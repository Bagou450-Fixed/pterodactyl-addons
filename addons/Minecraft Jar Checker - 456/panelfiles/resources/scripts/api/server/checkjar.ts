import http from '../http';

export default async (uuid: string, jar: string): Promise<boolean> => {
    const { data } = await http.get(`/api/client/servers/${uuid}/checkjar`, {
        params: {
            jar,
        },
    });

    return (data);
};
