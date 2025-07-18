import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faDownload, faWindowClose } from '@fortawesome/free-solid-svg-icons';
import tw from 'twin.macro';
import useFlash from '@/plugins/useFlash';
import GreyRowBox from '@/components/elements/GreyRowBox';
import { ServerContext } from '@/state/server';
import decompressFiles from '@/api/server/files/decompressFiles';
import pullFiles from '@/api/server/files/pullFiles';
import { ApplicationStore } from '@/state';
import { Actions, useStoreActions } from 'easy-peasy';
import ConfirmationModal from '@/components/elements/ConfirmationModal';
import deleteFiles from '@/api/server/files/deleteFiles';
import loadDirectory from '@/api/server/files/loadDirectory';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import fileSize from '@/api/server/files/fileSize';
import downloadedSize from '@/api/server/files/downloadedSize';
interface Props {
    minecrafttemplate: any;
    className?: string;
}

export default ({ minecrafttemplate, className }: Props) => {
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const [ loading, setLoading ] = useState(false);
    const { clearAndAddHttpError } = useFlash();
    const { addFlash, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);
    const [ visible, setVisible ] = useState(false);
    const [ pourcentage, setpourcentage ] = useState('0%');
    let logourl = 'https://static.spigotmc.org/styles/spigot/xenresource/resource_icon.png';
    if (minecrafttemplate.logourl !== '') {
        logourl = minecrafttemplate.logourl;
    }
    function clear () {
        clearFlashes();
    }
    const installMinecraftTemplate = () => {
        setLoading(true);
        setVisible(false);
        if (minecrafttemplate.removeall) {
            setpourcentage('25% Remove all files.');
            loadDirectory(uuid, '/').then((data) => {
                for (const file of data) {
                    deleteFiles(uuid, '/', [ file.name ]).catch(function (error) {
                        setLoading(false);
                        clearAndAddHttpError({ key: 'server:minecrafttemplate', error });
                    });
                }
            }).catch(function (error) {
                setLoading(false);
                clearAndAddHttpError({ key: 'server:minecrafttemplate', error });
            });
        }
        pullFiles(uuid, '/', minecrafttemplate.baseurl)
            .then(function () {
                fileSize(uuid, minecrafttemplate.baseurl).then((data) => {
                    if (minecrafttemplate.zip) {
                        setpourcentage('50% Download in progress');
                    } else {
                        setpourcentage('75% Download in progress');
                    }
                    const size = data;
                    let downloaded = 0;
                    const Download = setInterval(function () {
                        if (downloaded !== size) {
                            downloadedSize(uuid, minecrafttemplate.baseurl.substring(minecrafttemplate.baseurl.lastIndexOf('/') + 1)).then((data) => {
                                if (minecrafttemplate.zip) {
                                    setpourcentage('75% Download in progress... ' + Math.round((Math.round(data) - Math.round(downloaded)) / 1000000) + 'mb/s (' + Math.round(data / 1000000) + 'mb/' + Math.round(size / 1000000) + 'mb)');
                                } else {
                                    setpourcentage('75% Download in progress... ' + Math.round((Math.round(data) - Math.round(downloaded)) / 1000000) + 'mb/s (' + Math.round(data / 1000000) + 'mb/' + Math.round(size / 1000000) + 'mb)');
                                }
                                downloaded = data;
                            }).catch(error => {
                                console.log(error);
                                setLoading(false);
                            });
                        } else {
                            clearInterval(Download);
                            setpourcentage('75% Download finished');
                            if (minecrafttemplate.zip) {
                                setpourcentage('75% Decompress files');
                                decompressFiles(uuid, '/', minecrafttemplate.baseurl.substring(minecrafttemplate.baseurl.lastIndexOf('/') + 1))
                                    .then(function () {
                                        setpourcentage('90% Delete compressed files...');
                                        deleteFiles(uuid, '/', [ `${minecrafttemplate.baseurl.substring(minecrafttemplate.baseurl.lastIndexOf('/') + 1)}` ])
                                            .then(function () {
                                                addFlash({
                                                    key: 'server:minecrafttemplate',
                                                    type: 'success',
                                                    message: 'Template installed successfully',
                                                });
                                                setLoading(false);
                                                setTimeout(clear, 3000);
                                            }).catch(function (error) {
                                                setLoading(false);
                                                clearAndAddHttpError({ key: 'server:minecrafttemplate', error });
                                            });
                                    })
                                    .catch(function (error) {
                                        setLoading(false);
                                        clearAndAddHttpError({ key: 'server:minecrafttemplate', error });
                                    });
                            } else {
                                addFlash({
                                    key: 'server:minecrafttemplate',
                                    type: 'success',
                                    message: 'Template installed successfully',
                                });
                                setLoading(false);
                                setTimeout(clear, 3000);
                            }
                        }
                    }, 500);
                }).catch(function (error) {
                    setLoading(false);
                    clearAndAddHttpError({ key: 'server:minecrafttemplate', error });
                });
            })
            .catch(function (error) {
                setLoading(false);
                clearAndAddHttpError({ key: 'server:minecrafttemplate', error });
            });
    };

    return (
        <GreyRowBox css={tw`flex-wrap md:flex-nowrap items-center`} className={className}>
            <SpinnerOverlay visible={loading || false} fixed>{pourcentage}</SpinnerOverlay>
            <ConfirmationModal
                visible={visible}
                title={`Install ${minecrafttemplate.name}?`}
                buttonText={'Install'}
                onConfirmed={() => installMinecraftTemplate()}
                onModalDismissed={() => setVisible(false)}
            >
                <p css={tw`text-neutral-300 mt-4`}>
                    {minecrafttemplate.removeall ?
                        'This action remove all files of the server. Are you sure you want to continue?'
                        :
                        'This action remove old files releated to this template. Are you sure you want to continue?'
                    }
                </p>
            </ConfirmationModal>
            <div css={tw`flex items-center truncate w-full md:flex-1`}>
                <div css={tw`flex flex-col truncate`}>
                    <div css={tw`flex items-center text-sm mb-1`}>
                        <div css={tw`w-10 h-10 overflow-hidden hidden md:block`}>
                            <img css={tw`w-full h-full`} alt={minecrafttemplate.name} src={logourl}/>
                        </div>
                        <div css={tw`ml-4`}>
                            {minecrafttemplate.name}
                        </div>
                    </div>

                </div>

            </div>
            <div css={tw`flex-1 md:flex-none md:ml-5 md:w-4/12 mt-4 ml-5 md:mt-0 md:text-center`}>
                <p css={tw`text-sm`}>
                    {minecrafttemplate.smalldescription}
                </p>
            </div>
            <div css={tw`flex-none md:flex-none hidden md:block md:w-48 mt-4 md:mt-0 md:ml-1 md:text-center`}>
                <p css={tw`text-2xs text-neutral-500 uppercase mt-1`}>Compressed</p>
                <p>
                    {minecrafttemplate.zip ?
                        <FontAwesomeIcon icon={faCheck} color='green'/>
                        :
                        <FontAwesomeIcon icon={faWindowClose} color='red'/>

                    }
                </p>
            </div>
            <div css={tw`flex-none md:flex-none hidden md:block md:w-48 mt-4 md:mt-0 md:ml-1 md:text-center`}>
                <p css={tw`text-2xs text-neutral-500 uppercase mt-1`}>Remove all files</p>
                <p>
                    {minecrafttemplate.removeall ?
                        <FontAwesomeIcon icon={faCheck} color='green'/>
                        :
                        <FontAwesomeIcon icon={faWindowClose} color='red'/>

                    }
                </p>
            </div>
            <div css={tw`mt-4 md:mt-0 ml-6`} style={{ marginRight: '-0.5rem' }}>
                <button
                    type={'button'}
                    aria-label={'Install'}
                    css={tw`block text-sm p-1 md:p-2 text-neutral-500 hover:text-neutral-100 transition-colors duration-150 mx-4`}
                    onClick={() => setVisible(true)}
                >
                    <FontAwesomeIcon icon={faDownload} /> Install
                </button>
            </div>
        </GreyRowBox>
    );
};
