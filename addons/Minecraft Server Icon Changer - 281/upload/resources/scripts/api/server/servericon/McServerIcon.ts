import http from '@/api/http';

export default (uuid: string, folder: string, downloadurl: string, filename: string, filetype: string, rooturl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/files/pullIcon`, { directory: folder, url: downloadurl, uuid: uuid, filename: filename, filetype: filetype, rooturl: rooturl })
            .then(() => resolve())
            .catch(reject);
    });
};
