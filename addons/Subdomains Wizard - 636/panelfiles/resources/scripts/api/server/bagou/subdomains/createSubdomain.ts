import http from '@/api/http';

export default (uuid: string, record: number, data: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/subdomains`, { record, data })
            .then((data) => resolve(data))
            .catch(reject);
    });
};
