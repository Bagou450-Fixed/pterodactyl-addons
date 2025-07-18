import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloud, faTrash } from '@fortawesome/free-solid-svg-icons';
import tw from 'twin.macro';
import GreyRowBox from '@/components/elements/GreyRowBox';
import { CloudUsers } from '@/api/cloud/getUser';
import Button from '../../elements/button/Button';
import deleteCloudUsers from '@/api/cloud/users/deleteCloudUsers';
import { useStoreActions } from '@/state/hooks';
import { Actions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import Avatar from '@/components/Avatar';
import EditUserButton from './EditUserButton';

export default ({ user, page }: { user: CloudUsers; page: number }) => {
  const { addFlash, clearAndAddHttpError } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

  const remove = () => {
    deleteCloudUsers(user.uuid)
      .then(() => {
        addFlash({ type: 'success', title: 'Success', message: 'User deleted!', key: 'cloud:users' });
        setTimeout(() => {
          location.reload();
        }, 1000);
      })
      .catch((error) => {
        clearAndAddHttpError({ key: 'cloud:users', error });
      });
  };
  return (
    <GreyRowBox css={tw`flex-wrap md:flex-nowrap items-center mb-2`}>
      <div css={tw`flex items-center truncate w-full md:flex-1`}>
        <div css={tw`flex flex-col truncate`}>
          <div css={tw`flex items-center text-sm mb-1`}>
            <div css={tw`w-10 h-10 rounded-lg overflow-hidden hidden md:block `} title={user.username}>
              <Avatar.User />
            </div>
            <p css={tw`ml-4 break-words truncate`}>
              {user.last} {user.first} ({user.username}){' '}
              {user.cloud && <FontAwesomeIcon css={tw`ml-1`} icon={faCloud} />}
              <br />
              <span css={tw`text-2xs text-neutral-500`}>{user.email}</span>
            </p>
          </div>
        </div>
      </div>
      <div
        css={tw`grid grid-cols-2 w-full md:w-auto mt-4 md:mt-0 md:ml-6 space-x-2`}
        style={{ marginRight: '-0.5rem' }}
      >
        <EditUserButton user={user} page={page} />

        <Button.Danger onClick={() => remove()}>
          <FontAwesomeIcon icon={faTrash} />
        </Button.Danger>
      </div>
    </GreyRowBox>
  );
};
