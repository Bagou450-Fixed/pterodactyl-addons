import React, { useState } from 'react';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import ServerIconMcModal from './ServerIconMCModal';

export default () => {
    const [ modalVisible, setModalVisible ] = useState(false);

    return (
        <TitledGreyBox title={'Server Icon'} css={tw`relative`}>
            <ServerIconMcModal
                visible={modalVisible}
                onDismissed={() => setModalVisible(false)}
            />
            <p css={tw`text-sm`}>
                Change the server icon&nbsp;
            </p>
            <div css={tw`mt-6 text-right`}>
                <Button
                    type={'button'}
                    color={'red'}
                    isSecondary
                    onClick={() => setModalVisible(true)}
                >
                    Change icon
                </Button>
            </div>
        </TitledGreyBox>
    );
};
