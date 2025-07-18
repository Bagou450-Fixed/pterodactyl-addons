import React, { useEffect, useState } from 'react';
import Modal from '@/components/elements/Modal';
import { Form, Formik, FormikHelpers } from 'formik';
import Field from '@/components/elements/Field';
import { number, object, string } from 'yup';
import { ServerContext } from '@/state/server';
import { httpErrorToHuman } from '@/api/http';
import Button from '@/components/elements/Button';
import tw from 'twin.macro';
import Spinner from '@/components/elements/Spinner';
import getSplittedServer from '@/api/server/splitted/getSplittedServer';
import { SocketEvent, SocketRequest } from '../events';
import { bytesToMegabytes } from '@/helpers';
import { useStoreActions } from '@/state/hooks';
import { Actions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import splitserver from '@/api/server/splitted/splitserver';
import Can from '@/components/elements/Can';
import FormikSwitch from '@/components/elements/FormikSwitch';

interface Values {
    cpu: number;
    ram: number;
    disk: number;
    swap: number;
    name: string;
    addsubusers: boolean;

}

export default () => {
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const [ visible, setVisible ] = useState(false);
    const egg = ServerContext.useStoreState(state => state.server.data!.eggName);
    const [ stats, setStats ] = useState(0);

    const { data, error, isValidating } = getSplittedServer(uuid);

    if (!data || (error && isValidating)) {
        return <Spinner size={'large'} centered/>;
    }
    const connected = ServerContext.useStoreState(state => state.socket.connected);
    const instance = ServerContext.useStoreState(state => state.socket.instance);
    const { clearFlashes, addFlash } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const statsListener = (data: string) => {
        let stats: any = {};
        try {
            stats = JSON.parse(data);
        } catch (e) {
            return;
        }
        setStats(stats.disk_bytes);
    };

    useEffect(() => {
        if (!connected || !instance) {
            return;
        }
        instance.addListener(SocketEvent.STATS, statsListener);
        instance.send(SocketRequest.SEND_STATS);

        return () => {
            instance.removeListener(SocketEvent.STATS, statsListener);
        };
    }, [ instance, connected ]);
    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('splitted');
        setSubmitting(true);
        splitserver(uuid, values.cpu, values.ram, values.disk, values.swap, values.name, values.addsubusers).then(() => {
            addFlash({ type: 'success', title: 'Sucess', message: 'Server splitted successfully', key: 'splitted' });
            setSubmitting(false);
            setVisible(false);
        }).catch((error) => {
            addFlash({ type: 'error', title: 'Error', message: httpErrorToHuman(error), key: 'splitted' });
            setSubmitting(false);
            setVisible(false);
        });
    };
    const schema = object().shape({
        ram: number()
            .required('A ram must be provided.')
            .min(512, 'You can\'t have less than 512mb of ram')
            .max(data.total.memory - 512, 'There is not enough ram available'),
        swap: number()
            .required('A swap must be provided.')
            .min(0, 'You can\'t have less than 512mb of swap')
            .max(data.total.swap, 'There is not enough swap available'),
        disk: number()
            .required('A disk must be provided.')
            .min(1, 'You can\'t have less than 1mb of disk')
            .max(data.total.disk - bytesToMegabytes(stats), 'There is not enough disk available'),
        cpu: number()
            .required('A cpu must be provided.')
            .min(1, 'You can\'t have less than 1% of cpu')
            .max(data.total.cpu - 1, 'There is not enough cpu available'),
        name: string()
            .required('A name must be provided.'),
    });
    return (
        <>
            <Formik
                onSubmit={submit}
                initialValues={{ ram: 0, swap: 0, disk: 0, cpu: 0, name: 'My ' + egg + ' server', addsubusers: false }}
                validationSchema={schema}
            >
                {
                    ({ isSubmitting, resetForm }) => (
                        <Modal
                            visible={visible}
                            dismissable={!isSubmitting}
                            showSpinnerOverlay={isSubmitting}
                            onDismissed={() => {
                                resetForm();
                                setVisible(false);
                            }}
                        >
                            <h2 css={tw`text-2xl mb-6`}>Split the server</h2>

                            <Form css={tw`m-0`}>
                                <div css={tw`flex mx-auto`}>

                                    <Field
                                        type={'number'}
                                        id={'cpu'}
                                        name={'cpu'}
                                        label={'Server Cpu'}
                                        description={'Cpu of new server (100% = 1 core).'}
                                        splittedavailable={`${data.total.cpu - 1 > 0 ? data.total.cpu - 1 + '%' : 'No cpu'} available.`}
                                        cssstyle={tw`w-3/6`}
                                        disabled={data.total.cpu - 1 < 1}

                                    />
                                    <Field // new fileds type for size
                                        type={'number'}
                                        id={'ram'}
                                        name={'ram'}
                                        label={'Server Ram'}
                                        description={'Ram of the new server (in mb).'}
                                        splittedavailable={`${data.total.memory - 512 > 0 ? data.total.memory - 512 + 'mb' : 'No ram'} available.`}
                                        cssstyle={tw`w-3/6 ml-4`}
                                        disabled={data.total.memory - 512 < 1}

                                    />

                                </div>
                                <div css={tw`flex mx-auto mt-2`}>
                                    <Field
                                        type={'number'}
                                        id={'disk'}
                                        name={'disk'}
                                        label={'Server Disk'}
                                        description={'Disk of the new server (in mb).'}
                                        splittedavailable={`${data.total.disk - bytesToMegabytes(stats) > 0 ? data.total.disk - bytesToMegabytes(stats) + 'mb' : 'No disk'} available.`}
                                        cssstyle={tw`w-3/6`}
                                        disabled={data.total.disk - bytesToMegabytes(stats) < 1}

                                    />
                                    <Field
                                        type={'number'}
                                        id={'swap'}
                                        name={'swap'}
                                        label={'Server Swap'}
                                        description={'Swap of the new server (in mb).'}
                                        splittedavailable={`${data.total.swap > 0 ? data.total.swap + 'mb' : 'No swap'} available.`}
                                        cssstyle={tw`w-3/6 ml-4`}
                                        disabled={data.total.swap < 1}
                                    />

                                </div>
                                <div css={tw`mt-6 mb-6`}>
                                    <Field
                                        type={'string'}
                                        id={'name'}
                                        name={'name'}
                                        label={'Server Name'}
                                        description={'Name of the new server'}
                                    />
                                </div>
                                <Can action={'user.create'}>
                                    <div css={tw`mt-6 bg-neutral-700 border border-neutral-800 shadow-inner p-4 rounded`}>
                                        <FormikSwitch
                                            name={'addsubusers'}
                                            label={'Subuser'}
                                            description={'Add subuser(s) to the new server.'}
                                        />
                                    </div>
                                </Can>
                                <div css={tw`mt-6`}>
                                    {data.total.cpu - 1 < 1 &&
                                        <p css={tw`text-red-500 text-xs`}>-You need more CPU for split this server</p>
                                    }
                                    {data.total.memory - 512 < 1 &&
                                        <p css={tw`text-red-500 text-xs`}>-You need more RAM for split this server</p>
                                    }
                                    {data.total.disk - 512 < 1 &&
                                        <p css={tw`text-red-500 text-xs`}>-You need more DISK for split this server</p>
                                    }
                                </div>
                                <div css={tw`flex flex-wrap justify-end mt-6`}>
                                    <Button
                                        type={'button'}
                                        isSecondary
                                        css={tw`w-full sm:w-auto sm:mr-2`}
                                        onClick={() => setVisible(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button css={tw`w-full mt-4 sm:w-auto sm:mt-0`} type={'submit'} disabled={data.total.memory - 512 < 1 || data.total.disk - bytesToMegabytes(stats) < 1 || data.total.cpu - 1 < 1}>
                                        Split this server
                                    </Button>
                                </div>
                            </Form>
                        </Modal>
                    )
                }
            </Formik>
            <Button onClick={() => setVisible(true)}>
                Split
            </Button>
        </>
    );
};
