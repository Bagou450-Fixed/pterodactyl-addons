import React, { useEffect, useState } from 'react';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import tw from 'twin.macro';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { NavLink, useLocation } from 'react-router-dom';
import Button from '../../elements/button/Button';
import FlashMessageRender from '@/components/FlashMessageRender';
import CloudServerRow from './CloudServerRow';
import { useStoreState } from 'easy-peasy';
import GreyRowBox from '@/components/elements/GreyRowBox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArchive, faDatabase, faHdd, faMemory, faMicrochip, faNetworkWired } from '@fortawesome/free-solid-svg-icons';
function bytesToHuman(bytes: number): string {
  if (bytes === 0) {
    return '0 kB';
  }

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Number((bytes / Math.pow(1024, i)).toFixed(2))} ${['Bytes', 'kB', 'MB', 'GB', 'TB'][i]}`;
}

export default () => {
  const { search } = useLocation();
  const defaultPage = Number(new URLSearchParams(search).get('page') || '1');
  const serverslimit = useStoreState((state) => state.user.data!.cloud_servers);
  const cpulimit = useStoreState((state) => state.user.data!.cloud_cpu);
  const ramlimit = useStoreState((state) => state.user.data!.cloud_ram);
  const disklimit = useStoreState((state) => state.user.data!.cloud_disk);
  const allocationlimit = useStoreState((state) => state.user.data!.cloud_allocation);
  const backuplimit = useStoreState((state) => state.user.data!.cloud_backup);
  const databaselimit = useStoreState((state) => state.user.data!.cloud_database);
  console.log(useStoreState((state) => state.user.data));
  const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
  const { clearFlashes, clearAndAddHttpError } = useFlash();

  const { data: servers, error } = useSWR<PaginatedResult<Server>>(['/api/client/servers', page], () =>
    getServers({ page, type: 'cloud' })
  );
  useEffect(() => {
    if (!servers) return;
    if (servers.pagination.currentPage > 1 && !servers.items.length) {
      setPage(1);
    }
  }, [servers?.pagination.currentPage]);

  useEffect(() => {
    // Don't use react-router to handle changing this part of the URL, otherwise it
    // triggers a needless re-render. We just want to track this in the URL incase the
    // user refreshes the page.
    window.history.replaceState(null, document.title, `/cloud/servers/${page <= 1 ? '' : `?page=${page}`}`);
  }, [page]);

  useEffect(() => {
    if (error) clearAndAddHttpError({ key: 'dashboard', error });
    if (!error) clearFlashes('dashboard');
  }, [error]);

  return (
    <PageContentBlock title={'Cloud | Servers list'} showFlashKey={'dashboard'}>
      <div css={tw`w-full`}>
        <FlashMessageRender byKey={'cloud:servers'} css={tw`mb-4`} />
      </div>
      {!servers ? (
        <Spinner centered size={'large'} />
      ) : (
        <>
          <div css={tw`grid md:grid-cols-6 mb-4 space-x-2`}>
            <GreyRowBox css={tw`flex mb-2 md:mb-0 ml-2 md:ml-0`}>
              <FontAwesomeIcon css={tw`text-blue-500`} icon={faMicrochip} size='2x' />
              <div css={tw`ml-4`}>
                Available cpu <br /> <span css={tw`text-white`}>{cpulimit} %</span>
              </div>
            </GreyRowBox>
            <GreyRowBox css={tw`flex mb-2 md:mb-0`}>
              <FontAwesomeIcon css={tw`text-blue-500`} icon={faMemory} size='2x' />
              <div css={tw`ml-4`}>
                Available ram <br /> <span css={tw`text-white`}>{bytesToHuman(ramlimit * 1000000)}</span>
              </div>
            </GreyRowBox>
            <GreyRowBox css={tw`flex mb-2 md:mb-0`}>
              <FontAwesomeIcon css={tw`text-blue-500`} icon={faHdd} size='2x' />
              <div css={tw`ml-4`}>
                Available disk
                <br /> <span css={tw`text-white`}>{bytesToHuman(disklimit * 1000000)}</span>
              </div>
            </GreyRowBox>
            <GreyRowBox css={tw`flex mb-2 md:mb-0`}>
              <FontAwesomeIcon css={tw`text-blue-500`} icon={faNetworkWired} size='2x' />
              <div css={tw`ml-4`}>
                Available allocations <br /> <span css={tw`text-white`}>{allocationlimit}</span>
              </div>
            </GreyRowBox>
            <GreyRowBox css={tw`flex mb-2 md:mb-0`}>
              <FontAwesomeIcon css={tw`text-blue-500`} icon={faArchive} size='2x' />
              <div css={tw`ml-4`}>
                Available backups <br /> <span css={tw`text-white`}>{backuplimit}</span>
              </div>
            </GreyRowBox>
            <GreyRowBox css={tw`flex mb-2 md:mb-0`}>
              <FontAwesomeIcon css={tw`text-blue-500`} icon={faDatabase} size='2x' />
              <div css={tw`ml-4`}>
                Available databases <br /> <span css={tw`text-white`}>{databaselimit}</span>
              </div>
            </GreyRowBox>
          </div>
          <Pagination data={servers} onPageSelect={setPage}>
            {({ items }) =>
              items.length > 0 ? (
                items.map((server, index) => (
                  <CloudServerRow
                    page={page}
                    key={server.uuid}
                    server={server}
                    css={index > 0 ? tw`mt-2` : undefined}
                  />
                ))
              ) : (
                <p css={tw`text-center text-sm text-neutral-400`}>There are no other servers to display.</p>
              )
            }
          </Pagination>
          <div css={tw`mt-6 flex items-center justify-end`}>
            {serverslimit > servers?.pagination.total ? (
              <p css={tw`text-sm text-neutral-300 mb-4 sm:mr-6 sm:mb-0 mt-6`}>
                {servers?.pagination.total} of {serverslimit} servers created.
              </p>
            ) : (
              <p css={tw`text-sm text-neutral-300 mb-4 sm:mr-6 sm:mb-0`}>You can&apos;t create more servers</p>
            )}
            {serverslimit > servers?.pagination.total && (
              <div css={tw`flex justify-end mt-6`}>
                <NavLink to={`/cloud/servers/new`}>
                  <Button css={tw`justify-end`}>Create new</Button>
                </NavLink>
              </div>
            )}
          </div>
        </>
      )}
    </PageContentBlock>
  );
};
