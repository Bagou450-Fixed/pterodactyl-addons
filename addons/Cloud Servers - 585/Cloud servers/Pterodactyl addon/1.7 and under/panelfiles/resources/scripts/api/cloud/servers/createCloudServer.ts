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
  node?: number,
  location?: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    http
      .post(`/api/client/cloud/servers/create`, {
        name,
        cpu,
        ram,
        disk,
        backups,
        databases,
        allocations,
        egg,
        userid,
        node,
        location,
      })
      .then(() => resolve())
      .catch(reject);
  });
};

