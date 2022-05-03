import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import Card from './Card'
import avatar from '../assets/avatar.png'
import Button from './Button'
import Modal from './Modal'

const Icon = styled.div`
  height: 75px;
  width: 75px;
  border: #E2E4E8 1px solid;
  border-radius: 100px;
  &:hover {
    cursor: pointer;
  }
  display: flex;
  justify-content: center;
  align-items: center;
  background: url(${avatar});
  background-size: cover;
  margin: auto;
`

const Handle = styled.h2`
  text-align: center;
`

const Stats = styled.div`
  display: flex;
  justify-content: space-evenly;
`

const Header = styled.h2`
    margin: 0;
    color: ${p => p.theme.primary};
`

const Centered = styled.div`
  text-align: center;
`

function Profile({ profile = {}, wallet, children }) {

  // Streaming
  const [liveStreamModal, setLiveStreamModal] = useState(false)
  const [streamInfo, setStreamInfo] = useState({});


  const goLiveStream = async () => {
    console.log(wallet.address)
    const response = await fetch("https://irisxyz.herokuapp.com/new-stream",
      {
        method: "POST",
        'headers': {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ wallet: wallet.address, handle: profile.handle }), mode: "cors"
      });
    const data = await response.json();

    console.log("goLive was pressed")
    setStreamInfo(data)

    setLiveStreamModal(true)
  }
  useEffect(() => {

    const isUserLivestreaming = async () => {

      try {
        const response = await fetch("https://livepeer.com/api/stream?streamsonly=1&filters=[{id: isActive, value: true}]",
          {
            headers: {
              // TODO: Remove API KEY in the future
              "authorization": "Bearer fe3ed427-ab88-415e-b691-8fba9e7e6fb0"
            }
          },
        );
        const responseData = await response.json();
  
        responseData.map((streamInfo) => {
          if (streamInfo.isActive & streamInfo.name === `${wallet.address},${profile.handle}`) {
  
            console.log("PROFILE Woooo")
            setStreamInfo(streamInfo)
  
          }
        })

      } catch (err) {
        console.log(err)
      }



    }
    isUserLivestreaming()

  }, [profile])

  const showLiveStreamInfo = async () => {
    setLiveStreamModal(true)
  }

  if (!profile.id) return (
    <>{children}</>
  )

  return (
    <Card>
      {liveStreamModal && <Modal onExit={() => setLiveStreamModal(false)}>

        <Header>Live Stream 🎥</Header>

        <b>Stream ID </b>{streamInfo.id}
        <br />
        <br />
        <b>Stream key </b>{streamInfo.streamKey}
        <br />
        <br />
        <b>RTMP ingest URL </b> rtmp://rtmp.livepeer.com/live
        <br />
        <br />
        <b>SRT ingest URL </b> srt://rtmp.livepeer.com:2935?streamid={streamInfo.streamKey}
        <br />
        <br />
        <b>Playback URL </b> https://cdn.livepeer.com/hls/{streamInfo.playbackId}/index.m3u8
        <br />
        <br />
        <b>Stream From Browser</b> https://justcast.it/to/{streamInfo.streamKey}
        <br />

      </Modal>}
      <Link to={`user/${profile.handle}`}>
        <Icon />
      </Link>
      <Handle>@{profile.handle}</Handle>
      <Stats>
        <p>{profile.stats?.totalFollowers} followers</p>
        <p>{profile.stats?.totalFollowing} following</p>
      </Stats>
      <Centered>
        {streamInfo.playbackId ?
          <Button onClick={showLiveStreamInfo}>
            Stream Details
          </Button> :
          <Button onClick={goLiveStream}>
            Go Live
          </Button>
        }
      </Centered>
    </Card>
  );
}

export default Profile