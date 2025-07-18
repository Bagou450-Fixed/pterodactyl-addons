import React, { useEffect } from 'react';
import { ServerContext } from '@/state/server';
import FlashMessageRender from '@/components/FlashMessageRender';
import Spinner from '@/components/elements/Spinner';
import Can from '@/components/elements/Can';
import useFlash from '@/plugins/useFlash';
import tw from 'twin.macro';
import Fade from '@/components/elements/Fade';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import SplitRow from './SplitRow';
import AddSplitButton from './AddSplitButton';
import getSplittedServer from '@/api/server/splitted/getSplittedServer';

export default () => {
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);

    const { clearFlashes } = useFlash();

    const { data, error, isValidating } = getSplittedServer(uuid);
    useEffect(() => {
        clearFlashes('splitted');
    }, []);
    if (!data || (error && isValidating)) {
        return <Spinner size={'large'} centered/>;
    }
    const splittedLimit = data.splitlimit;

    return (
        <ServerContentBlock title={'Splitted server'}>
            <FlashMessageRender byKey={'splitted'} css={tw`mb-4`}/>

            <Fade timeout={150}>

                <>
                    <div css={tw`flex items-center justify-between mb-4`}>
                        <p css={tw`text-base text-white`}> Total CPU: {data.totalall.cpu}%</p>
                        <p css={tw`text-base text-white`}>Total RAM: {data.totalall.memory}mb</p>
                        <p css={tw`text-base text-white`}>Total DISK: {data.totalall.disk}mb</p>
                        <p css={tw`text-base text-white`}>Total SWAP: {data.totalall.swap}mb</p>

                    </div>
                    {data.servers.length > 0 ?
                        data.servers.map((splittedserver, index) => (
                            <SplitRow
                                key={index}
                                splittedserver={splittedserver}
                                className={index > 0 ? 'mt-1' : undefined}
                            />
                        ))
                        :
                        <p css={tw`text-center text-sm text-neutral-300`}>
                            {splittedLimit > 0 ?
                                'It looks like you have no splitted server.'
                                :
                                'You can\'t split this server.'
                            }
                        </p>
                    }
                    <Can action={'split.create'}>
                        <div css={tw`mt-6 flex items-center justify-end`}>
                            {(splittedLimit > 0) &&
                                <p css={tw`text-sm text-neutral-300 mb-4 sm:mr-6 sm:mb-0`}>
                                    This server was splitted in {data.servers.length - 1}. You can split this server {splittedLimit} time.
                                </p>
                            }
                            {splittedLimit > 0 && splittedLimit !== data.servers.length - 1 &&
                                    <AddSplitButton css={tw`flex justify-end mt-6`}/>
                            }
                        </div>
                    </Can>
                </>
            </Fade>

        </ServerContentBlock>
    );
};
