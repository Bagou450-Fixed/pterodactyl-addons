import React, { useCallback, useState } from 'react';
import { Form, Formik } from 'formik';
import Field from '@/components/elements/Field';
import { number, object, string } from 'yup';
import { ServerContext } from '@/state/server';
import useFlash from '@/plugins/useFlash';
import Button from '@/components/elements/Button';
import tw from 'twin.macro';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import importer from '@/api/server/files/importer';
import FlashMessageRender from '@/components/FlashMessageRender';
import Switch from '@/components/elements/Switch';
import Select from '@/components/elements/Select';
import Label from '@/components/elements/Label';
import Modal from '@/components/elements/Modal';

interface Values {
    user: string;
    password: string;
    hote: string;
    port: string;
    srcdestination: string;
    dstdestination: string;
}

const ImporterContainer = () => {
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const [ loading, setLoading ] = useState(false);
    const { clearAndAddHttpError } = useFlash();
    const [ type, setType ] = useState('sftp');
    const [ wipe, setWipe ] = useState(true);
    const [ visible, setModalVisible ] = useState(false);
    const select = useCallback((v: React.ChangeEvent<HTMLSelectElement>) => {
        setType(v.currentTarget.value);
    }, [ uuid ]);
    const submit = (values: Values) => {
        setLoading(true);

        importer(uuid, values.user, values.password, values.hote, values.port, values.srcdestination, values.dstdestination, wipe, type).catch(error => {
            clearAndAddHttpError({ key: 'server:importer', error });
            setLoading(false);
            setModalVisible(false);
        })
            .then(() => { setLoading(false); setModalVisible(false); location.reload(); });
    };

    return (
        <>
            <Modal
                visible={visible}
                dismissable={!loading}
                showSpinnerOverlay={loading}
                onDismissed={() => {
                    setModalVisible(false);
                } }
            >
                <h1 css={tw`text-2xl mb-4`}>Server import: </h1>
                <Label css={tw`mx-2`}>Type of server:</Label>
                <div css={tw`mx-2`}>
                    <Select onChange={select} defaultValue={'sftp'}>
                        <option key={'sftp'} value={'sftp'}>[i] Sftp</option>
                        <option key={'ftp'} value={'ftp'}>[i] FTP</option>
                    </Select>
                </div>
                <Formik
                    onSubmit={submit}
                    initialValues={{
                        user: '',
                        password: '',
                        hote: '',
                        port: '',
                        srcdestination: '/',
                        dstdestination: '/',
                    }}
                    validationSchema={object().shape({
                        user: string().required().min(1),
                        password: string().required().min(1),
                        hote: string().required().min(1),
                        port: number().required().min(0).max(65535),
                        srcdestination: string().optional().min(1),
                        dstdestination: string().optional().min(1),
                    })}
                >

                    <Form css={tw`mt-2 flex grid grid-cols-1 md:grid-cols-2`}>
                        <div css={tw`mt-6 mx-2`}>
                            <Field
                                id={'user'}
                                name={'user'}
                                label={'User'}
                                type={'text'}
                            />
                        </div>
                        <div css={tw`mt-6 mx-2`}>
                            <Field
                                id={'password'}
                                name={'password'}
                                type={'password'}
                                label={'Password'}
                            />
                        </div>
                        <div css={tw`mt-6 mx-2`}>
                            <Field
                                id={'hote'}
                                name={'hote'}
                                label={'Server ip'}
                                type={'text'}
                            />
                        </div>
                        <div css={tw`mt-6 mx-2`}>
                            <Field
                                id={'port'}
                                name={'port'}
                                label={'Server Port'}
                                type={'text'}
                            />
                        </div>
                        <div css={tw`mt-6 mx-2`}>
                            <Field
                                id={'srcdestination'}
                                name={'srcdestination'}
                                label={'Source folder'}
                                description={'The sftp folder where files are taken'}
                                type={'text'}
                            />
                        </div>
                        <div css={tw`mt-6 mx-2`}>
                            <Field
                                id={'dstdestination'}
                                name={'dstdestination'}
                                label={'Destination Folder'}
                                description={'The server folder where files are downloaded'}
                                type={'text'}
                            />
                        </div>
                        <div css={tw`mt-6 mx-2`}>

                            <Label>Deletes all files from server (not the sftp/ftp server)?</Label>

                            <Switch
                                name={'dstdestination'}
                                onChange={() => setWipe(!wipe)}
                                defaultChecked={wipe}
                            />
                        </div>

                        <div css={tw`mt-6 text-right`}>
                            <Button type={'submit'}>
                            Import from sftp
                            </Button>
                        </div>
                    </Form>
                </Formik>
            </Modal>
            <FlashMessageRender byKey={'server:importer'} css={tw`mb-2 mx-auto`} />
            <TitledGreyBox title={'Server importer'} css={tw`relative`}>
                <p css={tw`text-sm`}>
                    Import server import files from a sftp/ftp server.&nbsp;
                    <strong css={tw`font-medium`}>
                        When import start the server is stoped and are blocked during import.
                    </strong>
                </p>
                <div css={tw`mt-6 text-right`}>
                    <Button
                        type={'button'}
                        color={'red'}
                        isSecondary
                        onClick={() => setModalVisible(true)}
                    >
                        Import Server
                    </Button>
                </div>
            </TitledGreyBox>
        </>

    );
};

export default ImporterContainer;
