
import React, { useContext, useEffect, useState } from 'react';
import useFlash from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import loadFiveMRessources, { Context as ServerFiveMResourcesContext } from '@/api/server/fivemresources/loadFiveMRessources';
import { ServerContext } from '@/state/server';
import FiveMResourcesRow from './FiveMResourcesRow';
import Pagination from '@/components/elements/PaginationFivemResources';

export interface ResourcesResponse {
    Name: any[];
    Path: any[];
}

const FiveMResourcesContainer = () => {
    const { page, setPage } = useContext(ServerFiveMResourcesContext);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const { data: FiveMResourcesList, error, isValidating } = loadFiveMRessources(uuid);
    const status = ServerContext.useStoreState(state => state.status.value);

    useEffect(() => {
        if (!error) {
            clearFlashes('FiveMResources');

            return;
        }

        clearAndAddHttpError({ error, key: 'FiveMResources' });
    }, [ error ]);

    if (!FiveMResourcesList || (error && isValidating)) {
        return <p css={tw`text-center text-sm text-neutral-300 mb-4 text-white`}>Error contact a administrator.</p>;
    }
    return (
        <ServerContentBlock title={'FiveM Resources'} css={tw`bg-transparent`}>
            {status === 'offline' &&
                <p css={tw`text-center text-sm text-neutral-300`}>
                    Serveur éteinds
                </p>
            }
            <FlashMessageRender byKey={'FiveMResources'} css={tw`mb-4`}/>

            {status !== 'offline' &&
            <Pagination data={FiveMResourcesList} onPageSelect={setPage}>
                {({ items }) => (
                    !items.length ?
                        <p css={tw`text-center text-sm text-neutral-300`}>
                            {page > 1 ?
                                'On dirais qu\'il n\'y a pas plus de resources essayer de revenir en arriere.'
                                :
                                'Aucune resources trouver.'
                            }
                        </p>
                        :
                        items.map((FiveMResourcesList, index) => <FiveMResourcesRow
                            key={FiveMResourcesList.attributes.Name}
                            FiveMResourcesList={FiveMResourcesList.attributes}
                            css={index > 0 ? tw`mt-2` : undefined}
                        />)
                )}
            </Pagination>
            }
        </ServerContentBlock>
    );
};

export default () => {
    const [ page, setPage ] = useState<number>(1);
    const [ searchFilter, setSearchFilter ] = useState<string>('');


    return (
        <ServerFiveMResourcesContext.Provider value={{ page, setPage, searchFilter, setSearchFilter }}>
            <FiveMResourcesContainer/>
        </ServerFiveMResourcesContext.Provider>
    );
};
