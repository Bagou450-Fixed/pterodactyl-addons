import React from 'react';
import Modal, { RequiredModalProps } from '@/components/elements/Modal';
import { Form, Formik, FormikHelpers } from 'formik';
import Field from '@/components/elements/Field';
import { ServerContext } from '@/state/server';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import useFlash from '@/plugins/useFlash';
import { ApplicationStore } from '@/state';
import { Actions, useStoreActions } from 'easy-peasy';
import pullIcon from '@/api/server/servericon/McServerIcon';

interface FormikValues {
    iconurl: string;
}

type OwnProps = RequiredModalProps;

const ServerIconMcModal = ({ ...props }: OwnProps) => {
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const { addFlash, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);
    const { clearAndAddHttpError } = useFlash();
    const submit = ({ iconurl }: FormikValues, { setSubmitting }: FormikHelpers<FormikValues>) => {
        clearFlashes('files');
        const slashnumber = iconurl.lastIndexOf('/');
        const filenamewithextention = iconurl.substring(slashnumber + 1);
        const filename = filenamewithextention.split('.')[0];
        const filetype = iconurl.substring(iconurl.lastIndexOf('.') + 1);
        const rooturl = window.location.origin;
        console.log(filename + '.' + filetype);
        pullIcon(uuid, '', iconurl, filename, filetype, rooturl).catch(error => {
            addFlash({
                key: 'settings',
                type: 'error',
                message: 'Error please try again',
            });
            clearAndAddHttpError({ error, key: 'files' });
        }).then(() => {
            addFlash({
                key: 'settings',
                type: 'success',
                message: 'Server icon changed successfully',
            });
            props.onDismissed();
            setSubmitting(false);
        });
    };

    return (
        <Formik onSubmit={submit} initialValues={{ iconurl: '' }}>
            {({ isSubmitting }) => (
                <Modal {...props} dismissable={!isSubmitting} showSpinnerOverlay={isSubmitting}>
                    <Form css={tw`m-0`}>
                        <div css={tw`flex flex-wrap items-end`}>
                            <div css={tw`w-full sm:flex-1 sm:mr-4`}>
                                <Field
                                    type={'string'}
                                    name={'iconurl'}
                                    label={'Icon URL'}
                                    autoFocus
                                />
                            </div>
                            <div css={tw`w-full sm:w-auto mt-4 sm:mt-0`}>
                                <Button css={tw`w-full`}>Update server icon</Button>
                            </div>
                        </div>
                    </Form>
                </Modal>
            )}
        </Formik>
    );
};

export default ServerIconMcModal;
