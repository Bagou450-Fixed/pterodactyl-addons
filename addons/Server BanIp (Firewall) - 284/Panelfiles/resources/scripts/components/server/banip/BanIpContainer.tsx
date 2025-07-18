import React, { useContext, useEffect, useState } from 'react';
import Spinner from '@/components/elements/Spinner';
import useFlash from '@/plugins/useFlash';
import Can from '@/components/elements/Can';
import BanIpButton from '@/components/server/banip/BanIpButton';
import FlashMessageRender from '@/components/FlashMessageRender';
import BanIpRow from '@/components/server/banip/BanIpRow';
import tw from 'twin.macro';
import getServerBanIp, { Context as ServerBanIpContext } from '@/api/swr/getServerBanIp';
import { ServerContext } from '@/state/server';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Pagination from '@/components/elements/Pagination';

const BanIpContainer = () => {
    const { page, setPage } = useContext(ServerBanIpContext);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { data: BanIp, error, isValidating } = getServerBanIp();
    console.log(BanIp);
    useEffect(() => {
        if (!error) {
            clearFlashes('backups');

            return;
        }

        clearAndAddHttpError({ error, key: 'backups' });
    }, [ error ]);

    if (!BanIp || (error && isValidating)) {
        return <Spinner size={'large'} centered/>;
    }

    return (
        <ServerContentBlock title={'Ban Ip'}>
            <FlashMessageRender byKey={'banip'} css={tw`mb-4`}/>
            <Pagination data={BanIp} onPageSelect={setPage}>
                {({ items }) => (
                    !items.length ?
                        // Don't show any error messages if the server has no backups and the user cannot
                        // create additional ones for the server.
                        <p css={tw`text-center text-sm text-neutral-300`}>
                            {page > 1 ?
                                'No more ip.'
                                :
                                'No ban ip.'
                            }
                        </p>
                        :
                        items.map((BanIp, index) => <BanIpRow
                            key={BanIp.ip}
                            BanIp={BanIp}
                            css={index > 0 ? tw`mt-2` : undefined}
                        />)
                )}
            </Pagination>
            <Can action={'backup.create'}>
                <div css={tw`mt-6 sm:flex items-center justify-end`}>
                    <BanIpButton css={tw`w-full sm:w-auto`}/>
                </div>
            </Can>
        </ServerContentBlock>
    );
};

export default () => {
    const [ page, setPage ] = useState<number>(1);
    return (
        <ServerBanIpContext.Provider value={{ page, setPage }}>
            <BanIpContainer/>
        </ServerBanIpContext.Provider>
    );
};
