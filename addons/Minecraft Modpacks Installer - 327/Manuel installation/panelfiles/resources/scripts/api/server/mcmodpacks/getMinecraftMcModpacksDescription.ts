import http from '@/api/http';

export default (uuid: string, modpackId: string, type: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    http
      .get(`/api/client/servers/${uuid}/mcmodpacks/description`, {
        params: {
          modpackId,
          type,
        },
      })
      .then(({ data }) => resolve(data))
      .catch(reject);
  });
};
