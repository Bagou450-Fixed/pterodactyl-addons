import React, { useCallback, useEffect, useState } from 'react';
import Modal, { RequiredModalProps } from '@/components/elements/Modal';
import { Form, Formik, FormikHelpers, useFormikContext } from 'formik';
import { object, string } from 'yup';
import Field from '@/components/elements/Field';
import useFlash from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import Button from '@/components/elements/Button';
import tw from 'twin.macro';
import { ServerContext } from '@/state/server';
import banip from '@/api/server/banip/banip';
import Select from '@/components/elements/Select';
import isEqual from 'react-fast-compare';

interface Values {
    ip: string;
}

const ModalContent = ({ ...props }: RequiredModalProps) => {
    const { isSubmitting } = useFormikContext<Values>();
    return (
        <Modal {...props} showSpinnerOverlay={isSubmitting}>
            <Form>
                <FlashMessageRender byKey={'backups:create'} css={tw`mb-4`}/>
                <h2 css={tw`text-2xl mb-6`}>Ban IP</h2>
                <h3>User IP</h3>
                <Field
                    name={'ip'}
                />
                <h6>The ip of the user. (you can enter ip block)</h6>
                <div css={tw`mt-6 text-right`}>
                    <Button type={'submit'} disabled={isSubmitting}>Ban ip</Button>
                </div>
            </Form>
        </Modal>
    );
};

export default () => {
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const [ visible, setVisible ] = useState(false);
    const primaryAllocation = ServerContext.useStoreState(state => state.server.data!.allocations.filter(alloc => alloc.isDefault).map(
        allocation => allocation.port
    )).toString();
    useEffect(() => {
        clearFlashes('backups:create');
    }, [ visible ]);

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('backups:create');
        console.log(values.ip);
        console.log(values);
        if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(values.ip)) {
            banip(uuid, values.ip, primaryAllocation)
                .then(banip => {
                    setVisible(false);
                    location.reload();
                })
                .catch(error => {
                    clearAndAddHttpError({ key: 'banip', error });
                    setSubmitting(false);
                });
        } else {
            clearAndAddHttpError({ key: 'banip', error: 'Invalid ip format' });
            setVisible(false);
        }
    };

    return (
        <>
            {visible &&
            <Formik
                onSubmit={submit}
                initialValues={{ ip: '' }}
                validationSchema={object().shape({
                    ip: string().max(15),
                })}
            >
                <ModalContent appear visible={visible} onDismissed={() => setVisible(false)}/>
            </Formik>
            }
            <Button css={tw`w-full sm:w-auto`} onClick={() => setVisible(true)}>
            Ban IP
            </Button>
        </>
    );
};
