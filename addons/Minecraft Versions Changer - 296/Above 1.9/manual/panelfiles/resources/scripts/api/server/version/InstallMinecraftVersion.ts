import http from '@/api/http';

export default async (
  uuid: string,
  name: string,
  stype: string,
  minecraftVersions: any,
  type: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    http
      .post(`/api/client/servers/${uuid}/versions/installversion`, { name, type, minecraftVersions, stype })
      .then((data) => resolve(data.data))
      .catch(reject);
  });
};


