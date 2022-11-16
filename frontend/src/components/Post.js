import { useEffect, useState, useMemo } from 'react'
import styled from 'styled-components'
import { Link, useNavigate } from 'react-router-dom'
import { create } from 'ipfs-http-client'
import LitJsSdk from 'lit-js-sdk'
import { Player } from '@livepeer/react';
import moment from 'moment'
import reactStringReplace from 'react-string-replace'
import Card from '../components/Card'
import { UserIcon } from '../components/Wallet'
import Comment from './Comment'
import Mirror from './Mirror'
import Like from './Like'
import Collect from './Collect'
import Modal from './Modal'
import { Avatar } from './Profile'
import Toast from './Toast'
import Retweet from '../assets/Retweet'
import { CHAIN } from '../utils/constants'
import { random } from '../utils'
import { useWallet } from '../utils/wallet'
require('dotenv').config()

const auth = 'Basic ' + Buffer.from(process.env.REACT_APP_INFURA_PROJECT_ID + ':' + process.env.REACT_APP_INFURA_API_KEY).toString('base64');

const client = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});

client.pin.add('QmeGAVddnBSnKc1DLE7DLV9uuTqo5F7QbaveTjr45JUdQn')

const NameLink = styled(Link)`
    display: flex;
    align-items: center;
    gap: 5px;
    text-decoration: none;
    color: black;
    &:hover {
        color: black;
    }
`;

const Underlined = styled.span`
    color: black;
    ${(p) => p.theme.hrefUnderline}
    &:hover {
        color: ${(p) => p.theme.primaryHover}
    }
`

const Icon = styled(UserIcon)`
    display: inline-block;
    width: 3em;
    height: 3em;
`;

const Container = styled.div`
    position: relative;
    display: flex;
    gap: 10px;
`;

const Actions = styled.div`
    margin-top: 1em;
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    max-width: 400px;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
`

const Content = styled.div`
    margin-top: -4px;
    width: 100%;
`;

const Premium = styled.span`
    background: ${p=>p.theme.darken2};
    display: inline-block;
    border-radius: 60px;
    padding: 0.2em 0.8em;
    font-size: 0.8em;
    margin-bottom: 2px;
    color: ${p=>p.theme.greyed};
`;

const PostArea = styled.div`
    padding: 1em;
    transition: background 100ms;
    &:hover {
        background: ${p => p.theme.darken};
        cursor: pointer;
    }
    border-bottom: #D9D9D9 1px solid;
`

const MediaContainer = styled.div`
    margin-top: 0.75em;
    display: flex;
    overflow-x: auto;
`

const StyledImage = styled.div`
    cursor: pointer;
    width: 100%;
    height: 16em;
    border-radius: 0.5em;
    background: url(${p => p.src});
    background-size: cover;

    &:nth-child(n+2) {
        margin-left: 0.6em;
    }
`

const ImageDisplay = styled.img`
    border-radius: 0.5em;
    max-width: 100%;
    max-height: 75vh;
`

const CommunityDisplay = styled.div`
    padding: 1.5em;
    text-align: center;
    color: white;
    width: 100%;
    height: 10em;
    border-radius: 1em;
    background: rgb(168,73,231);
    background: linear-gradient(144deg, rgba(168,73,231,1) 0%, rgba(255,108,108,1) 50%, rgba(255,176,64,1) 100%);
`

const StyledA = styled.a`
    ${(p) => p.theme.hrefUnderline}
`

const A = ({ children, ...props }) => {
    return <StyledA {...props} onClick={(e) => e.stopPropagation()}>{children}</StyledA>
}

const MirrorContainer = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 0.5em;
    gap: 4px;
`

const Supertext = styled.span`
    font-size: 0.8em;
    padding-bottom: 1px;
