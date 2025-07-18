import React, { useState } from 'react';
import getSubdomain, { SubdomainData } from '@/api/server/bagou/subdomains/getSubdomain';
import { ServerContext } from '@/state/server';
import useFlash from '@/plugins/useFlash';
import deleteSubdomain from '@/api/server/bagou/subdomains/deleteSubdomain';
import { httpErrorToHuman } from '@/api/http';
import Modal from '@/components/elements/Modal';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import GreyRowBox from '@/components/elements/GreyRowBox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSitemap, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import CopyOnClick from '@/components/elements/CopyOnClick';
import Can from '@/components/elements/Can';
import Spinner from "@/components/elements/Spinner";

export default function SubdomainsRow({ subdomain }: { subdomain: SubdomainData }) {
    const [visible, setVisible] = useState<boolean>(false);
    const [isLoading, setLoading] = useState<boolean>(false);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { addError, clearFlashes } = useFlash();
    const { mutate } = getSubdomain();

    const deleteElement = () => {
        setLoading(true);
        clearFlashes('server:subdomains');
        deleteSubdomain(uuid, subdomain.id)
            .then((data) => {
                if (data.data.status !== 'success') {
                    addError({ key: 'server:subdomains', message: data.data.message });
                }
                mutate();
                setLoading(false);
                setVisible(false);
            })
            .catch((e) => {
                addError({ key: 'server:subdomains', message: httpErrorToHuman(e) });
                mutate();
                setLoading(false);
                setVisible(false);
            });
    };
    return (
        <>
            <Modal
                visible={visible}
                dismissable={!isLoading}
                showSpinnerOverlay={isLoading}
                onDismissed={() => {
                    setVisible(false);
                }}
            >
                <FlashMessageRender byKey={'database:delete'} css={tw`mb-6`} />
                <h2 css={tw`text-2xl mb-6`}>Confirm database deletion</h2>
                <p css={tw`text-sm`}>
                    Deleting a subdomain is a permanent action, it cannot be undone. This will permanently delete the{' '}
                    <strong>
                        {subdomain.name}.{subdomain.domain.name}
                    </strong>{' '}
                    subdomain.
                </p>
                <div css={tw`mt-6 text-right`}>
                    <Button type={'button'} isSecondary css={tw`mr-2`} onClick={() => setVisible(false)}>
                        Cancel
                    </Button>
                    <Button type={'submit'} onClick={() => deleteElement()} color={'red'} disabled={isLoading}>
                        Delete subdomain
                    </Button>
                </div>
            </Modal>
            <GreyRowBox $hoverable={false} css={tw`mb-2`}>
                <div css={tw`hidden md:block`}>
                    <FontAwesomeIcon icon={faSitemap} fixedWidth />
                </div>
                <div css={tw`flex-1 ml-4`}>
                    <CopyOnClick text={subdomain.name + '.' + subdomain.domain.name}>
                        <p css={tw`text-lg`}>{subdomain.name + '.' + subdomain.domain.name}</p>
                    </CopyOnClick>
                </div>
                <div css={tw`ml-8 text-center hidden md:block`}>
                    <CopyOnClick text={subdomain.name}>
                        <p css={tw`text-sm`}>{subdomain.name}</p>
                    </CopyOnClick>
                    <p css={tw`mt-1 text-2xs text-neutral-500 uppercase select-none`}>Name</p>
                </div>
                <div css={tw`ml-8 text-center hidden md:block`}>
                    <CopyOnClick text={subdomain.domain.name}>
                        <p css={tw`text-sm`}>{subdomain.domain.name}</p>
                    </CopyOnClick>
                    <p css={tw`mt-1 text-2xs text-neutral-500 uppercase select-none`}>Domain</p>
                </div>
                <div css={tw`ml-8`}>
                    <Can action={'subdomain.delete'}>
                        <Button color={'red'} isSecondary onClick={() => setVisible(true)}>
                            <FontAwesomeIcon icon={faTrashAlt} fixedWidth />
                        </Button>
                    </Can>
                </div>
            </GreyRowBox>
        </>
    );
}
