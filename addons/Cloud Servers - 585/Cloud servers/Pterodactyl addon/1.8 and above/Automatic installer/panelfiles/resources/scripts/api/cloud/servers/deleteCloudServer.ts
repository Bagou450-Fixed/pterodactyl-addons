import http from '@/api/http';

export default (serveruuid: string, useruuid: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/api/client/cloud/servers/delete`, {
        params: {
          serveruuid,
          useruuid,
        },
      })
      .then(() => resolve())
      .catch(reject);
  });
};
