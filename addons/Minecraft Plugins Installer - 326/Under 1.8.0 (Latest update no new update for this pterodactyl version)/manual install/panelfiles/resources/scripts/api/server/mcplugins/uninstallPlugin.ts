import http from '@/api/http';

export default (uuid: string, plugin: string) => {
  return new Promise<void>((resolve, reject) => {
    http
      .post(`/api/client/servers/${uuid}/plugins/uninstall`, { plugin })
      .then(() => resolve())
      .catch(reject);
  });
};

