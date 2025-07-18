import http from '@/api/http';

export default (uuid: string, folder: string, downloadurl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/files/pull`, { directory: folder, url: downloadurl })
            .then(() => resolve())
            .catch(reject);
    });
};
