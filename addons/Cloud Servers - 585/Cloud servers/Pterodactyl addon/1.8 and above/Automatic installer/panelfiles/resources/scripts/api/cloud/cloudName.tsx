import http from '@/api/http';

export interface CloudName {
  name: string;
  img: string;
  footer: string;
  footerlink: string;
}
export default async (cloudowner: string, owner?: boolean): Promise<CloudName> => {
  const { data } = await http.get(`/api/client/cloud/cloudname`, {
    params: { ownerid: cloudowner, owner },
  });

  return data;
};
