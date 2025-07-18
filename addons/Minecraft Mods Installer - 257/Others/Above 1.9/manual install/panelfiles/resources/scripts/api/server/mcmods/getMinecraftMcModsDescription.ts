import http from '@/api/http';

export default (uuid: string, modId: string, type: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    http
      .get(`/api/client/servers/${uuid}/mods/description`, {
        params: {
          modId,
          type,
        },
      })
      .then(({ data }) => resolve(data))
      .catch(reject);
  });
};
