import http from '@/api/http';

export default async (file: File, uuid: string): Promise<any> => {
  const formData = new FormData();
  formData.append('image', file);
  return new Promise((resolve, reject) => {
    http
      .post(`/api/client/account/avatar`, formData, {
        params: {
          uuid,
        },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(({ data }) => resolve(data))
      .catch(reject);
  });
};

