import { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import Play from '../assets/Play'
import VolumeSpeaker from '../assets/VolumeSpeaker'
import FullScreen from '../assets/FullScreen'

const CloseButton = styled.button``;

const Container = styled.div`
    background-color: black;
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

const VolumeControls = styled.div``;

// https://blog.avneesh.tech/create-a-custom-video-player-in-react
// https://dev.to/franciscomendes10866/how-to-create-a-video-player-in-react-40jj

const Video = ({src, hasCloseButton, closeButtonFn}) => {
    const videoRef = useRef(null);

    return (
        <Container>
            {hasCloseButton && <CloseButton onClick={closeButtonFn} />}
            <VideoPlayer ref={videoRef} key={src} controls>
                <source src={src}/>
            </VideoPlayer>
            {/* <Controls>
                <Play/>
                <TimeControls>
                    <p className="controlsTime">0:05 / 0:08</p>
                    <div className="time_progressbarContainer">
                    <div style={{ width: "40%" }} className="time_progressBar"></div>
                    </div>
                </TimeControls>
                <VolumeControls>
                    <VolumeSpeaker />
                </VolumeControls>
                <FullScreen />
            </Controls> */}
        </Container>
    );
    
}

export default Video;