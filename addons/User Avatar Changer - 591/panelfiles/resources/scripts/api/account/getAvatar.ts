import useSWR from 'swr';
import http from '@/api/http';
export default (uuid: string) =>
  useSWR([uuid, '/account'], async (): Promise<any> => {
    const { data } = await http.get(`/api/client/account/avatar`, { params: { uuid } });
    return data;
  });

