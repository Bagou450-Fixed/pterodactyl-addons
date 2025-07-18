import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import Spinner from '@/components/elements/Spinner';
import tw from 'twin.macro';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { Form, Formik } from 'formik';
import Field from '@/components/elements/Field';
import Button from '@/components/elements/button/Button';
import { object, string } from 'yup';
import FlashMessageRender from '@/components/FlashMessageRender';
import getCloudInfos, { CloudInfos } from '@/api/cloud/getInfos';
import PageContentBlock from '@/components/elements/PageContentBlock';
import { NavLink, useHistory } from 'react-router-dom';
import { ApplicationStore } from '@/state';
import { Actions, useStoreActions } from 'easy-peasy';
import createCloudUsers from '@/api/cloud/users/createCloudUsers';

interface Values {
  email: string;
  first: string;
  last: string;
  password?: string;
}

export default () => {
  const { data, error } = useSWR<CloudInfos>(['/cloud/infos'], () => getCloudInfos(), {
    revalidateOnFocus: false,
  });
  const { clearFlashes, addFlash, clearAndAddHttpError } = useStoreActions(
    (actions: Actions<ApplicationStore>) => actions.flashes
  );
  const [submit, setSubmit] = useState(false);
  const [userchange, setUserchange] = React.useState('');
  const handleChange = (event: { target: { value: React.SetStateAction<string> } }) =>
    setUserchange(event.target.value);
  const history = useHistory();
  useEffect(() => {
    if (!error) {
      clearFlashes('cloud:newuser');
    } else {
      clearAndAddHttpError({ key: 'cloud:newuser', error });
    }
  }, [error]);
  const create = (values: Values) => {
    clearFlashes('cloud:newuser');
    setSubmit(true);
    if (userchange.length < 1) {
      addFlash({ type: 'error', title: 'Error', message: 'You need to enter a username!', key: 'cloud:newuser' });
      setSubmit(false);
      return;
    }
    createCloudUsers(values.email, userchange, values.first, values.last, values.password)
      .then(() => {
        addFlash({
          type: 'success',
          title: 'Success',
          message: 'The user has been created!',
          key: 'cloud:newuser',
        });
        setTimeout(() => {
          history.replace('/cloud/users');
        }, 1500);
      })
      .catch((error) => {
        clearAndAddHttpError({ key: 'cloud:users', error });
      });
  };
  return (
    <PageContentBlock title={'Cloud | New User'} css={tw`flex flex-wrap`}>
      <div css={tw`w-full`}>
        <FlashMessageRender byKey={'cloud:newuser'} css={tw`mb-4`} />
      </div>
      {!data ? (
        <div css={tw`w-full`}>
          <Spinner size={'large'} centered />
        </div>
      ) : (
        <TitledGreyBox title={userchange ? `Create ${userchange}` : 'Create a user'} css={tw`w-full`}>
          <div css={tw`px-1 py-2`}>
            <Formik
              onSubmit={(values) => create(values)}
              initialValues={{
                email: '',
                first: '',
                last: '',
              }}
              validationSchema={object().shape({
                email: string().email().required('This email is not valid.'),
                first: string().required('A first name must be provided'),
                last: string().required('A last name must be provided'),
                password: string().min(8).optional(),
              })}
            >
              <Form css={tw`m-0 gap-4`}>
                <div css={tw`w-full mb-4`}>
                  <Field type={'email'} id={'email'} name={'email'} label={'Email'} disabled={submit} />
                </div>
                <div css={tw`w-full mb-4`}>
                  <Field
                    type={'string'}
                    id={'username'}
                    name={'username'}
                    value={userchange}
                    onChange={handleChange}
                    label={'Username'}
                    disabled={submit}
                  />
                </div>
                <div css={tw`w-full mb-4`}>
                  <Field type={'string'} id={'first'} name={'first'} label={'First name'} disabled={submit} />
                </div>
                <div css={tw`w-full mb-4`}>
                  <Field type={'string'} id={'last'} name={'last'} label={'Last name'} disabled={submit} />
                </div>
                <div css={tw`w-full mb-4`}>
                  <Field type={'password'} id={'password'} name={'password'} label={'Password'} disabled={submit} />
                </div>
                <div css={tw`flex flex-wrap justify-end`}>
                  <NavLink to={'/cloud/users'}>
                    <Button type={'button'} css={tw`w-full sm:w-auto sm:mr-2`} disabled={submit}>
                      Cancel
                    </Button>
                  </NavLink>
                  <Button
                    css={tw` bg-green-600 hover:bg-green-500 w-full mt-4 sm:w-auto sm:mt-0`}
                    type={'submit'}
                    disabled={submit}
                  >
                    Create a user
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
