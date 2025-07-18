import http from '@/api/http';

export default async (uuid: string, filename: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    http
      .get(`/api/client/servers/${uuid}/versions/getversionsize`, { params: { filename } })
      .then((data) => resolve(data.data))
      .catch(reject);
  });
};


