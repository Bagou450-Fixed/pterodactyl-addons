import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import tw from 'twin.macro';
import useFlash from '@/plugins/useFlash';
import GreyRowBox from '@/components/elements/GreyRowBox';
import Modal from '@/components/elements/Modal';
import McModsVersionsRow from './McModsVersionsRow';
import Button from '@/components/elements/Button';
import FlashMessageRender from '@/components/FlashMessageRender';
import Parser from 'html-react-parser';
import getMinecraftMcModsDescription from '@/api/server/mcmods/getMinecraftMcModsDescription';
import { ServerContext } from '@/state/server';

interface Props {
  minecraftMcMods: any;
  className?: string;
  type: string;
}

export default ({ minecraftMcMods, className, type }: Props) => {
  const { clearAndAddHttpError } = useFlash();
  const [visible, setVisible] = useState('');
  const [infoload, setInfoLoad] = useState(false);
  const [description, setDescription] = useState('');
  const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
  if (type === 'modrinth') {
    minecraftMcMods.id = minecraftMcMods.project_id;
    minecraftMcMods.name = minecraftMcMods.title;
    minecraftMcMods.logo = { thumbnailUrl: minecraftMcMods.icon_url };
    minecraftMcMods.links = { websiteUrl: `https://modrinth.com/mod/${minecraftMcMods.slug}` };
    minecraftMcMods.summary = minecraftMcMods.description;
  }
  const getDescription = () => {
    setInfoLoad(true);
    getMinecraftMcModsDescription(uuid, minecraftMcMods.id, type)
      .then((data) => {
        setDescription(data);
        setInfoLoad(false);
        setVisible('informations');
      })
      .catch((e) => clearAndAddHttpError({ key: minecraftMcMods.id, error: e }));
  };
  return (
    <GreyRowBox css={tw`flex-wrap md:flex-nowrap items-center mb-2`} className={className}>
      <Modal
        visible={visible === 'informations'}
        onDismissed={() => {
          setVisible('');
        }}
      >
        <FlashMessageRender byKey={minecraftMcMods.id} css={tw`mb-4`} />
        {Parser(description)}
      </Modal>
      <Modal
        visible={visible === 'versions'}
        onDismissed={() => {
          setVisible('');
        }}
      >
        <FlashMessageRender byKey={minecraftMcMods.id} css={tw`mb-4`} />
        <McModsVersionsRow minecraftMcMods={minecraftMcMods} type={type} />
      </Modal>
      <div css={tw`flex items-center truncate w-full md:flex-1`}>
        <div css={tw`flex flex-col truncate`}>
          <div css={tw`flex items-center text-sm mb-1`}>
            <div
              css={tw`w-10 h-10 rounded-lg bg-white border-2 border-neutral-800 overflow-hidden hidden md:block`}
              title={minecraftMcMods.name}
            >
              <img css={tw`w-64 h-64`} alt={minecraftMcMods.name} src={minecraftMcMods.logo.thumbnailUrl} />
            </div>
            <a
              href={minecraftMcMods.links.websiteUrl}
              css={tw`ml-4 break-words truncate`}
              title={minecraftMcMods.summary}
            >
              {minecraftMcMods.name}
              <br />
              <div css={tw`text-2xs text-neutral-400`}>Description (Hover me)</div>
            </a>
            <br />
          </div>
          <p css={tw`mt-1 md:mt-0 text-xs truncate`}>
            {type === 'modrinth' ? (
              <p>{minecraftMcMods.display_categories.join(', ')} </p>
            ) : (
              minecraftMcMods.categories.map((category: any, index: any) => (
                <img
                  css={index > 0 ? tw`ml-1 w-8 h-8 inline` : tw`w-8 h-8 inline`}
                  key={category.name}
                  src={category.iconUrl}
                  alt={category.name}
                  title={category.name}
                />
              ))
            )}
          </p>
        </div>
      </div>

      <div css={tw`mt-4 md:mt-0 ml-6 grid grid-rows-2 gap-y-2`} style={{ marginRight: '-0.5rem' }}>
        <Button
          type={'button'}
          aria-label={'More Informations'}
          onClick={() => getDescription()}
          title='More Informations'
          isLoading={infoload}
          isSecondary
        >
          <FontAwesomeIcon icon={faPaperclip} /> Informations
        </Button>

        <Button
          type={'button'}
          aria-label={'Install'}
          onClick={() => setVisible('versions')}
          title='Download and Install'
        >
          <FontAwesomeIcon icon={faDownload} /> Install
        </Button>
      </div>
    </GreyRowBox>
  );
};

