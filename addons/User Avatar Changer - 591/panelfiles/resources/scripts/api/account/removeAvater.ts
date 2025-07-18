import http from '@/api/http';

export default (uuid: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/api/client/account/avatar`, {
        params: { uuid },
      })
      .then(({ data }) => resolve(data))
      .catch(reject);
  });
};

