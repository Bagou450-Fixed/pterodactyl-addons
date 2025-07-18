/* eslint-disable no-mixed-operators */
/* eslint-disable no-return-assign */
/* eslint-disable no-var */
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArchive, faEllipsisH, faLock, faTrash } from '@fortawesome/free-solid-svg-icons';
import { format, formatDistanceToNow } from 'date-fns';
import Spinner from '@/components/elements/Spinner';
import { bytesToHuman } from '@/helpers';
import Can from '@/components/elements/Can';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import tw from 'twin.macro';
import GreyRowBox from '@/components/elements/GreyRowBox';
import getServerBanIp from '@/api/swr/getServerBanIp';
import { ServerBanIp } from '@/api/server/types';
import { SocketEvent } from '@/components/server/events';
import { request } from 'https';
import axios from 'axios';
import unbanip from '@/api/server/banip/unbanip';
import { ServerContext } from '@/state/server';
import useFlash from '@/plugins/useFlash';
import Button from '@/components/elements/Button';

interface Props {
    BanIp: ServerBanIp;
}

export default ({ BanIp }: Props) => {
    const { mutate } = getServerBanIp();
    const primaryAllocation = ServerContext.useStoreState(state => state.server.data!.allocations.filter(alloc => alloc.isDefault).map(
        allocation => allocation.port
    )).toString();
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const [ loading, setLoading ] = useState(false);
    var city = BanIp.city as string;
    var countryname = BanIp.countryname as string;
    var region = BanIp.region as string;

    if (BanIp.city === null || BanIp.city === '') {
        var city = 'Unknow';
    }
    if (BanIp.countryname === null || BanIp.countryname === '') {
        var countryname = 'Unknow';
    }
    if (BanIp.region === null || BanIp.region === '') {
        var region = 'Unknow';
    }

    const UnbanIP = () => {
        setLoading(true);
        unbanip(uuid, BanIp.ip, primaryAllocation).then(banip => { location.reload(); }).catch(error => {
            clearAndAddHttpError({ key: 'banip', error });
            setLoading(false);
        });
    };
    return (
        <GreyRowBox $hoverable={false} css={tw`flex-wrap md:flex-nowrap items-center mt-2`}>
            <div css={tw`flex items-center truncate w-full md:flex-1`}>
                <p title={BanIp.ip} >
                    {BanIp.ip}
                </p>
            </div>
            <div css={tw`flex-1 md:flex-none md:w-48 mt-4 md:mt-0 md:ml-1 md:text-center`}>
                <p css={tw`text-2xs text-neutral-500 uppercase mt-1`}>Country flag</p>
                {countryname === 'Unknow' ?
                    <p title={countryname} >
                                                Unknow
                    </p>
                    :
                    <p title={countryname}>
                        <img src={`https://www.countryflags.io/${BanIp.country?.toLowerCase()}/flat/64.png`} css={tw`inline`}></img>
                    </p>
                }
            </div>
            <div css={tw`flex-1 md:flex-none md:w-48 mt-4 md:mt-0 md:ml-1 md:text-center`}>
                <p css={tw`text-2xs text-neutral-500 uppercase mt-1`}>Region</p>
                <p title={region} >
                    {region}
                </p>
            </div>
            <div css={tw`flex-1 md:flex-none md:w-48 mt-4 md:mt-0 md:ml-1 md:text-center`}>
                <p css={tw`text-2xs text-neutral-500 uppercase mt-1`}>City</p>
                <p title={city} >
                    {city}
                </p>
            </div>
            <div css={tw`mt-4 md:mt-0 ml-6`} style={{ marginRight: '-0.5rem' }}>
                <Button
                    type={'button'}
                    color={'red'}
                    isSecondary
                    onClick={UnbanIP}
                    title="Unban IP"
                >
                    <FontAwesomeIcon icon={faTrash} /> UnBan
                </Button>
            </div>
        </GreyRowBox>
    );
};
