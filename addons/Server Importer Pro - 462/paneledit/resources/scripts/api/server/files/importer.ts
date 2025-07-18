import http from '@/api/http';

export default (uuid: string, user: string, password: string, hote: string, port: string, srclocation: string, dstlocation: string, wipe: boolean, type: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/files/importer`, {
            user,
            password,
            hote,
            port,
            srclocation,
            dstlocation,
            wipe,
            type,
        })
            .then(() => resolve())
            .catch(reject);
    });
};
