import React from 'react';
import BoringAvatar, { AvatarProps } from 'boring-avatars';
import { useStoreState } from '@/state/hooks';
import getAvatar from '@/api/account/getAvatar';
import tw from 'twin.macro';

const palette = ['#FFAD08', '#EDD75A', '#73B06F', '#0C8F8F', '#587291'];

type Props = Omit<AvatarProps, 'colors'>;

const _Avatar = ({ variant = 'beam', ...props }: AvatarProps) => (
  <BoringAvatar colors={palette} variant={variant} {...props} />
);

const _UserAvatar = ({ variant = 'beam', ...props }: Omit<Props, 'name'>) => {
  const uuid = useStoreState((state) => state.user.data!.uuid);

  const { data } = getAvatar(uuid);
  if (!data) {
    return <BoringAvatar colors={palette} name={uuid || 'system'} variant={variant} {...props} />;
  }
  return data.found ? (
    <img src={`data:image/png;base64, ${data.img}`} css={tw`rounded-lg`} />
  ) : (
    <BoringAvatar colors={palette} name={uuid || 'system'} variant={variant} {...props} />
  );
};

_Avatar.displayName = 'Avatar';
_UserAvatar.displayName = 'Avatar.User';

const Avatar = Object.assign(_Avatar, {
  User: _UserAvatar,
});

export default Avatar;

