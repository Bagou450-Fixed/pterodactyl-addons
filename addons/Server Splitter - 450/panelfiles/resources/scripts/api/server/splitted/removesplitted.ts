/* eslint-disable camelcase */
import http from '@/api/http';

export default (uuid: string, split_masteruuid: string, serveruuid: string) => {
    return new Promise<void>((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/splitted/splitremove`, { split_masteruuid, serveruuid }).then(() => resolve())
            .catch(reject);
    });
};
