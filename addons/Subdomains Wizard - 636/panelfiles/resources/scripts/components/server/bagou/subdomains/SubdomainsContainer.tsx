import React from 'react';
import getSubdomain from '@/api/server/bagou/subdomains/getSubdomain';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import Spinner from '@/components/elements/Spinner';
import Fade from '@/components/elements/Fade';
import Can from '@/components/elements/Can';
import { ServerContext } from '@/state/server';
import CreateSubdomainButton from '@/components/server/bagou/subdomains/CreateSubdomainButton';
import SubdomainsRow from '@/components/server/bagou/subdomains/SubdomainsRow';

export default function SubdomainsContainer() {
    const { data, error, isValidating } = getSubdomain();
    const subdomainsLimit = ServerContext.useStoreState((state) => state.server.data!.featureLimits.subdomains);

    if (!data || error || isValidating) {
        return <p>Loading...</p>;
    }
    return (
        <ServerContentBlock title={'Subdomains'}>
            <FlashMessageRender byKey={'server:subdomains'} css={tw`mb-4`} />
            {!data!.domains.data.length && isValidating ? (
                <Spinner size={'large'} centered />
            ) : (
                <Fade timeout={150}>
                    <>
                        {data!.domains.data.length > 0 ? (
                            data!.domains.data.map((subdomain, index) => {
                                return <SubdomainsRow subdomain={subdomain} key={index} />;
                            })
                        ) : (
                            <p css={tw`text-center text-sm text-neutral-300`}>
                                {subdomainsLimit > 0
                                    ? 'It looks like you have no subdomains.'
                                    : 'Subdomains cannot be created for this server.'}
                            </p>
                        )}
                        <Can action={'subdomain.create'}>
                            <div css={tw`mt-6 flex items-center justify-end`}>
                                {subdomainsLimit > 0 && data!.domains.data.length > 0 && (
                                    <p css={tw`text-sm text-neutral-300 mb-4 sm:mr-6 sm:mb-0`}>
                                        {data!.domains.data.length} of {subdomainsLimit} subdomains have been allocated
                                        to this server.
                                    </p>
                                )}
                                {subdomainsLimit > 0 && subdomainsLimit !== data!.domains.data.length && (
                                    <CreateSubdomainButton
                                        templates={data!.templates}
                                        css={tw`flex justify-end mt-6`}
                                    />
                                )}
                            </div>
                        </Can>
                    </>
                </Fade>
            )}
        </ServerContentBlock>
    );
}
