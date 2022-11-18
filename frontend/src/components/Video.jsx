import React from 'react';
import styled from 'styled-components'
import X from '../assets/X';
// import { Player } from '@livepeer/react'
import 'plyr-react/plyr.css'
import Plyr from 'plyr-react'

const CloseButton = styled.button`
    color: white;
    padding-top: 3px;
    background-color: rgba(0, 0, 0, 0.5);
    border: none;
    border-radius: 4px;
    position: absolute;
    top: 5px;
    right: 5px;
    :hover {
        cursor: pointer;
        background-color:rgba(100, 100, 100, 0.5);
    }
`

const Container = styled.div`
    background-color: rgba(100, 100, 100, 0);
    display: flex;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    position: relative;

    --plyr-color-main: ${p => p.theme.primary};

    .plyr {
        background-color: rgba(0, 0, 0, 0);
        border-radius: 6px;
        filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
    }
`;

const areEqual = (prevProps, nextProps) => {
    return (prevProps.name === nextProps.name && prevProps.lastModified === nextProps.lastModified && prevProps.lastModifiedDate === nextProps.lastModifiedDate && prevProps.size === nextProps.size && prevProps.type === nextProps.type && prevProps.webkitRelativePath === nextProps.webkitRelativePath)
}

// Using memo so video does not re-render after writing in text box.

const Video = React.memo(({src, hasCloseButton, closeButtonFn}) => {
    const url = URL.createObjectURL(src);

    return (
        <Container key={url}>
            <Plyr
                source={{
                    type: 'video',
                    sources: [{src: url}]
                }}
                options={{
                    controls: [
                        'play-large',
                        'play',
                        'progress',
                        'current-time',
                        'mute',
                        'volume',
                        'fullscreen'
                    ],
                    ratio: '16:9',
                    invertTime: false
                }}
            />
            {/* <Player 
                src={url} 
                type="video/mp4"  
                muted 
            /> */}

            {hasCloseButton && <CloseButton onClick={closeButtonFn}><X/></CloseButton>}
        </Container>
    );
    
}, areEqual)

export default Video;