import React, { useContext, useEffect, useState } from 'react';
import Spinner from '@/components/elements/Spinner';
import useFlash from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import ArtifactsRow from '@/components/server/artifacts/ArtifactsRow';
import tw from 'twin.macro';
import getFiveMArtifacts, { Context as ServerArtifactsContext } from '@/api/swr/getFiveMArtifacts';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Pagination from '@/components/elements/Pagination';

const ArtifactsContainer = () => {
    const { setPage } = useContext(ServerArtifactsContext);
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const { data: FiveMArtifacts, error, isValidating } = getFiveMArtifacts();

    useEffect(() => {
        if (!error) {
            clearFlashes('FiveMArtifacts');

            return;
        }

        clearAndAddHttpError({ error, key: 'FiveMArtifacts' });
    }, [ error ]);

    if (!FiveMArtifacts || (error && isValidating)) {
        return <Spinner size={'large'} centered/>;
    }

    return (
        <ServerContentBlock title={'FiveM Artifacts'} css={tw`bg-transparent`}>
            <FlashMessageRender byKey={'FiveMArtifacts'} css={tw`mb-4`}/>
            <div css={tw`grid grid-cols-3`}>
            <Pagination data={FiveMArtifacts} onPageSelect={setPage} css={tw`col-span-3`}>
                {({ items }) => (
                    !items.length ?
                        <p css={tw`text-center text-sm text-neutral-300 col-span-3`}>
                                No artifacts found

                        </p>
                        :
                        items.map((FiveMArtifacts, index) => <ArtifactsRow
                            key={FiveMArtifacts.number}
                            fivemartifacts={FiveMArtifacts}
                            css={tw`mt-2 mr-2`}
                        />)
                )}
            </Pagination>
            </div>
        </ServerContentBlock>
    );
};

export default () => {
    const [ page, setPage ] = useState<number>(1);
    const [ searchFilter, setSearchFilter ] = useState<string>('');

    return (
        <ServerArtifactsContext.Provider value={{ page, setPage, searchFilter, setSearchFilter }}>
            <ArtifactsContainer/>
        </ServerArtifactsContext.Provider>
    );
};

