import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import tw from 'twin.macro';
import useFlash from '@/plugins/useFlash';
import GreyRowBox from '@/components/elements/GreyRowBox';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { ServerContext } from '@/state/server';
import { ApplicationStore } from '@/state';
import { Actions, useStoreActions } from 'easy-peasy';
import updateStartupVariable from '@/api/server/updateStartupVariable';
import ConfirmationModal from '@/components/elements/ConfirmationModal';
import reinstallServer from '@/api/server/reinstallServer';
import { httpErrorToHuman } from '@/api/http';

interface Props {
    fivemartifacts: any;
    className?: string;
}

export default ({ fivemartifacts, className }: Props) => {
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const [ loading, setLoading ] = useState(false);
    const { clearAndAddHttpError } = useFlash();
    const { addFlash } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);
    const file = 'https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/' + fivemartifacts.url;
    const [ modalVisible, setModalVisible ] = useState(false);

    const installArtifacts = () => {
        if (file === null || file === undefined) return;

        setLoading(true);
        console.log(file);
        updateStartupVariable(uuid, 'FIVEM_VERSION', fivemartifacts.version)
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ error, key: 'FiveMArtifacts' });
            })
            .then(() => {
                updateStartupVariable(uuid, 'DOWNLOAD_URL', 'https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/' + fivemartifacts.url)
                    .catch(error => {
                        console.error(error);
                        clearAndAddHttpError({ error, key: 'FiveMArtifacts' });
                    })
                    .then(() => {
                        reinstallServer(uuid)
                            .then(() => {
                                addFlash({
                                    key: 'settings',
                                    type: 'success',
                                    message: 'Artifacts changer avec succes',
                                });
                                addFlash({
                                    key: 'settings',
                                    type: 'success',
                                    message: 'Réinstallation du serveur en cours...',
                                });
                            })
                            .catch(error => {
                                console.error(error);

                                addFlash({ key: 'settings', type: 'error', message: httpErrorToHuman(error) });
                            })
                            .then(() => {
                                setLoading(false);
                                setModalVisible(false);
                            });
                    });
            });
    };
    return (
        <GreyRowBox css={tw`flex-wrap md:flex-nowrap items-center`} className={className}>
            <SpinnerOverlay visible={loading || false} fixed/>
            <ConfirmationModal
                title={'Charger l\'artifacts du serveur'}
                buttonText={'Oui, changer mon artifacts'}
                onConfirmed={installArtifacts}
                visible={modalVisible}
                onModalDismissed={() => setModalVisible(false)}
            >
                Votre serveur va s&apos;eteindre et toutes ses données vont etre supprimées CETTE ACTION EST IRREVERSIBLE. Êtes-vous sûr de vouloir continuer?
            </ConfirmationModal>
            <div css={tw`flex items-center truncate w-full md:flex-1`}>
                <div css={tw`flex flex-col truncate`}>
                    <div css={tw`flex items-center text-sm mb-1`}>
                        <div css={tw`w-10 h-10 rounded-lg bg-white border-2 border-neutral-800 overflow-hidden hidden md:block`}>
                            <img css={tw`w-full h-full`} alt={fivemartifacts.id} src={'https://cdn.discordapp.com/attachments/751908883005440071/874683743368020019/5338497-middle.png'}/>

                        </div>
                        <a href={file} css={tw`ml-4 break-words truncate`}>
                            Artifact : {fivemartifacts.number}
                            {fivemartifacts.type === 'recommended' &&
                                <p>
                                    <span css={tw`bg-green-500 py-1 px-2 rounded text-green-50 text-xs`}>Dernier recomander</span>
                                </p>
                            }
                            {fivemartifacts.type === 'optional' &&
                                 <p>
                                     <span css={tw`bg-yellow-800 py-1 px-2 rounded text-green-50 text-xs`}>Dernier optionel</span>
                                 </p>
                            }
                        </a>
                    </div>
                </div>
            </div>
            <div css={tw`mt-4 md:mt-0 ml-6`} style={{ marginRight: '-0.5rem' }}>
                <button
                    type={'button'}
                    aria-label={'Install'}
                    css={tw`block text-sm p-1 md:p-2 text-neutral-500 hover:text-neutral-100 transition-colors duration-150 mx-4`}
                    onClick={() => setModalVisible(true)}
                >
                    <FontAwesomeIcon icon={faDownload} /> Installer
                </button>
            </div>
        </GreyRowBox>
    );
};
