import http from '@/api/http';

export default (uuid: string, user: string, password: string, hote: string, port: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/files/importer`, { user: user, password: password, hote: hote, port: port })
            .then(() => resolve())
            .catch(reject);
    });
};
