import http from '@/api/http';

export default (serveruuid: string, useruuid: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    http
      .post(`/api/client/cloud/servers/suspend`, {
        serveruuid,
        useruuid,
      })
      .then(() => resolve())
      .catch(reject);
  });
};
