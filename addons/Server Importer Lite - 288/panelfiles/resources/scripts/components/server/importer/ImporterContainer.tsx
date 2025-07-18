import React, { useState } from 'react';
import { Form, Formik } from 'formik';
import Field from '@/components/elements/Field';
import { boolean, object, string } from 'yup';
import { ServerContext } from '@/state/server';
import useFlash from '@/plugins/useFlash';
import Button from '@/components/elements/Button';
import tw from 'twin.macro';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import importer from '@/api/server/files/importer';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';

interface Values {
    user: string;
    password: string;
    hote: string;
    port: string;
    removeall: boolean;
}

const ImporterContainer = () => {
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const [ loading, setLoading ] = useState(false);
    const { clearAndAddHttpError } = useFlash();

    const submit = (values: Values) => {
        setLoading(true);

        importer(uuid, values.user, values.password, values.hote, values.port).catch(error => {

            clearAndAddHttpError({ key: 'importer', error });
        })
            .then(() => setLoading(false));
    };

    return (
        <ServerContentBlock title={'Importer'}>
            <SpinnerOverlay visible={loading} fixed/>
            <TitledGreyBox title={'Server importer'} css={tw`relative`}>
                <p>You can here import file from a sftp server</p>
                <Formik
                    onSubmit={submit}
                    initialValues={{
                        user: '',
                        password: '',
                        hote: '',
                        port: '',
                        removeall: false,
                    }}
                    validationSchema={object().shape({
                        user: string().required().min(1),
                        password: string().required().min(1),
                        hote: string().required().min(1),
                        port: string().required().min(1),
                        removeall: boolean().required(),
                    })}
                >
                    <Form css={tw`mt-2`}>
                        <div css={tw`mt-6`}>
                            <Field
                                id={'user'}
                                name={'user'}
                                label={'User'}
                                type={'text'}

                            />
                        </div>
                        <div css={tw`mt-6`}>
                            <Field
                                id={'password'}
                                name={'password'}
                                type={'password'}
                                label={'Password'}
                            />
                        </div>
                        <div css={tw`mt-6`}>
                            <Field
                                id={'hote'}
                                name={'hote'}
                                label={'Server ip'}
                                type={'text'}
                            />
                        </div>
                        <div css={tw`mt-6`}>
                            <Field
                                id={'port'}
                                name={'port'}
                                label={'Server Port'}
                                type={'text'}
                            />
                        </div>
                        <div css={tw`mt-6`}>
                            <h1>This action will delete all files from the server !!!</h1>
                        </div>
                        <div css={tw`mt-6 text-right`}>
                            <Button type={'submit'}>
                        Import from sftp
                            </Button>
                        </div>
                    </Form>
                </Formik>
            </TitledGreyBox>
        </ServerContentBlock>
    );
};

export default ImporterContainer;
