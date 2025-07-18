import React, { useEffect, useState } from 'react';
import Modal from '@/components/elements/Modal';
import { Form, Formik } from 'formik';
import Field from '@/components/elements/Field';
import { object, string } from 'yup';
import { PaginatedResult } from '@/api/http';
import FlashMessageRender from '@/components/FlashMessageRender';
import Button from '@/components/elements/button/Button';
import tw from 'twin.macro';
import { faPenFancy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useStoreActions } from '@/state/hooks';
import { ApplicationStore } from '@/state';
import { Actions, useStoreState } from 'easy-peasy';
import useSWR from 'swr';
import getCloudInfos, { CloudInfos } from '@/api/cloud/getInfos';
import Spinner from '@/components/elements/Spinner';
import { NavLink } from 'react-router-dom';
import { CloudUsers } from '@/api/cloud/getUser';
import editCloudUsers from '@/api/cloud/users/editCloudUsers';
import getCloudUsers from '@/api/getCloudUsers';

interface Values {
  email: string;
  first: string;
  last: string;
  password?: string;
}
interface Props {
  user: CloudUsers;
  page: number;
}
export default ({ user, page }: Props) => {
  const [visible, setVisible] = useState(false);

  const { clearFlashes, addFlash, clearAndAddHttpError } = useStoreActions(
    (actions: Actions<ApplicationStore>) => actions.flashes
  );
  const uuid = useStoreState((state) => state.user.data!.uuid);

  const { data, error } = useSWR<CloudInfos>(['/cloud/infos'], () => getCloudInfos(), {
    revalidateOnFocus: false,
  });

  const { mutate } = useSWR<PaginatedResult<CloudUsers>>(['/api/client/cloud/users', page], () =>
    getCloudUsers({ page, type: 'cloud' })
  );
  const [submit, setSubmit] = useState(false);
  const [userchange, setUserchange] = React.useState(user.username);
  const handleChange = (event: { target: { value: React.SetStateAction<string> } }) =>
    setUserchange(event.target.value);
  useEffect(() => {
    if (!error) {
      clearFlashes('cloud:users');
    } else {
      clearAndAddHttpError({ key: 'cloud:users', error });
    }
  }, [error]);

  const edit = (values: Values) => {
    clearFlashes('cloud:users');
    setSubmit(true);
    if (userchange.length < 1) {
      addFlash({ type: 'error', title: 'Error', message: 'You need to enter a username!', key: 'cloud:users' });
      setSubmit(false);
      setVisible(false);

      return;
    }
    editCloudUsers(values.email, userchange, values.first, values.last, uuid, values.password)
      .then(() => {
        addFlash({
          type: 'success',
          title: 'Success',
          message: 'The user has been edited!',
          key: 'cloud:users',
        });
        setVisible(false);
        setSubmit(false);
        mutate();
      })
      .catch((error) => {
        clearAndAddHttpError({ key: 'cloud:users', error });
      });
  };

  return (
    <>
      {!data ? (
        <div css={tw`w-full`}>
          <Spinner size={'large'} centered />
        </div>
      ) : (
        <Formik
          onSubmit={(values) => edit(values)}
          initialValues={{
            email: user.email,
            first: user.first,
            last: user.last,
          }}
          validationSchema={object().shape({
            email: string().email().required('This email is not valid.'),
            first: string().required('A first name must be provided'),
            last: string().required('A last name must be provided'),
            password: string().min(8).optional(),
          })}
        >
          {({ isSubmitting, resetForm }) => (
            <Modal
              visible={visible}
              dismissable={!isSubmitting}
              showSpinnerOverlay={isSubmitting}
              onDismissed={() => {
                resetForm();
                setVisible(false);
              }}
            >
              <FlashMessageRender byKey={'cloud:servers'} css={tw`mb-6`} />

              <>
                <h2 css={tw`text-2xl mb-6`}>{userchange !== '' ? `Edit ${userchange}` : 'Edit User'}</h2>
                <Form css={tw`m-0 gap-4`}>
                  <div css={tw`w-full mb-4`}>
                    <Field type={'email'} id={'email'} name={'email'} label={'Email'} disabled={false} />
                  </div>
                  <div css={tw`w-full mb-4`}>
                    <Field
                      type={'string'}
                      id={'username'}
                      name={'username'}
                      value={userchange}
                      onChange={handleChange}
                      label={'Username'}
                      disabled={false}
                    />
                  </div>
                  <div css={tw`w-full mb-4`}>
                    <Field type={'string'} id={'first'} name={'first'} label={'First name'} disabled={false} />
                  </div>
                  <div css={tw`w-full mb-4`}>
                    <Field type={'string'} id={'last'} name={'last'} label={'Last name'} disabled={false} />
                  </div>
                  <div css={tw`w-full mb-4`}>
                    <Field type={'password'} id={'password'} name={'password'} label={'Password'} disabled={false} />
                  </div>
                  <div css={tw`flex flex-wrap justify-end`}>
                    <NavLink to={'/cloud/users'}>
                      <Button type={'button'} css={tw`w-full sm:w-auto sm:mr-2`}>
                        Cancel
                      </Button>
                    </NavLink>
                    <Button
                      css={tw`bg-yellow-600 hover:bg-yellow-500 w-full mt-4 sm:w-auto sm:mt-0`}
                      type={'submit'}
                      disabled={false}
                    >
                      Edit a user
                    </Button>
                  </div>
                </Form>
              </>
            </Modal>
          )}
        </Formik>
      )}
      <Button onClick={() => setVisible(true)} disabled={submit}>
        <FontAwesomeIcon icon={faPenFancy} />
      </Button>
    </>
  );
};
