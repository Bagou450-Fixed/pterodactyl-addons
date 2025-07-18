import http from '@/api/http';

export default (uuid: string, plugin: string, url: string) => {
  return new Promise<void>((resolve, reject) => {
    http
      .post(`/api/client/servers/${uuid}/plugins/install`, {
        plugin,
        url,
      })
      .then(() => resolve())
      .catch(reject);
  });
};

