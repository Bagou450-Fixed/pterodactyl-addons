import http from '@/api/http';

export default (
  email: string,
  username: string,
  first: string,
  last: string,
  useruuid: string,
  password?: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    http
      .post(`/api/client/cloud/users/edit`, {
        email,
        username,
        first,
        last,
        password,
        useruuid,
      })
      .then(() => resolve())
      .catch(reject);
  });
};
