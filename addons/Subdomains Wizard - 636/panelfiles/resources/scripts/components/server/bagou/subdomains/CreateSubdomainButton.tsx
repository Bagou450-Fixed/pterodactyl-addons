import React, { useEffect, useState } from 'react';
import Modal from '@/components/elements/Modal';
import { Form, Formik, FormikHelpers } from 'formik';
import Field from '@/components/elements/Field';
import { object, string } from 'yup';
import { ServerContext } from '@/state/server';
import { httpErrorToHuman } from '@/api/http';
import FlashMessageRender from '@/components/FlashMessageRender';
import useFlash from '@/plugins/useFlash';
import Button from '@/components/elements/Button';
import tw from 'twin.macro';
import getSubdomain, { TemplateItem } from '@/api/server/bagou/subdomains/getSubdomain';
import Select from '@/components/elements/Select';
import createSubdomain from '@/api/server/bagou/subdomains/createSubdomain';
import Label from '@/components/elements/Label';

interface Values {
    name: string;
}

const schema = object().shape({
    name: string()
        .required('A subdomain name must be provided.')
        .min(3, 'Subdomain name must be at least 3 characters.')
        .max(25, 'Subdomain name must not exceed 25 characters.')
        .matches(/^[A-Za-z0-9]{3,48}$/, 'Subdomain name should only contain alphanumeric characters.'),
});

export default ({ templates }: { templates: TemplateItem[] }) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { addError, clearFlashes } = useFlash();
    const [visible, setVisible] = useState(false);
    const [template, setTemplate] = useState<TemplateItem | null>(null);
    const [domain, setDomain] = useState<string>('');
    const { mutate } = getSubdomain();

    useEffect(() => {
        if (templates.length > 0) {
            const initialTemplate = templates[0];
            setTemplate(initialTemplate);
            setDomain(initialTemplate.domain);
        }
    }, [templates]);
    const handleTemplateChange = (value: number) => {
        const filter = templates.filter((template) => template.id === value);
        if (filter.length > 0) {
            setTemplate(filter[0]);
        }
    };
    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('server:subdomains');
        if (template) {
            createSubdomain(uuid, template.id, values.name)
                .then((data) => {
                    if (data.data.status !== 'success') {
                        addError({ key: 'server:subdomains', message: data.data.message });
                    }
                    mutate();
                    setVisible(false);
                    setSubmitting(false);
                })
                .catch((e) => {
                    if(e.response && e.response.data && e.response.data.status === 'error') {
                        addError({ key: 'server:subdomains', message: e.response.data.message});

                    } else {
                        addError({ key: 'server:subdomains', message: httpErrorToHuman(e) });
                    }
                    mutate();
                    setVisible(false);
                    setSubmitting(false);
                });
        } else {
            addError({ key: 'server:subdomains', message: 'Template not found!' });
            mutate();
            setVisible(false);
            setSubmitting(false);
        }

    };
    if (!template || !domain || domain === '') {
        return <></>;
    }
    console.log(templates.filter((template) => template.domain === domain).length);
    return (
        <>
            <Formik onSubmit={submit} initialValues={{ name: '' }} validationSchema={schema}>
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
                        <FlashMessageRender byKey={'database:create'} css={tw`mb-6`} />
                        <h2 css={tw`text-2xl mb-6`}>Create new subdomain</h2>
                        <Form css={tw`m-0`}>
                            <div css={tw`gap-x-2 grid grid-cols-2`}>
                                <Field type={'string'} id={'name'} name={'name'} label={'Subdomain name'} />
                                <Select
                                    onChange={(e) => setDomain(e.target.value)}
                                    name={domain}
                                    defaultValue={domain}
                                    css={tw`h-12 mt-auto`}
                                    disabled={templates.length === 0}
                                >
                                    {[...new Set(templates.map((item) => item.domain))].map((domain, index) => (
                                        <option key={index} value={domain}>
                                            {domain}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div css={tw`mt-6`}>
                                <Label>record template</Label>
                                <Select
                                    onChange={(e) => handleTemplateChange(parseInt(e.target.value))}
                                    name={template.name}
                                    defaultValue={template.id}
                                    disabled={templates.filter((template) => template.domain === domain).length < 1}
                                >
                                    {templates
                                        .filter((template) => template.domain === domain)
                                        .map((selectValue) => (
                                            <option key={selectValue.id} value={selectValue.id}>
                                                {selectValue.name}
                                            </option>
                                        ))}
                                </Select>
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
                                <Button css={tw`w-full mt-4 sm:w-auto sm:mt-0`} type={'submit'}>
                                    Create Database
                                </Button>
                            </div>
                        </Form>
                    </Modal>
                )}
            </Formik>
            <Button onClick={() => setVisible(true)}>New Subdomain</Button>
        </>
    );
};
