import http, { getPaginationSet, PaginatedResult } from '@/api/http';
import { CloudUsers, rawDataToCloudUsersObject } from './cloud/getUser';

interface QueryParams {
  query?: string;
  page?: number;
  type?: string;
}

export default ({ query, ...params }: QueryParams): Promise<PaginatedResult<CloudUsers>> => {
  return new Promise((resolve, reject) => {
    http
      .get('/api/client/cloud/users', {
        params: {
          'filter[*]': query,
          ...params,
        },
      })
      .then(({ data }) =>
        resolve({
          items: (data.data || []).map((datum: any) => rawDataToCloudUsersObject(datum)),
          pagination: getPaginationSet(data.meta.pagination),
        })
      )
      .catch(reject);
  });
};
