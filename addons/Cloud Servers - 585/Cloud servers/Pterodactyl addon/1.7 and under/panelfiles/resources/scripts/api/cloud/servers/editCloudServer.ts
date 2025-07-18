import http from '@/api/http';

export default (
  name: string,
  cpu: number,
  ram: number,
  disk: number,
  backups: number,
  databases: number,
  allocations: number,
  egg: number,
  userid: string,
  uuid: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    http
      .post(`/api/client/cloud/servers/edit`, {
        name,
        cpu,
        ram,
        disk,
        backups,
        databases,
        allocations,
        egg,
        userid,
        uuid,
      })
      .then(() => resolve())
      .catch(reject);
  });
};
