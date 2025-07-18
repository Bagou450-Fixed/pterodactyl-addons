import http from '@/api/http';

export default (uuid: string, ip: string, port: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/banip`, { ip: ip, port: port })
            .then(() => resolve())
            .catch(reject);
    });
};
