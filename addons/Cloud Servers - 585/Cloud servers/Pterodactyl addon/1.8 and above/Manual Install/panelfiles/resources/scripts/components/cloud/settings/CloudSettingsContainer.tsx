import React, { useEffect } from 'react';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import tw from 'twin.macro';
import useSWR from 'swr';
import FlashMessageRender from '@/components/FlashMessageRender';
import cloudName, { CloudName } from '@/api/cloud/cloudName';
import { Actions, useStoreActions, useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { object, string } from 'yup';
import Button from '@/components/elements/Button';
import { Formik, Form } from 'formik';
import Field from '@/components/elements/Field';
import setCloudName from '@/api/cloud/settings/setCloudName';

interface Values {
  name: string;
  img: string;
  footer: string;
  footerlink: string;
}

export default () => {
  const uuid = useStoreState((state: ApplicationStore) => state.user.data!.uuid);

  const { clearFlashes, addFlash, clearAndAddHttpError } = useStoreActions(
    (actions: Actions<ApplicationStore>) => actions.flashes
  );
  const { data, error, mutate } = useSWR<CloudName>(['/cloud/cloudname'], () => cloudName(uuid, true), {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (error) clearAndAddHttpError({ key: 'dashboard', error });
    if (!error) clearFlashes('dashboard');
  }, [error]);
  const savesettings = (values: Values) => {
    clearFlashes('cloud:settings');
    setCloudName(uuid, values.name, values.img, values.footer, values.footerlink)
      .then(() => {
        mutate();
        addFlash({
          type: 'success',
          title: 'Success',
          message: 'Settings updated!',
          key: 'cloud:settings',
        });
      })
      .catch(() => {
        addFlash({
          type: 'error',
          title: 'Error',
          message: 'A error has occurred on our side please retry in few minutes!',
          key: 'cloud:settings',
        });
      });
  };
  if (!data) {
    return <Spinner centered size={'large'} />;
  }

  return (
    <PageContentBlock title={'Dashboard'} showFlashKey={'dashboard'}>
      <div css={tw`w-full`}>
        <FlashMessageRender byKey={'cloud:settings'} css={tw`mb-4`} />
      </div>
      {!data ? (
        <Spinner centered size={'large'} />
      ) : (
        <TitledGreyBox title={'General settings'}>
          <div css={tw`px-1 py-2`}>
            <Formik
              onSubmit={(values) => savesettings(values)}
              initialValues={{
                name: data.name,
                img: data.img,
                footer: data.footer,
                footerlink: data.footerlink,
              }}
              validationSchema={object().shape({
                name: string().max(32).nullable().optional(),
                img: string().url().nullable().optional(),
                footer: string().nullable().optional(),
                footerlink: string().url().nullable().optional(),
              })}
            >
              <Form css={tw`m-0 gap-4`}>
                <div css={tw`w-full mb-4`}>
                  <Field
                    type={'string'}
                    id={'name'}
                    name={'name'}
                    label={'Panel name'}
                    description={'Change the panel name.'}
                    disabled={false}
                  />
                </div>
                <div css={tw`w-full mb-4`}>
                  <Field
                    type={'string'}
                    id={'img'}
                    name={'img'}
                    label={'Panel Image'}
                    description={'This image are going to be showed before server name.'}
                    disabled={false}
                  />
                </div>
                <div css={tw`w-full mb-4`}>
                  <Field
                    type={'string'}
                    id={'footer'}
                    name={'footer'}
                    label={'Panel Footer'}
                    description={'Change panel footer'}
                    disabled={false}
                  />
                </div>
                <div css={tw`w-full mb-4`}>
                  <Field
                    type={'string'}
                    id={'footerlink'}
                    name={'footerlink'}
                    label={'Panel Footer Link'}
                    description={'Change panel footer link (You must have a custom footer for use this)'}
                    disabled={false}
                  />
                </div>
                <div css={tw`flex flex-wrap justify-end`}>
                  <Button css={tw`w-full mt-4 sm:w-auto sm:mt-0`} type={'submit'} disabled={false}>
                    Edit settings
                  </Button>
                </div>
              </Form>
            </Formik>
          </div>
        </TitledGreyBox>
      )}
    </PageContentBlock>
  );
};
