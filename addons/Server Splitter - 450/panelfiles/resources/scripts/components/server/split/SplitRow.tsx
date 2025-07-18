import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faServer, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Modal from '@/components/elements/Modal';
import { Form, Formik, FormikHelpers } from 'formik';
import Field from '@/components/elements/Field';
import { object, string } from 'yup';
import { ServerContext } from '@/state/server';
import { httpErrorToHuman } from '@/api/http';
import Can from '@/components/elements/Can';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import GreyRowBox from '@/components/elements/GreyRowBox';
import removesplitted from '@/api/server/splitted/removesplitted';
import { ApplicationStore } from '@/state';
import { useStoreActions } from '@/state/hooks';
import { Actions } from 'easy-peasy';
import { NavLink } from 'react-router-dom';

interface Props {
    splittedserver: any;
    className?: string;
}

export default ({ splittedserver, className }: Props) => {
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const { clearFlashes, addFlash } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);
    const [ visible, setVisible ] = useState(false);

    const schema = object().shape({
        confirm: string()
            .required('The server name must be provided.'),
    });

    const submit = (values: { confirm: string }, { setSubmitting }: FormikHelpers<{ confirm: string }>) => {
        clearFlashes();
        removesplitted(uuid, splittedserver.split_masteruuid, splittedserver.uuid).then(() => {
            addFlash({ type: 'success', title: 'Sucess', message: 'Server removed successfully', key: 'splitted' });
            setSubmitting(false);
            setVisible(false);
        }).catch((error) => {
            addFlash({ type: 'error', title: 'Error', message: httpErrorToHuman(error), key: 'splitted' });
            setSubmitting(false);
            setVisible(false);
        });
    };

    return (
        <>
            <Formik
                onSubmit={submit}
                initialValues={{ confirm: '' }}
                validationSchema={schema}
                isInitialValid={false}
            >
                {
                    ({ isSubmitting, isValid, resetForm }) => (
                        <Modal
                            visible={visible}
                            dismissable={!isSubmitting}
                            showSpinnerOverlay={isSubmitting}
                            onDismissed={() => {
                                setVisible(false);
                                resetForm();
                            }}
                        >
                            <h2 css={tw`text-2xl mb-6`}>Confirm server deletion</h2>
                            <p css={tw`text-sm`}>
                                Deleting a server is a permanent action, it cannot be undone. This will permanently
                                delete the <strong>{splittedserver.name}</strong> server and remove all associated data.
                            </p>
                            <Form css={tw`m-0 mt-6`}>
                                <Field
                                    type={'text'}
                                    id={'confirm_name'}
                                    name={'confirm'}
                                    label={'Confirm Server Name'}
                                    description={'Enter the server name to confirm deletion.'}
                                />
                                <div css={tw`mt-6 text-right`}>
                                    <Button
                                        type={'button'}
                                        isSecondary
                                        css={tw`mr-2`}
                                        onClick={() => setVisible(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type={'submit'}
                                        color={'red'}
                                        disabled={!isValid}
                                    >
                                        Delete Server
                                    </Button>
                                </div>
                            </Form>
                        </Modal>
                    )
                }
            </Formik>
            <GreyRowBox $hoverable={false} className={className} css={tw`mb-2`}>
                <div css={tw`hidden md:block`}>
                    <NavLink to={`../${splittedserver.uuidShort}`}><FontAwesomeIcon icon={faServer} fixedWidth/></NavLink>
                </div>
                <div css={tw`flex-1 ml-4`}>
                    <NavLink to={`../${splittedserver.uuidShort}`}><p css={tw`text-lg`}>{splittedserver.name}</p></NavLink>
                    {splittedserver.master &&
                    <span css={tw`bg-green-600 py-1 px-2 rounded text-green-50 text-xs mr-2`}>Master</span>

                    }
                    {splittedserver.uuid === uuid &&
                        <span css={tw`bg-green-800 py-1 px-2 rounded text-green-50 text-xs mr-2`}>Current</span>
                    }
                </div>
                <div css={tw`ml-8 text-center hidden md:block`}>
                    <NavLink to={`../${splittedserver.uuidShort}`}><p css={tw`text-sm`}>{splittedserver.memory}</p></NavLink>
                    <p css={tw`mt-1 text-2xs text-neutral-500 uppercase select-none`}>Memory</p>
                </div>
                <div css={tw`ml-8 text-center hidden md:block`}>
                    <p css={tw`text-sm`}>{splittedserver.cpu}</p>
                    <p css={tw`mt-1 text-2xs text-neutral-500 uppercase select-none`}>CPU</p>
                </div>
                <div css={tw`ml-8 text-center hidden md:block`}>
                    <NavLink to={`../${splittedserver.uuidShort}`}><p css={tw`text-sm`}>{splittedserver.disk}</p></NavLink>
                    <p css={tw`mt-1 text-2xs text-neutral-500 uppercase select-none`}>Disk</p>
                </div>
                <div css={tw`ml-8 text-center hidden md:block`}>
                    <NavLink to={`../${splittedserver.uuidShort}`}><p css={tw`text-sm`}>{splittedserver.swap}</p></NavLink>
                    <p css={tw`mt-1 text-2xs text-neutral-500 uppercase select-none`}>Swap</p>
                </div>
                <div css={tw`ml-8`}>
                    {!splittedserver.master &&
                    <Can action={'split.delete'}>
                        <Button color={'red'} isSecondary onClick={() => setVisible(true)}>
                            <FontAwesomeIcon icon={faTrashAlt} fixedWidth/>
                        </Button>
                    </Can>
                    }

                </div>
            </GreyRowBox>
        </>
    );
};