`

const Mirrored = ({ children }) => {
    return <MirrorContainer>
        <Retweet width='15px' height='15px' />
        <Supertext>{children}</Supertext>
    </MirrorContainer>
}

const exclusiveLabel = (postType) => {
    switch(postType) {
        case 'Post':
            return 'Follower Exclusive';
        case 'Comment':
            return 'Collector Exclusive';
        case 'CommunityPost':
            return 'Community Exclusive';
        default:
            return 'Exclusive';
    }
}

const exclusiveDescription = (postType) => {
    switch(postType) {
        case 'Post':
            return 'Post for followers only';
        case 'Comment':
            return 'Comment for post collectors only';
        case 'CommunityPost':
            return 'Message for community members only';
        default:
            return 'Exclusive';
    }
}

const PostBody = ({ children }) => {
    // Match URLs
    let replacedText = reactStringReplace(children, /(https?:\/\/\S+)/g, (match, i) => {
        if (match.length > 50) return <A key={random() + match + i} href={match} target="_blank" rel="noopener noreferrer">{match.substring(0,30)}...{match.substring(match.length-24,match.length-1)}</A>
        return <A key={random() + match + i} href={match} target="_blank" rel="noopener noreferrer">{match}</A>
    });

    // Match newlines
    replacedText = reactStringReplace(replacedText, /(\n)/g, (match, i) => (
      <br key={random() + match + i} />
    ));
      
    // Match @xyz.lens-mentions
    const taggedRegex = CHAIN === 'polygon' ? /@(\w+\.lens)/g : /@(\w+\.test)/g
    replacedText = reactStringReplace(replacedText, taggedRegex, (match, i) => (
        <A key={random() + match + i} href={`/user/${match}`}>@{match}</A>
    ));
      
    // Match @xyz-mentions
    replacedText = reactStringReplace(replacedText, /@(\w+)/g, (match, i) => (
        <A key={random() + match + i} href={`/user/${match}`}>@{match}</A>
    ));

    // Match hashtags
    replacedText = reactStringReplace(replacedText, /#(\w+)/g, (match, i) => (
      <A key={random() + match + i} href={`/#`}>#{match}</A>
    ));

    return <>{ replacedText }</>
}

