import React, { useEffect, useState } from 'react';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import tw from 'twin.macro';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { NavLink, useLocation } from 'react-router-dom';
import Button from '../../elements/button/Button';
import { CloudUsers } from '@/api/cloud/getUser';
import getCloudUsers from '@/api/getCloudUsers';
import UserRow from './UserRow';
import FlashMessageRender from '@/components/FlashMessageRender';
import { useStoreState } from 'easy-peasy';

export default () => {
  const { search } = useLocation();
  const defaultPage = Number(new URLSearchParams(search).get('page') || '1');

  const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
  const { clearFlashes, clearAndAddHttpError } = useFlash();

  const { data: users, error } = useSWR<PaginatedResult<CloudUsers>>(['/api/client/cloud/users', page], () =>
    getCloudUsers({ page, type: 'cloud' })
  );
  console.log(users);
  useEffect(() => {
    if (!users) return;
    if (users.pagination.currentPage > 1 && !users.items.length) {
      setPage(1);
    }
  }, [users?.pagination.currentPage]);

  useEffect(() => {
    // Don't use react-router to handle changing this part of the URL, otherwise it
    // triggers a needless re-render. We just want to track this in the URL incase the
    // user refreshes the page.
    window.history.replaceState(null, document.title, `/cloud/users${page <= 1 ? '' : `?page=${page}`}`);
  }, [page]);
  const userslimit = useStoreState((state) => state.user.data!.cloud_users);

  useEffect(() => {
    if (error) clearAndAddHttpError({ key: 'dashboard', error });
    if (!error) clearFlashes('dashboard');
  }, [error]);
  if (!users) {
    return <Spinner centered size={'large'} />;
  }

  return (
    <PageContentBlock title={'Dashboard'} showFlashKey={'dashboard'}>
      <div css={tw`w-full`}>
        <FlashMessageRender byKey={'cloud:users'} css={tw`mb-4`} />
      </div>
      {!users ? (
        <Spinner centered size={'large'} />
      ) : (
        <>
          <Pagination data={users} onPageSelect={setPage}>
            {({ items }) =>
              items.length > 0 ? (
                items.map((user, index) => <UserRow key={index} user={user} page={page} css={tw`mb-2`} />)
              ) : (
                <p css={tw`text-center text-sm text-neutral-400`}>There are no other servers to display.</p>
              )
            }
          </Pagination>
          <div css={tw`mt-6 flex items-center justify-end`}>
            {userslimit > users?.pagination.total ? (
              <p css={tw`text-sm text-neutral-300 mb-4 sm:mr-6 sm:mb-0 mt-6`}>
                {users?.pagination.total} of {userslimit} users created.
              </p>
            ) : (
              <p css={tw`text-sm text-neutral-300 mb-4 sm:mr-6 sm:mb-0`}>You can&apos;t create more users</p>
            )}
            {userslimit > users?.pagination.total && (
              <div css={tw`flex justify-end mt-6`}>
                <NavLink to={`/cloud/users/new`}>
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
