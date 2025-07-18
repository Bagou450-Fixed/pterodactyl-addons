import React, { useEffect } from 'react';
import Spinner from '@/components/elements/Spinner';
import useFlash from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import getMinecrafttemplate from '@/api/swr/getMinecrafttemplate';
import MinecraftTemplateRow from './MinecraftTemplateRow';

const MinecraftTemplateContainer = () => {
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { data: minecraftemplate, error, isValidating } = getMinecrafttemplate();
    useEffect(() => {
        if (!error) {
            clearFlashes('server:minecraftbase');

            return;
        }

        clearAndAddHttpError({ error, key: 'server:minecraftbase' });
    }, [ error ]);

    if (!minecraftemplate || (error && isValidating)) {
        return <Spinner size={'large'} centered/>;
    }

    return (
        <ServerContentBlock title={'Minecraft Template'}>
            <FlashMessageRender byKey={'server:minecraftemplate'} css={tw`mb-4`}/>
            {!minecraftemplate.length ?
                <p css={tw`text-center text-sm text-neutral-300`}>
                    It looks like you don&apos;t have any minecraft template.
                </p>
                :
                minecraftemplate.map((data: { id: React.Key | undefined; }, index: number) => (
                    <MinecraftTemplateRow
                        key={data.id}
                        minecrafttemplate={data}
                        css={index > 0 ? tw`mt-2` : undefined}
                    />
                ))
            }
        </ServerContentBlock>
    );
};

export default () => {
    return (
        <MinecraftTemplateContainer/>
    );
};
