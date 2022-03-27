import React, { useLayoutEffect, useRef } from 'react';
import Plyr from 'plyr';
import Hls from 'hls.js';
import 'plyr/dist/plyr.css';

const PlyrComponent = () => {
    const video = useRef();
    const playerInstance = useRef();

    useLayoutEffect(() => {
        const source = 'https://cdn.livepeer.com/hls/5ddc9pt3jsn2ym7y/index.m3u8';
        playerInstance.current = new Plyr(video.current);
        const hls = new Hls();
        hls.loadSource(source);
        hls.attachMedia(video.current);
        window.hls = hls;
        playerInstance.current.speed = 1
        return () => {
            playerInstance.current.destroy();
        };
    }, []);

    return <video id="player" ref={video} className="video-js" autoPlay={true} preload="auto"></video>;
};

export default PlyrComponent;