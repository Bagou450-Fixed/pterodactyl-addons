/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import { ServerContext } from '@/state/server';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import tw from 'twin.macro';
import FlashMessageRender from '@/components/FlashMessageRender';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import Button from '@/components/elements/Button';
import isEqual from 'react-fast-compare';
import getServerStartup from '@/api/swr/getServerStartup';
import useFlash from '@/plugins/useFlash';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import updateStartupVariable from '@/api/server/updateStartupVariable';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';

export interface AutoRemoverResponse {
  files: any[];
}

export default () => {
  const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
  const { clearFlashes } = useFlash();
  const [loading, setLoading] = useState(false);
  const { addFlash } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

  const variables = ServerContext.useStoreState(
    ({ server }) => ({
      variables: server.data!.variables,
      invocation: server.data!.invocation,
      dockerImage: server.data!.dockerImage,
    }),
    isEqual
  );
  const { data } = getServerStartup(uuid, {
    ...variables,
    dockerImages: { [variables.dockerImage]: variables.dockerImage },
  });
  const gamebuild = data?.variables[8]?.serverValue;
  function clear() {
    clearFlashes();
  }
  // disable
  const disable = () => {
    clearFlashes('server:dlc');
    setLoading(true);
    updateStartupVariable(uuid, 'GAMEBUILD', '')
      .catch((error) => {
        console.error(error);
        setLoading(false);
      })
      .then(() => {
        addFlash({
          key: 'settings',
          type: 'success',
          message: 'DLC deactivated successfully',
        });
        setTimeout(() => clear(), 3000);
      });
  };

  // Los santos Tuners
  const lst = () => {
    clearFlashes('server:dlc');
    setLoading(true);
    updateStartupVariable(uuid, 'GAMEBUILD', '+set sv_enforceGameBuild 2372')
      .catch((error) => {
        console.error(error);
        setLoading(false);
      })
      .then(() => {
        setLoading(false);
        addFlash({
          key: 'settings',
          type: 'success',
          message: 'DLC Los Santos TUNERS successfully activated!',
        });
        setTimeout(() => clear(), 3000);
      });
  };
  // Cayo Perico
  const cayo = () => {
    clearFlashes('server:dlc');
    setLoading(true);
    updateStartupVariable(uuid, 'GAMEBUILD', '+set sv_enforceGameBuild 2189')
      .catch((error) => {
        console.error(error);
        setLoading(false);
      })
      .then(() => {
        setLoading(false);
        addFlash({
          key: 'settings',
          type: 'success',
          message: 'DLC Cayo Perico successfully activated!',
        });
        setTimeout(() => clear(), 3000);
      });
  };

  // Casino + last dlc
  const casino = () => {
    clearFlashes('server:dlc');
    setLoading(true);
    updateStartupVariable(uuid, 'GAMEBUILD', '+set sv_enforceGameBuild 2060')
      .catch((error) => {
        console.error(error);
        setLoading(false);
      })
      .then(() => {
        setLoading(false);
        addFlash({
          key: 'settings',
          type: 'success',
          message: 'DLC Casino + Dernier DLC successfully activated!',
        });
        setTimeout(() => clear(), 3000);
      });
  };

  // The Contract
  const contract = () => {
    clearFlashes('server:dlc');
    setLoading(true);
    updateStartupVariable(uuid, 'GAMEBUILD', '+set sv_enforceGameBuild 2545')
      .catch((error) => {
        console.error(error);
        setLoading(false);
      })
      .then(() => {
        setLoading(false);
        addFlash({
          key: 'settings',
          type: 'success',
          message: 'DLC contract DLC successfully activated!',
        });
        setTimeout(() => location.reload(), 1000);
      });
  };
  // The Criminal Enterprises 
  const criminal = () => {
    clearFlashes('server:dlc');
    setLoading(true);
    updateStartupVariable(uuid, 'GAMEBUILD', '+set sv_enforceGameBuild 2699')
      .catch((error) => {
        console.error(error);
        setLoading(false);
      })
      .then(() => {
        setLoading(false);
        addFlash({
          key: 'settings',
          type: 'success',
          message: 'DLC The Criminal Enterprises successfully activated!',
        });
        setTimeout(() => clear(), 3000);
      });
  };
  return (
    <ServerContentBlock title={'Configuration du TxAdmin'} css={tw`bg-transparent`}>
      <FlashMessageRender byKey={'dlc'} css={tw`mb-4`} />
      <SpinnerOverlay visible={loading} fixed />
      <div css={tw`grid grid-cols-4 `}>

{gamebuild === '+set sv_enforceGameBuild 2372' ? (
          <div css={tw`px-1 py-2`}>
            <TitledGreyBox title={'LOS SANTOS TUNERS'}>
            <div css={tw`px-1 py-2`}>Press &quot;deactivate&quot; to deactivate the Los Santos TUNERS DLC.</div>
            <div css={tw`flex justify-end`}>
                <Button onClick={disable}>Desactivate</Button>
              </div>
            </TitledGreyBox>
          </div>
        ) : (
          <div css={tw`px-1 py-2`}>
            <TitledGreyBox title={'LOS SANTOS TUNERS'}>
            <div css={tw`px-1 py-2`}>Press &quot;activate&quot; to activate the DLC Los Santos TUNERS.</div>
              <div css={tw`flex justify-end`}>
              <Button onClick={lst}>Activate</Button>
              </div>
            </TitledGreyBox>
          </div>
        )}

        {gamebuild === '+set sv_enforceGameBuild 2189' ? (
          <div css={tw`px-1 py-2`}>
            <TitledGreyBox title={'Cayo Perico'}>
            <div css={tw`px-1 py-2`}>
                Press &quot;deactivate&quot; to deactivate the Los Santos le DLC Cayo Perico.
              </div>
            <div css={tw`flex justify-end`}>
                <Button onClick={disable}>Desactivate</Button>
              </div>
            </TitledGreyBox>
          </div>
        ) : (
          <div css={tw`px-1 py-2`}>
            <TitledGreyBox title={'Cayo Perico'}>
            <div css={tw`px-1 py-2`}>Press &quot;activate&quot; to activate the DLC Cayo Perico.</div>
              <div css={tw`flex justify-end`}>
              <Button onClick={cayo}>Activate</Button>
              </div>
            </TitledGreyBox>
          </div>
        )}
        {gamebuild === '+set sv_enforceGameBuild 2060' ? (
          <div css={tw`px-1 py-2`}>
            <TitledGreyBox title={'Casino + Dernier DLC'}>
            <div css={tw`px-1 py-2`}>Press &quot;deactivate&quot; to deactivate the DLC Casino + Last DLC.</div>
              <div css={tw`flex justify-end`}>
                <Button onClick={disable}>Desactivate</Button>
              </div>
            </TitledGreyBox>
          </div>
        ) : (
          <div css={tw`px-1 py-2`}>
            <TitledGreyBox title={'Casino + Dernier DLC'}>
            <div css={tw`px-1 py-2`}>Press &quot;activate&quot; to activate the DLC Casino + Last DLC.</div>
              <div css={tw`flex justify-end`}>
                <Button onClick={casino}>Activate</Button>
              </div>
            </TitledGreyBox>
          </div>
        )}

        {gamebuild === '+set sv_enforceGameBuild 2545' ? (
          <div css={tw`px-1 py-2`}>
            <TitledGreyBox title={'Contract DLC'}>
              <div css={tw`px-1 py-2`}>Press &quot;deactivate&quot; to deactivate the Contract.</div>
              <div css={tw`flex justify-end`}>
                <Button onClick={disable}>Desactivate</Button>
              </div>
            </TitledGreyBox>
          </div>
        ) : (
          <div css={tw`px-1 py-2`}>
            <TitledGreyBox title={'Contract DLC'}>
              <div css={tw`px-1 py-2`}>Press &quot;activate&quot; to activate the Contract.</div>
              <div css={tw`flex justify-end`}>
                <Button onClick={contract}>Activate</Button>
              </div>
            </TitledGreyBox>
          </div>
        )}

        {gamebuild === '+set sv_enforceGameBuild 2699' ? (
          <div css={tw`px-1 py-2`}>
            <TitledGreyBox title={'Criminal Enterprises  DLC'}>
              <div css={tw`px-1 py-2`}>Press &quot;deactivate&quot; to deactivate the Criminal entreprise.</div>
              <div css={tw`flex justify-end`}>
                <Button onClick={disable}>Desactivate</Button>
              </div>
            </TitledGreyBox>
          </div>
        ) : (
          <div css={tw`px-1 py-2`}>
            <TitledGreyBox title={'Criminal Enterprises  DLC'}>
              <div css={tw`px-1 py-2`}>Press &quot;activate&quot; to activate the Criminal entreprise.</div>
              <div css={tw`flex justify-end`}>
                <Button onClick={criminal}>Activate</Button>
              </div>
            </TitledGreyBox>
          </div>
        )}
      </div>
    </ServerContentBlock>
  );
};

