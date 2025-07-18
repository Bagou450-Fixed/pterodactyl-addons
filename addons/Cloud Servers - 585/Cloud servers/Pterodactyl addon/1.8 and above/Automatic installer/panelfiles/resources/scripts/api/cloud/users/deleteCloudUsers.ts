import http from '@/api/http';

export default (useruuid: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/api/client/cloud/users/delete`, {
        params: {
          useruuid,
        },
      })
      .then(() => resolve())
      .catch(reject);
  });
};
