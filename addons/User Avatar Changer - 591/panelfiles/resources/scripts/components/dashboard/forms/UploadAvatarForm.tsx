import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import React, { useRef, useState } from 'react';
import { ModalMask } from '@/components/elements/Modal';
import Fade from '@/components/elements/Fade';
import { WithClassname } from '@/components/types';
import Portal from '@/components/elements/Portal';
import { CloudUploadIcon } from '@heroicons/react/outline';
import uploadAvater from '@/api/account/uploadAvater';
import { Actions, State, useStoreActions, useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import getAvatar from '@/api/account/getAvatar';
import removeAvater from '@/api/account/removeAvater';
import { httpErrorToHuman } from '@/api/http';
import Spinner from '@/components/elements/Spinner';

export default ({ className }: WithClassname) => {
  const fileUploadInput = useRef<HTMLInputElement>(null);
  const [visible, setVisible] = useState(false);
  const uuid = useStoreState((state: State<ApplicationStore>) => state.user.data!.uuid);
  const { clearFlashes, addFlash } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

  const { data, mutate } = getAvatar(uuid);
  const removeavatar = () => {
    clearFlashes('account:avatar');
    removeAvater(uuid)
      .then(() => {
        addFlash({
          key: 'account:avatar',
          type: 'success',
          title: 'Success',
          message: 'Avatar removed sucessfully.',
        });
        mutate();
      })
      .catch((error) => {
        addFlash({
          key: 'account:avatar',
          type: 'error',
          title: 'Error',
          message: httpErrorToHuman(error),
        });
      });
  };
  const upload = (file: File) => {
    clearFlashes('account:avatar');
    uploadAvater(file, uuid)
      .then(() => {
        addFlash({
          key: 'account:avatar',
          type: 'success',
          title: 'Success',
          message: 'Avatar uploaded sucessfully.',
        });
        mutate();
      })
      .catch((error) => {
        addFlash({
          key: 'account:avatar',
          type: 'error',
          title: 'Error',
          message: httpErrorToHuman(error),
        });
      });
  };
  if (!data) {
    return <Spinner centered />;
  }
  return (
    <>
      <Portal>
        <Fade appear in={visible} timeout={75} key={'upload_modal_mask'} unmountOnExit>
          <ModalMask
            onClick={() => setVisible(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();

              setVisible(false);
              if (!e.dataTransfer?.files.length) return;

              upload(e.dataTransfer.files[0]);
            }}
          >
            <div className={'w-full flex items-center justify-center pointer-events-none'}>
              <div
                className={
                  'flex items-center space-x-4 bg-black w-full ring-4 ring-blue-200 ring-opacity-60 rounded p-6 mx-10 max-w-sm'
                }
              >
                <CloudUploadIcon className={'w-10 h-10 flex-shrink-0'} />
                <p className={'font-header flex-1 text-lg text-neutral-100 text-center'}>
                  Drag and drop files to upload.
                </p>
              </div>
            </div>
          </ModalMask>
        </Fade>
      </Portal>
      <input
        type={'file'}
        ref={fileUploadInput}
        css={tw`hidden`}
        onChange={(e) => {
          if (!e.currentTarget.files) return;

          upload(e.currentTarget.files[0]);
        }}
      />
      {!data.found ? (
        <p css={tw`mb-4`}>You have no avatar for the moment you can upload a avatar with the upload button.</p>
      ) : (
        <div css={tw`mb-4`}>
          <p>Your actual avatar is :</p>
          <img src={`data:image/png;base64, ${data.img}`} css={tw`rounded-lg`} />
          <p>You can remove it with the remove button or change it with the upload button.</p>
        </div>
      )}
      <div css={data.found ? tw`mt-2 grid grid-cols-1 md:grid-cols-2 gap-4` : ''}>
        <Button className={className} onClick={() => fileUploadInput.current && fileUploadInput.current.click()}>
          Upload
        </Button>
        {data.found && (
          <Button.Danger className={className} onClick={() => removeavatar()}>
            Remove
          </Button.Danger>
        )}
      </div>
    </>
  );
};

