import http from '@/api/http';

export default async (uuid: string, name: string, modpack: any, type: string, step?: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    http
      .post(`/api/client/servers/${uuid}/mcmodpacks/install`, { name, type, modpack, step })
      .then((data) => resolve(data.data))
      .catch(reject);
  });
};
