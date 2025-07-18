import http from '@/api/http';

export default (owneruuid: string, name: string, img: string, footer: string, footerlink: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    http
      .post(`/api/client/cloud/settings/setcloudname`, {
        owneruuid,
        name,
        img,
        footer,
        footerlink,
      })
      .then(() => resolve())
      .catch(reject);
  });
};
