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


const useVideoPlayer = (videoRef) => {
    const [isPaused, setIsPaused] = useState(true);
    const [volume, setVolume] = useState(100);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const handleVideoProgress = (event) => {
        const manualChange = Number(event.target.value);
        videoRef.current.currentTime = (videoRef.current?.duration / 100) * manualChange;
    };

    useEffect(() => {
        setDuration(videoRef.current?.duration);
        if (isPaused) {
            videoRef.current?.pause();
        } else {
            videoRef.current?.play();
        }
    }, [isPaused, videoRef])

    const onTimeUpdate = () => {
        const ref = videoRef.current;
        if (ref) {
            setDuration(ref.duration);
            setCurrentTime(ref.currentTime);
        }
    }

    return {
        isPaused,
        setIsPaused,
        volume,
        currentTime,
        duration,
        handleVideoProgress,
        onTimeUpdate
    };
}

const Video = ({src, hasCloseButton, closeButtonFn}) => {
    const containerRef = useRef(null);
    const videoRef = useRef(null);
    const [fullscreened, setFullscreened] = useState(false);
    const {
        isPaused,
        setIsPaused,
        volume,
        currentTime,
        duration,
        handleVideoProgress,
        onTimeUpdate
      } = useVideoPlayer(videoRef);

    const url = URL.createObjectURL(src);
    
    const conversionFn = (e) => convertSeconds(e, videoRef.current?.duration > 3600);

    // Functions needed to deal with fullscreening and exiting fullscreen
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            if (containerRef.current?.requestFullscreen) {
              containerRef.current?.requestFullscreen();
            } else if (containerRef.current?.msRequestFullscreen) {
              containerRef.current?.msRequestFullscreen();
            } else if (containerRef.current?.mozRequestFullScreen) {
              containerRef.current?.mozRequestFullScreen();
            } else if (containerRef.current?.webkitRequestFullscreen) {
              containerRef.current?.webkitRequestFullscreen();
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

    useEffect(() => {
        document.addEventListener('fullscreenchange', exitHandler);
        document.addEventListener('webkitfullscreenchange', exitHandler);
        document.addEventListener('mozfullscreenchange', exitHandler);
        document.addEventListener('MSFullscreenChange', exitHandler);
        return () => {
            document.removeEventListener('fullscreenchange', exitHandler);
            document.removeEventListener('webkitfullscreenchange', exitHandler);
            document.removeEventListener('mozfullscreenchange', exitHandler);
            document.removeEventListener('MSFullscreenChange', exitHandler);
        }
    })

    return (
        <Container ref={containerRef}>
            <VideoContainer fullscreened={fullscreened}>
                <VideoPlayer ref={videoRef} key={url} onTimeUpdate={onTimeUpdate}>
                    <source src={url}/>
                </VideoPlayer>
                {hasCloseButton && !fullscreened && <CloseButton onClick={closeButtonFn}><X/></CloseButton>}
            </VideoContainer>
            <ControlsContainer>
                <Controls>
                    <Icon onClick={() => setIsPaused(!isPaused)}>
                        {isPaused ? <Play/> : <Pause/>}
                    </Icon>
                    <TimeControls>
                        <TimeText>{conversionFn(currentTime)} / {conversionFn(duration)}</TimeText>
                        <TimeProgressBarContainer>
                            <TimeProgressBar />
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={(currentTime / duration) ?? 0}
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