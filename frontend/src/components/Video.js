import { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import Play from '../assets/Play'
import Pause from '../assets/Pause'
import VolumeSpeaker from '../assets/VolumeSpeaker'
import FullScreen from '../assets/FullScreen'
import X from '../assets/X';

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
    flex-direction: column;
    width: 100%;
`;

const VideoContainer = styled.div`
    background-color: black;
    display: flex;
    ${p => p.fullscreened ? 'height: 100%' : 'height: 18em'};
    aspect-ratio: 16 / 9;
    position: relative;
    border-radius: 12px;
`;

const ControlsContainer = styled.div`
    position: relative;
`;

const VideoPlayer = styled.video`
    border-radius: 6px;
    filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
    width: 100%;
`;

const Controls = styled.div`
    position: absolute;
    top: -35px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    background-color: rgba(0, 0, 0, 0.2);
`;

const TimeControls = styled.div`
    display: flex;
`

const TimeText = styled.p`
    color: white;
`;

const TimeProgressBarContainer = styled.div``

const TimeProgressBar = styled.div`
    width: 40%;
    color: white;
    background-color: red;
`

const VolumeControls = styled.div``;

const Icon = styled.button`
    :hover {
        cursor: pointer;
    }
`;


// https://blog.avneesh.tech/create-a-custom-video-player-in-react
// https://dev.to/franciscomendes10866/how-to-create-a-video-player-in-react-40jj

const convertSeconds = (e, includeHours) => {
        const h = Math.floor(e / 3600).toString().padStart(2,'0'),
              m = Math.floor(e % 3600 / 60).toString().padStart(2,'0'),
              s = Math.floor(e % 60).toString().padStart(2,'0');
        
        return includeHours ? h + ':' + m + ':' + s : m + ':' + s;
        //return `${h}:${m}:${s}`;
    }

const Video = ({src, hasCloseButton, closeButtonFn}) => {
    const videoRef = useRef(null);
    const [isPaused, setIsPaused] = useState(true);
    const [volume, setVolume] = useState(100);
    const [time, setTime] = useState(0);
    const [progress, setProgress] = useState(0);
    const [fullscreened, setFullscreened] = useState(false);

    const url = URL.createObjectURL(src);
    console.log(videoRef);

    const handleOnTimeUpdate = () => {
        const progress = (videoRef.current?.currentTime / videoRef.current?.duration) * 100;
        setProgress(progress);
        // setTime(videoRef.current.currentTime);
      };
    
    const handleVideoProgress = (event) => {
        const manualChange = Number(event.target.value);
        videoRef.current.currentTime = (videoRef.current?.duration / 100) * manualChange;
        setProgress(manualChange);
        setTime(videoRef.current?.currentTime);
    };

    const conversionFn = (e) => convertSeconds(e, videoRef.current?.duration > 3600);

    const togglePause = () => {
        if (isPaused) {
            videoRef.current?.play();
            setIsPaused(false);
        } else {
            videoRef.current?.pause();
            setIsPaused(true);
        }
    }

    // Functions needed to deal with fullscreening and exiting fullscreen
    const toggleFullScreen = () => {
        const el = document.getElementById("full-screenVideo");
        if (!document.fullscreenElement) {
            if (el.requestFullscreen) {
              el.requestFullscreen();
            } else if (el.msRequestFullscreen) {
              el.msRequestFullscreen();
            } else if (el.mozRequestFullScreen) {
              el.mozRequestFullScreen();
            } else if (el.webkitRequestFullscreen) {
              el.webkitRequestFullscreen();
            }
            setFullscreened(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            setFullscreened(false);
        }
      };

    const exitHandler = () => {
          if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
              setFullscreened(false);
          }
    }  

    document.addEventListener('fullscreenchange', exitHandler);
    document.addEventListener('webkitfullscreenchange', exitHandler);
    document.addEventListener('mozfullscreenchange', exitHandler);
    document.addEventListener('MSFullscreenChange', exitHandler);

    return (
        <Container id="full-screenVideo">
            <VideoContainer fullscreened={fullscreened}>
                <VideoPlayer ref={videoRef} key={url} onTimeUpdate={() => handleOnTimeUpdate()}>
                    <source src={url}/>
                </VideoPlayer>
                {hasCloseButton && !fullscreened && <CloseButton onClick={closeButtonFn}><X/></CloseButton>}
            </VideoContainer>
            <ControlsContainer>
                <Controls>
                    <Icon onClick={() => togglePause()}>
                        {isPaused ? <Play/> : <Pause/>}
                    </Icon>
                    <TimeControls>
                        <TimeText>{conversionFn(time)} / {conversionFn(videoRef.current?.duration)}</TimeText>
                        <TimeProgressBarContainer>
                            <TimeProgressBar />
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={progress}
                                onChange={(e) => handleVideoProgress(e)}
                            />
                        </TimeProgressBarContainer>
                    </TimeControls>
                    <VolumeControls>
                        <Icon>
                            <VolumeSpeaker />
                        </Icon>
                    </VolumeControls>
                    <Icon onClick={toggleFullScreen}>
                        <FullScreen/>
                    </Icon>
                </Controls>
            </ControlsContainer>
        </Container>
    );
    
}

export default Video;