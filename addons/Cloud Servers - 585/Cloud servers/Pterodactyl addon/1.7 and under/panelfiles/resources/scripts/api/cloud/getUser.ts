import http, { FractalResponseData } from '@/api/http';

export interface CloudUsers {
  id: string;
  uuid: string;
  username: string;
  email: string;
  image: string;
  twoFactorEnabled: boolean;
  createdAt: Date;
  cloud: boolean;
  first: string;
  last: string;
}
export const rawDataToCloudUsersObject = ({ attributes: data }: FractalResponseData): CloudUsers => ({
  id: data.identifier,
  uuid: data.uuid,
  username: data.username,
  email: data.email,
  image: data.image,
  twoFactorEnabled: data.twoFactorEnabled,
  createdAt: data.created_at,
  cloud: data.cloud,
  first: data.name_first,
  last: data.name_last,
});

export default (uuid: string): Promise<[CloudUsers, string[]]> => {
  return new Promise((resolve, reject) => {
    http
      .get(`/api/client/servers/${uuid}`)
      .then(({ data }) =>
        resolve([
          rawDataToCloudUsersObject(data),
          // eslint-disable-next-line camelcase
          data.meta?.is_server_owner ? ['*'] : data.meta?.user_permissions || [],
        ])
      )
      .catch(reject);
  });
};
