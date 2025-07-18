import http from '@/api/http';

export default (uuid: string, modId: string, url: string) => {
  return new Promise<void>((resolve, reject) => {
    http
      .post(`/api/client/servers/${uuid}/mods/install`, {
        url,
        modId,
      })
      .then(() => resolve())
      .catch(reject);
  });
};
