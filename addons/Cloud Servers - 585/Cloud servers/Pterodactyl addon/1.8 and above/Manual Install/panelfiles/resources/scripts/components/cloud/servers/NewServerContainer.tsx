import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import Spinner from '@/components/elements/Spinner';
import tw from 'twin.macro';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { Field as FormikField, Form, Formik } from 'formik';
import Field from '@/components/elements/Field';
import Button from '@/components/elements/Button';
import { number, object, string } from 'yup';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import Select from '@/components/elements/Select';
import Label from '@/components/elements/Label';
import FlashMessageRender from '@/components/FlashMessageRender';
import MessageBox from '@/components/MessageBox';
import getCloudInfos, { CloudInfos } from '@/api/cloud/getInfos';
import PageContentBlock from '@/components/elements/PageContentBlock';
import { NavLink, useHistory } from 'react-router-dom';
import { ApplicationStore } from '@/state';
import { Actions, useStoreActions } from 'easy-peasy';
import createCloudServer from '@/api/cloud/servers/createCloudServer';

interface Values {
  cpu: number;
  ram: number;
  disk: number;
  backups: number;
  databases: number;
  allocations: number;
  egg: number;
  user: string;
  node?: number;
  location?: number;
}

export default () => {
  const { data, error } = useSWR<CloudInfos>(['/cloud/infos'], () => getCloudInfos(), {
    revalidateOnFocus: false,
  });
  const { clearFlashes, addFlash, clearAndAddHttpError } = useStoreActions(
    (actions: Actions<ApplicationStore>) => actions.flashes
  );
  const [submit, setSubmit] = useState(false);
  const [servername, setServerename] = React.useState('');
  const handleChange = (event: { target: { value: React.SetStateAction<string> } }) =>
    setServerename(event.target.value);
  const history = useHistory();
  useEffect(() => {
    if (!error) {
      clearFlashes('cloud:newserver');
    } else {
      clearAndAddHttpError({ key: 'cloud:newserver', error });
    }
  }, [error]);
  const create = (values: Values) => {
    clearFlashes('cloud:newserver');
    setSubmit(true);
    if (servername.length < 1) {
      console.log(servername.length);
      addFlash({ type: 'error', title: 'Error', message: 'You need to enter a server name!', key: 'cloud:newserver' });
      setSubmit(false);
      return;
    }
    createCloudServer(
      servername,
      values.cpu,
      values.ram,
      values.disk,
      values.backups,
      values.databases,
      values.allocations,
      values.egg,
      values.user,
      values.node,
      values.location
    )
      .then(() => {
        addFlash({
          type: 'success',
          title: 'Success',
          message: 'The server has been created!',
          key: 'cloud:newserver',
        });
        setTimeout(() => {
          history.replace('/cloud/servers');
        }, 1500);
      })
      .catch((error) => {
        clearAndAddHttpError({ key: 'cloud:newserver', error });
      });
  };
  console.log(data);
  return (
    <PageContentBlock title={'Cloud | New Server'} css={tw`flex flex-wrap`}>
      <div css={tw`w-full`}>
        <FlashMessageRender byKey={'cloud:newserver'} css={tw`mb-4`} />
      </div>
      {!data ? (
        <div css={tw`w-full`}>
          <Spinner size={'large'} centered />
        </div>
      ) : (
        <>
          {data.eggs.length > 0 ? (
            <>
              <TitledGreyBox title={servername ? `Create ${servername}` : 'Create a server'} css={tw`w-full`}>
                <div css={tw`px-1 py-2`}>
                  <Formik
                    onSubmit={(values) => create(values)}
                    initialValues={{
                      cpu: data.available.cpu,
                      ram: data.available.ram,
                      disk: data.available.disk,
                      backups: data.available.backups,
                      databases: data.available.databases,
                      allocations: data.available.allocations,
                      egg: data.eggs[0].id,
                      user: data.users[0].uuid,
                      location: data.locationselection !== 'true' ? null : data.locations[0].id,
                      node: data.nodeselection !== 'true' ? null : data.nodes[0].id,
                    }}
                    validationSchema={object().shape({
                      cpu: number()
                        .min(1)
                        .max(data.available.cpu)
                        .required('The cpu percentage must be between 1 and 999%.'),
                      ram: number().min(1).max(data.available.ram).required('The ram must be between 1 and 999.'),
                      disk: number()
                        .min(1)
                        .max(data.available.disk)
                        .required('The disk percentage must be between 1 and 999.'),
                      backups: number().max(data.available.backups).required('The number of backups is required.'),
                      databases: number()
                        .max(data.available.databases)
                        .required('The number of databases is required.'),
                      allocations: number()
                        .max(data.available.allocations)
                        .required('The number of allocations is required.'),
                      egg: number().min(1).required('A egg must be selected.'),
                      user: string().required('A user must be selected.'),
                    })}
                  >
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
                      <div
                        css={
                          data.nodeselection === 'true'
                            ? tw`grid grid-cols-3 gap-4`
                            : data.locationselection === 'true'
                            ? tw`grid grid-cols-3 gap-4`
                            : tw`grid grid-cols-2 gap-4`
                        }
                      >
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
                        {data.nodeselection === 'true' && (
                          <div css={tw`my-4`}>
                            <Label>Nodes</Label>
                            <FormikFieldWrapper name={'node'}>
                              <FormikField as={Select} name={'node'}>
                                {data.nodes.map((node, key) => (
                                  <option key={key} value={node.id}>
                                    {node.name} ({node.fqdn})
                                  </option>
                                ))}
                              </FormikField>
                            </FormikFieldWrapper>
                          </div>
                        )}
                        {data.locationselection === 'true' && (
                          <div css={tw`my-4`}>
                            <Label>Location</Label>
                            <FormikFieldWrapper name={'location'}>
                              <FormikField as={Select} name={'location'}>
                                {data.locations.map((location, key) => (
                                  <option key={key} value={location.id}>
                                    {location.short}
                                  </option>
                                ))}
                              </FormikField>
                            </FormikFieldWrapper>
                          </div>
                        )}
                      </div>
                      <div css={tw`flex flex-wrap justify-end`}>
                        <NavLink to={'/cloud/servers'}>
                          <Button type={'button'} isSecondary css={tw`w-full sm:w-auto sm:mr-2`} disabled={submit}>
                            Cancel
                          </Button>
                        </NavLink>
                        <Button css={tw`w-full mt-4 sm:w-auto sm:mt-0`} type={'submit'} disabled={submit}>
                          Create a server
                        </Button>
                      </div>
                    </Form>
                  </Formik>
                </div>
              </TitledGreyBox>
            </>
          ) : (
            <MessageBox type='info' title='Info'>
              Please add eggs from admin panel
            </MessageBox>
          )}
        </>
      )}
    </PageContentBlock>
  );
};

