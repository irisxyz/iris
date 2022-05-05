import { useLayoutEffect, useRef } from 'react';
import Plyr from 'plyr';
import Hls from 'hls.js';
import 'plyr/dist/plyr.css';

const PlyrComponent = ({playbackId}) => {
    const video = useRef();
    const playerInstance = useRef();

    useLayoutEffect(() => {
        const source = `https://cdn.livepeer.com/hls/${playbackId}/index.m3u8`;
        playerInstance.current = new Plyr(video.current);
        const hls = new Hls();
        hls.loadSource(source);
        hls.attachMedia(video.current);
        window.hls = hls;
        playerInstance.current.speed = 1
        video.current.addEventListener('ended',myHandler,false);
        function myHandler(e) {
            // What you want to do after the event
            console.log('done')
        }
        return () => {
            playerInstance.current.destroy();
        };
    }, []);

    return <video id="player" ref={video} className="video-js" autoPlay={true} preload="auto"></video>;
};

export default PlyrComponent;