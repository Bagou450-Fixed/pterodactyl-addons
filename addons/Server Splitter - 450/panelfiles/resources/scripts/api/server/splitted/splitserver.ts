/* eslint-disable camelcase */
import http from '@/api/http';

export default (uuid: string, cpu: number, ram: number, disk: number, swap: number, name: string, subuser: boolean) => {
    return new Promise<void>((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/splitted/split`, { cpu, ram, disk, swap, name, subuser }).then(() => resolve())
            .catch(reject);
    });
};