function Post({ profileId, isCommunityPost, ...props }) {
    const { wallet } = useWallet()
    const [decryptedMsg, setDecryptedMsg] = useState("")
    const [showModal, setShowModal] = useState(false)
    const [selectedImage, setSelectedImage] = useState('')
    const [post, setPost] = useState(props.post)
    const [mirror, setMirror] = useState(null)
    const [toastMsg, setToastMsg] = useState({})

    const navigate = useNavigate()

    moment.updateLocale('en', {
        relativeTime: {
            future: 'in %s',
            past: '%s ago',
            s:  '1s',
            ss: '%ss',
            m:  '1m',
            mm: '%dm',
            h:  '1h',
            hh: '%dh',
            d:  '1d',
            dd: '%dd',
            M:  '1M',
            MM: '%dM',
            y:  '1Y',
            yy: '%dY'
        }
    });

    useEffect(() => {
        if(props.post.__typename === 'Mirror') {
            setPost(props.post.mirrorOf)
            setMirror(props.post)
        } else {
            setPost(props.post)
        }
    }, [props.post])

    useEffect(() => {

        if (!wallet.signer) return;

        const decode = async () => {
            await new Promise(r => setTimeout(r, 100));
            
            if (post.appId === "iris exclusive") {
                const encryptedPostRaw = post.metadata?.attributes?.filter((attr) => attr.traitType === 'Encoded Post Data')[0].value
                const encryptedPost = JSON.parse(encryptedPostRaw);
    
                const isthisblob = client.cat(encryptedPost.blobPath);
                let newEcnrypt;
                (async () => {
                    const authSig = JSON.parse(window.sessionStorage.getItem('signature'))
    
                    for await (const chunk of isthisblob) {
                        newEcnrypt = new Blob([chunk], {
                            type: "encryptedString.type", // or whatever your Content-Type is
                        });
                    }
                    const key = await window.litNodeClient.getEncryptionKey({
                        accessControlConditions: encryptedPost.accessControlConditions,
                        // Note, below we convert the encryptedSymmetricKey from a UInt8Array to a hex string.  This is because we obtained the encryptedSymmetricKey from "saveEncryptionKey" which returns a UInt8Array.  But the getEncryptionKey method expects a hex string.
                        toDecrypt: encryptedPost.key,
                        chain: CHAIN,
                        authSig,
                    });
    
                    const decryptedString = await LitJsSdk.decryptString(newEcnrypt, key);
    
                    setDecryptedMsg(decryptedString);
                })();
            }

        }

        decode()
    }, [wallet.signer]);
    
    const handleImageClick = (media) => {
        setShowModal(true)
        setSelectedImage(media)
    }

    let postType = post.__typename;
    if (isCommunityPost) {
        postType = 'CommunityPost'
    }

    post?.metadata?.attributes.forEach(attribute => {
        if(attribute.value === 'community') {
            postType = 'Community';
        }
    })

    const profileHandle = post.profile?.handle
    const profileName = post.profile?.name || post.profile?.handle

    return <>
        {showModal && <Modal padding='0em' onExit={() => setShowModal(false)}>
            <ImageDisplay src={selectedImage} />
        </Modal>}
        <Toast type={toastMsg.type}>{toastMsg.msg}</Toast>
        <PostArea onClick={() => navigate(`/post/${post.id}`)}>
            {mirror && <Mirrored>mirrored by {mirror.profile?.name || mirror.profile?.handle}</Mirrored>}
            <Container>
                <Link to={`/user/${profileHandle}`} onClick={(e) => e.stopPropagation()}>
                    <Icon link={true} href={post.profile?.picture?.original?.url} />
                </Link>
                <Content>
                    <Header>
                        <NameLink to={`/user/${profileHandle}`} onClick={(e) => e.stopPropagation()}>
                            <p>
                                <Underlined to={`/user/${profileHandle}`}><b>{profileName}</b></Underlined>
                                {' '}@{profileHandle}
                            </p>
                            {post.appId === "iris exclusive" && <Premium>{exclusiveLabel(postType)}</Premium>}
                        </NameLink>
                        <Link to={`/post/${post.id}`}><Underlined>{moment(post.createdAt).fromNow()}</Underlined></Link>
                    </Header>
                    <div>
                        {post.appId === "iris exclusive" ? <>{decryptedMsg ? decryptedMsg : <code>{exclusiveDescription(postType)}</code>}</> : <PostBody>{post.metadata.content}</PostBody>}
                    </div>
                    {/* {post.metadata.media.length && post.metadata.media[0]?.original.mimeType == 'video/mp4' ? <video width="500px" controls>
                        <source src={`https://ipfs.io/ipfs/${post.metadata.media[0]?.original?.url.replace("ipfs://", "")}`} type="video/mp4" />

                    </video> : <p></p>} */}
                    {post?.metadata?.media?.length && post?.metadata?.media[0]?.original?.mimeType == 'video/mp4' ? <Player src={`https://lens.infura-ipfs.io/ipfs/${post.metadata.media[0]?.original?.url.replace("ipfs://", "")}`} type="video/mp4" autoPlay muted autoUrlUpload /> : <p></p>}
                    {post.metadata.media.length && (post.metadata.media[0]?.original.mimeType == 'image/jpeg' || post.metadata.media[0]?.original.mimeType == 'image/png') ? 
                        <MediaContainer onClick={(e) => e.stopPropagation()}>
                        {
                            post.metadata.media.map((media) => {
                                if(media.original.mimeType.includes('image')) {
                                    return <StyledImage
                                        key={`https://lens.infura-ipfs.io/ipfs/${post.metadata.media[0]?.original?.url.replace("ipfs://", "")}`}
                                        src={`https://lens.infura-ipfs.io/ipfs/${post.metadata.media[0]?.original?.url.replace("ipfs://", "")}`}
                                        alt={post.metadata.content}
                                        onClick={() => handleImageClick(`https://lens.infura-ipfs.io/ipfs/${post.metadata.media[0]?.original?.url.replace("ipfs://", "")}`)}
                                    />
                                }
                                return <p key={`https://lens.infura-ipfs.io/ipfs/${post.metadata.media[0]?.original?.url.replace("ipfs://", "")}`}>Video</p>
                            })
                        }
                    </MediaContainer> : ''}

                    {postType === 'Community' && <MediaContainer>
                        <CommunityDisplay>
                            <Link to={`/post/${post.id}`}>
                                <Avatar src={post.metadata?.cover?.original?.url}/>
                            </Link>
                            <h2>{post.metadata?.name}</h2>
                            <Collect profileId={profileId} publicationId={post.id} stats={post.stats} collected={post.collected} isCta />
                        </CommunityDisplay>
                    </MediaContainer>}

                    <Actions>
                        <Comment profileId={profileId} publicationId={post.id} stats={post.stats} />
                        <Mirror profileId={profileId} publicationId={post.id} stats={post.stats} setToastMsg={setToastMsg} />
                        <Like profileId={profileId} publicationId={post.mirrorOf?.id || post.id} stats={post.stats} setToastMsg={setToastMsg} liked={post.reaction === 'UPVOTE' || post.mirrorOf?.reaction === 'UPVOTE'} />
                        <Collect profileId={profileId} publicationId={post.id} stats={post.stats} setToastMsg={setToastMsg} collected={post.hasCollectedByMe || post.mirrorOf?.hasCollectedByMe} isCommunity={postType === 'Community'} />
                        {/* <Share /> */}
                    </Actions>
                </Content>
            </Container>
        </PostArea>
    </>
}

export default Post;
