/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/ban-types */
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlayCircle, faRedoAlt, faStopCircle } from '@fortawesome/free-solid-svg-icons';
import tw from 'twin.macro';
import GreyRowBox from '@/components/elements/GreyRowBox';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { ServerContext } from '@/state/server';
import { useStoreActions, Actions } from 'easy-peasy';
import { ApplicationStore } from '@/state';

interface Props {
    FiveMResourcesList: any;
    className?: string;
}

export default ({ FiveMResourcesList, className }: Props) => {
    const { instance } = ServerContext.useStoreState(state => state.socket);
    const name = FiveMResourcesList.Name.charAt(0).toUpperCase() + FiveMResourcesList.Name.slice(1);
    const { addFlash, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);
    const [ loading, setLoading ] = useState(false);
    function clear () {
        clearFlashes();
    }
    const Start = () => {
        setLoading(true);
        instance && instance.send('send command', 'start ' + FiveMResourcesList.Name);
        addFlash({
            key: 'FiveMResources',
            type: 'success',
            message: 'Command : "start ' + name + '" send sucessfully',
        });

        setTimeout(clear, 3000);
        setLoading(false);
    };
    const Stop = () => {
        setLoading(true);
        instance && instance.send('send command', 'stop ' + FiveMResourcesList.Name);
        addFlash({
            key: 'FiveMResources',
            type: 'success',
            message: 'Command : "stop ' + name + '" send sucessfully',
        });
        setTimeout(clear, 3000);
        setLoading(false);
    };
    const Restart = () => {
        setLoading(true);
        instance && instance.send('send command', 'stop ' + FiveMResourcesList.Name);
        instance && instance.send('send command', 'start ' + FiveMResourcesList.Name);

        addFlash({
            key: 'FiveMResources',
            type: 'success',
            message: 'Command : "restart ' + name + '" send sucessfully',
        });
        setTimeout(clear, 3000);
        setLoading(false);
    };
    return (
        <GreyRowBox css={tw`flex-wrap md:flex-nowrap items-center`} className={className}>
            <SpinnerOverlay visible={loading || false} fixed/>
            <div css={tw`flex items-center truncate w-full md:flex-1`}>
                <div css={tw`flex flex-col truncate`}>
                    <div css={tw`flex items-center text-sm mb-1`}>
                        <p css={tw`ml-4 break-words truncate`} title={name}>
                            {name}
                        </p>
                    </div>
                </div>
            </div>
            <div css={tw`ml-6`} style={{ marginRight: '-0.5rem' }}>
                <button
                    type={'button'}
                    aria-label={'Install'}
                    css={tw`block text-sm p-1 md:p-2 text-neutral-500 hover:text-neutral-100 transition-colors duration-150 mx-4 bg-green-800 text-white`}
                    onClick={Start}
                    title="Start the resource"
                >
                    <FontAwesomeIcon icon={faPlayCircle} /> START
                </button>
            </div>
            <div css={tw`ml-6`} style={{ marginRight: '-0.5rem' }}>

                <button
                    type={'button'}
                    aria-label={'Install'}
                    css={tw`block text-sm p-1 md:p-2 text-neutral-500 hover:text-neutral-100 transition-colors duration-150 mx-4 bg-red-800 text-white`}
                    onClick={Stop}
                    title="Stop the resource"
                >
                    <FontAwesomeIcon icon={faStopCircle} /> STOP
                </button>
            </div>

            <div css={tw`ml-6`} style={{ marginRight: '-0.5rem' }}>

                <button
                    type={'button'}
                    aria-label={'Install'}
                    css={tw`block text-sm p-1 md:p-2 text-neutral-500 hover:text-neutral-100 transition-colors duration-150 mx-4 text-white`}
                    style={{ backgroundColor: '#fea93b' }}
                    onClick={Restart}
                    title="Restart the resource"
                >
                    <FontAwesomeIcon icon={faRedoAlt} /> RESTART
                </button>
            </div>
        </GreyRowBox>
    );
};

