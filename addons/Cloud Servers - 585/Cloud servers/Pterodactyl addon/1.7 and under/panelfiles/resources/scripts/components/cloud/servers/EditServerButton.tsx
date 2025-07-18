import React, { useEffect, useState } from 'react';
import Modal from '@/components/elements/Modal';
import { Field as FormikField, Form, Formik } from 'formik';
import Field from '@/components/elements/Field';
import { number, object, string } from 'yup';
import { PaginatedResult } from '@/api/http';
import FlashMessageRender from '@/components/FlashMessageRender';
import Button from '@/components/elements/button/Button';
import tw from 'twin.macro';
import { faPenFancy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useStoreActions } from '@/state/hooks';
import { ApplicationStore } from '@/state';
import { Actions } from 'easy-peasy';
import useSWR from 'swr';
import getCloudInfos, { CloudInfos } from '@/api/cloud/getInfos';
import Spinner from '@/components/elements/Spinner';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import Label from '@/components/elements/Label';
import Select from '@/components/elements/Select';
import { Server } from '@/api/server/getServer';
import editCloudServer from '@/api/cloud/servers/editCloudServer';
import getServers from '@/api/getServers';

interface Values {
  cpu: number;
  ram: number;
  disk: number;
  backups: number;
  databases: number;
  allocations: number;
  egg: number;
  user: string;
}
interface Props {
  server: Server;
  page: number;
}
export default ({ server, page }: Props) => {
  const [visible, setVisible] = useState(false);

  const { clearFlashes, addFlash, clearAndAddHttpError } = useStoreActions(
    (actions: Actions<ApplicationStore>) => actions.flashes
  );

  const { data, error } = useSWR<CloudInfos>(['/cloud/infos'], () => getCloudInfos(), {
    revalidateOnFocus: false,
  });
  const [submit, setSubmit] = useState(false);
  const [servername, setServerename] = React.useState(server.name);
  const handleChange = (event: { target: { value: React.SetStateAction<string> } }) =>
    setServerename(event.target.value);

  const { mutate } = useSWR<PaginatedResult<Server>>(['/api/client/servers', page], () =>
    getServers({ page, type: 'cloud' })
  );
  useEffect(() => {
    if (!error) {
      clearFlashes('cloud:servers');
    } else {
      clearAndAddHttpError({ key: 'cloud:servers', error });
    }
  }, [error]);

  const edit = (values: Values) => {
    clearFlashes('cloud:servers');
    setSubmit(true);
    if (servername.length < 1) {
      console.log(servername.length);
      addFlash({ type: 'error', title: 'Error', message: 'You need to enter a server name!', key: 'cloud:newserver' });
      setSubmit(false);
      setVisible(false);

      return;
    }
    editCloudServer(
      servername,
      values.cpu,
      values.ram,
      values.disk,
      values.backups,
      values.databases,
      values.allocations,
      values.egg,
      values.user,
      server.uuid
    )
      .then(() => {
        addFlash({
          type: 'success',
          title: 'Success',
          message: 'The server has been edited!',
          key: 'cloud:servers',
        });
        setVisible(false);
        setSubmit(false);
        mutate();
      })
      .catch((error) => {
        clearAndAddHttpError({ key: 'cloud:servers', error });
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
            cpu: server.limits.cpu,
            ram: server.limits.memory,
            disk: server.limits.disk,
            backups: server.featureLimits.backups,
            databases: server.featureLimits.databases,
            allocations: server.featureLimits.allocations,
            egg: server.eggId,
            user: data.users[0].uuid,
          }}
          validationSchema={object().shape({
            cpu: number()
              .min(1)
              .max(data.available.cpu + server.limits.cpu)
              .required('The cpu percentage must be between 1 and 999%.'),
            ram: number()
              .min(1)
              .max(data.available.ram + server.limits.memory)
              .required('The ram must be between 1 and 999.'),
            disk: number()
              .min(1)
              .max(data.available.disk + server.limits.disk)
              .required('The disk percentage must be between 1 and 999.'),
            backups: number()
              .max(data.available.backups + server.featureLimits.backups)
              .required('The number of backups is required.'),
            databases: number()
              .max(data.available.databases + server.featureLimits.databases)
              .required('The number of databases is required.'),
            allocations: number()
              .max(data.available.allocations + server.featureLimits.allocations)
              .required('The number of allocations is required.'),
            egg: number().min(1).required('A egg must be selected.'),
            user: string().required('A user must be selected.'),
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
                <h2 css={tw`text-2xl mb-6`}>{servername !== '' ? `Edit ${servername}` : 'Edit server'}</h2>
                <Form css={tw`m-0 gap-4`}>
                  <div css={tw`w-full mb-4`}>
                    <Field
                      type={'string'}
                      id={'name'}
                      name={'name'}
                      value={servername}
                      onChange={handleChange}
                      label={'Server Name'}
                      description={'The name of the server.'}
                      disabled={false}
                    />
                  </div>
                  <div css={tw`w-full grid grid-cols-3 gap-4`}>
                    <Field
                      type={'number'}
                      id={'cpu'}
                      name={'cpu'}
                      label={'Server CPU (IN %)'}
                      description={'100% = 1 core. If you do not want to limit CPU usage, set the value to 0.'}
                      disabled={false}
                    />
                    <Field
                      type={'number'}
                      id={'ram'}
                      name={'ram'}
                      label={'Server Ram (IN mb)'}
                      description={'Setting this to 0 will allow unlimited memory.'}
                      disabled={false}
                    />
                    <Field
                      type={'number'}
                      id={'disk'}
                      name={'disk'}
                      label={'Server Disk (In mb)'}
                      description={'Set to 0 to allow unlimited disk usage.'}
                      disabled={false}
                    />
                  </div>
                  <div css={tw`w-full grid grid-cols-3 gap-4 mt-2`}>
                    <Field
                      type={'number'}
                      id={'backups'}
                      name={'backups'}
                      label={'Server Backups'}
                      description={'The total number of backups that can be created for this server.'}
                      disabled={false}
                    />
                    <Field
                      type={'number'}
                      id={'databases'}
                      name={'databases'}
                      label={'Server Databases'}
                      description={'The total number of databases that can be created for this server.'}
                      disabled={false}
                    />
                    <Field
                      type={'number'}
                      id={'allocations'}
                      name={'allocations'}
                      label={'Server Allocations'}
                      description={'The total number of allocations that can be created for this server.'}
                      disabled={false}
                    />
                  </div>
                  <div css={tw`grid grid-cols-2 gap-4`}>
                    <div css={tw`my-4`}>
                      <Label>Eggs</Label>
                      <FormikFieldWrapper name={'egg'}>
                        <FormikField as={Select} name={'egg'}>
                          {data.eggs.map((egg, key) => (
                            <option key={key} value={egg.id}>
                              {egg.name}
                            </option>
                          ))}
                        </FormikField>
                      </FormikFieldWrapper>
                    </div>
                    <div css={tw`my-4`}>
                      <Label>User</Label>
                      <FormikFieldWrapper name={'user'}>
                        <FormikField as={Select} name={'user'}>
                          {data.users.map((user, key) => (
                            <option key={key} value={user.uuid}>
                              {user.name_last} {user.name_first} ({user.email})
                            </option>
                          ))}
                        </FormikField>
                      </FormikFieldWrapper>
                    </div>
                  </div>
                  <div css={tw`flex flex-wrap justify-end`}>
                    <Button onClick={() => setVisible(false)} css={tw`w-full sm:w-auto sm:mr-2`}>
                      Close
                    </Button>
                    <Button
                      css={tw`w-full mt-4 sm:w-auto sm:mt-0 bg-yellow-600 hover:bg-yellow-500`}
                      type={'submit'}
                      disabled={submit}
                    >
                      Edit server
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
