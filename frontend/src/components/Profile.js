import { useState } from 'react'
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
  const [streamId, setStreamId] = useState("")
  const [streamKey, setStreamKey] = useState("")
  const [playbackId, setPlaybackId] = useState("")

  const goLiveStream = async () => {
    console.log(wallet.address)
    const response = await fetch("http://localhost:3001/new-stream",
      {
        method: "POST",
        'headers': {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ wallet: wallet.address, handle: profile.handle }), mode: "cors"
      });
    const data = await response.json();

    console.log(data)


    setStreamId(data["id"])

    setStreamKey(data["streamKey"])
    setPlaybackId(data["playbackId"])


    setLiveStreamModal(true)
  }
  if (!profile.id) return (
    <>{children}</>
  )

  return (
    <Card>
      {liveStreamModal && <Modal onExit={() => setLiveStreamModal(false)}>

        <Header>Live Stream 🎥</Header>

        <b>Stream ID </b>{streamId}
        <br />
        <br />
        <b>Stream key </b>{streamKey}
        <br />
        <br />
        <b>RTMP ingest URL </b> rtmp://rtmp.livepeer.com/live
        <br />
        <br />
        <b>SRT ingest URL </b> srt://rtmp.livepeer.com:2935?streamid={streamKey}
        <br />
        <br />
        <b>Playback URL </b> https://cdn.livepeer.com/hls/{playbackId}/index.m3u8
        <br />
        <br />
        <b>Stream From Browser</b> https://justcast.it/to/{streamKey}
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
      <Button onClick={goLiveStream}>
        Go Live
      </Button>
      </Centered>
    </Card>
  );
}

export default Profile