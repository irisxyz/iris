import { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import Play from '../assets/Play'
import VolumeSpeaker from '../assets/VolumeSpeaker'
import FullScreen from '../assets/FullScreen'

const CloseButton = styled.button``;

const Container = styled.div`
    background-color: black;
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const VideoContainer = styled.div`
    background-color: black;
    display: flex;
    width: 100%;
    height: 18em;
`;

const ControlsContainer = styled.div`
`;

const VideoPlayer = styled.video`
    border-radius: 6px;
    filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
    width: 100%;
`;

const Controls = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-evenly;
`;

const TimeControls = styled.div`
    display: flex;
`

const TimeText = styled.p``;

const VolumeControls = styled.div``;

// https://blog.avneesh.tech/create-a-custom-video-player-in-react
// https://dev.to/franciscomendes10866/how-to-create-a-video-player-in-react-40jj

const Video = ({src, hasCloseButton, closeButtonFn}) => {
    const videoRef = useRef(null);

    return (
        <Container>
            {hasCloseButton && <CloseButton onClick={closeButtonFn} />}
            <VideoContainer>
                <VideoPlayer ref={videoRef} key={src}>
                    <source src={src}/>
                </VideoPlayer>
            </VideoContainer>
            <ControlsContainer>
                <Controls>
                    <Play/>
                    <TimeControls>
                        <TimeText>0:05 / 0:08</TimeText>
                        <div className="time_progressbarContainer">
                        <div style={{ width: "40%" }} className="time_progressBar"></div>
                        </div>
                    </TimeControls>
                    <VolumeControls>
                        <VolumeSpeaker />
                    </VolumeControls>
                    <FullScreen />
                </Controls>
            </ControlsContainer>
        </Container>
    );
    
}

export default Video;