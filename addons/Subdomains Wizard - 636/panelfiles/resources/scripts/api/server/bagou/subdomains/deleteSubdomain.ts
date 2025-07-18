import http from '@/api/http';

export default (uuid: string, data: number): Promise<any> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/client/servers/${uuid}/subdomains`, { data: { subdomain: data } })
            .then((data) => resolve(data))
            .catch(reject);
    });
};
