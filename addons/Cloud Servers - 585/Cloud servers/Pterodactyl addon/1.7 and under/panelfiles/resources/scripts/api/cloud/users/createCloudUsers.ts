import http from '@/api/http';

export default (email: string, username: string, first: string, last: string, password?: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    http
      .post(`/api/client/cloud/users/create`, {
        email,
        username,
        first,
        last,
        password,
      })
      .then(() => resolve())
      .catch(reject);
  });
};
