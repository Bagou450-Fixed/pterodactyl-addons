import http from '@/api/http';

export interface CloudInfos {
  eggs: any[];
  users: any[];
  available: any;
  nodeselection: string;
  nodes: any[];
  locationselection: string;
  locations: any[];
}

export default async (): Promise<CloudInfos> => {
  const { data } = await http.get(`/api/client/cloud/infos`);

  return data || [];
};

