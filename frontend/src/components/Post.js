import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Link, useNavigate } from 'react-router-dom'
import { create } from 'ipfs-http-client'
import LitJsSdk from 'lit-js-sdk'
import moment from 'moment'
import reactStringReplace from 'react-string-replace'
import Card from '../components/Card'
import { UserIcon } from '../components/Wallet'
import Share from '../assets/Share'
import Comment from './Comment'
import Mirror from './Mirror'
import Collect from './Collect'
import Modal from './Modal'
import { Avatar } from './Profile'

const client = create("https://ipfs.infura.io:5001/api/v0")

const NameLink = styled(Link)`
    text-decoration: none;
    color: black;
    &:hover {
        color: black;
    }
`;

const Underlined = styled.p`
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
    width: 400px;
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

const Premium = styled.div`
    right: 0;
    position: absolute;
    background: #ece8ff;
    border-radius: 100px;
    padding: 0.2em 1em;
    font-weight: 500;
    color: #220d6d;
`;

const StyledCard = styled(Card)`
    margin-bottom: 1em;
    padding-right: 3em;
    transition: background 100ms;
    &:hover {
        background: ${p => p.theme.darken};
        cursor: pointer;
    }
`;

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

const chain = "mumbai";

const random = () => {
    return (Math.random() + 1).toString(36).substring(7);
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
    replacedText = reactStringReplace(replacedText, /@(\w+\.lens)/g, (match, i) => (
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

function Post({ post, wallet, lensHub, profileId }) {
    const [decryptedMsg, setDecryptedMsg] = useState("")
    const [showModal, setShowModal] = useState(false)
    const [selectedImage, setSelectedImage] = useState('')

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

    // useEffect(() => {

    //     const decode = async () => {
    //         await new Promise(r => setTimeout(r, 500));
            
    //         // TODO: fix lit protocol code
    //         if (post.metadata.description === "litcode}") {
    //             const encryptedPost = JSON.parse(post.metadata.content.replace("litcoded: ", ""));
    
    //             const accessControlConditions = [
    //                 {
    //                     contractAddress: encryptedPost.contract,
    //                     standardContractType: "ERC721",
    //                     chain,
    //                     method: "balanceOf",
    //                     parameters: [":userAddress"],
    //                     returnValueTest: {
    //                         comparator: ">",
    //                         value: "0",
    //                     },
    //                 },
    //             ];
    
    //             const isthisblob = client.cat(encryptedPost.blobPath);
    //             let newEcnrypt;
    //             (async () => {
    //                 const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });
    
    //                 for await (const chunk of isthisblob) {
    //                     newEcnrypt = new Blob([chunk], {
    //                         type: "encryptedString.type", // or whatever your Content-Type is
    //                     });
    //                 }
    //                 const key = await window.litNodeClient.getEncryptionKey({
    //                     accessControlConditions,
    //                     // Note, below we convert the encryptedSymmetricKey from a UInt8Array to a hex string.  This is because we obtained the encryptedSymmetricKey from "saveEncryptionKey" which returns a UInt8Array.  But the getEncryptionKey method expects a hex string.
    //                     toDecrypt: encryptedPost.key,
    //                     chain,
    //                     authSig,
    //                 });
    
    //                 const decryptedString = await LitJsSdk.decryptString(newEcnrypt, key);
    
    //                 setDecryptedMsg(decryptedString);
    //             })();
    //         }

    //     }

    //     decode()
    // }, []);
    
    const handleImageClick = (media) => {
        setShowModal(true)
        setSelectedImage(media)
    }

    let isCommunity = false;
    
    post?.metadata?.attributes.forEach(attribute => {
        if(attribute.value === 'community') {
            isCommunity = true;
        }
    })

    return <>
        {showModal && <Modal padding='0em' onExit={() => setShowModal(false)}>
            <ImageDisplay src={selectedImage} />
        </Modal>}
        <StyledCard onClick={() => navigate(`/post/${post.id}`)}>
            <Container>
                <Link to={`/user/${post.profile?.handle}`} onClick={(e) => e.stopPropagation()}>
                    <Icon link={true} href={post.profile?.picture?.original?.url} />
                </Link>
                <Content>
                    {post.metadata.description === "litcoded}" && <Premium>Followers Only</Premium>}
                    <Header>
                        <NameLink to={`/user/${post.profile?.handle}`} onClick={(e) => e.stopPropagation()}>
                            <Underlined to={`/user/${post.profile?.handle}`}><b>{post.profile?.name || post.profile.handle}</b></Underlined>
                            {' '}@{post.profile?.handle}
                        </NameLink>
                        <Link to={`/post/${post.id}`}><Underlined>{moment(post.createdAt).fromNow()}</Underlined></Link>
                    </Header>
                    <div>
                        {post.metadata.description === "litcoded}" ? <p>{decryptedMsg ? decryptedMsg : <code>Message for followers only</code>}</p> : <PostBody>{post.metadata.content}</PostBody>}
                    </div>
                    {/* {post.metadata.media.length ? <video width="500px" controls>
                        <source src={`https://ipfs.io/ipfs/${post.metadata.media[0]?.original?.url.replace("ipfs://", "")}`} type="video/mp4" />

                    </video> : <p></p>} */}
                    {post.metadata.media.length ? <MediaContainer onClick={(e) => e.stopPropagation()}>
                        {
                            post.metadata.media.map((media) => {
                                if(media.original.mimeType.includes('image')) {
                                    return <StyledImage
                                        key={media.original.url}
                                        src={media.original.url}
                                        alt={post.metadata.content}
                                        onClick={() => handleImageClick(media.original.url)}
                                    />
                                }
                                return <p key={media.original.url}>Video</p>
                            })
                        }
                    </MediaContainer> : ''}

                    {isCommunity && <MediaContainer>
                        <CommunityDisplay>
                            <Link to={`/post/${post.id}`}>
                                <Avatar src={post.metadata?.cover?.original?.url}/>
                            </Link>
                            <h2>{post.metadata?.name}</h2>
                            <Collect wallet={wallet} lensHub={lensHub} profileId={profileId} publicationId={post.id} stats={post.stats} collected={post.collected} isCta />
                        </CommunityDisplay>
                    </MediaContainer>}

                    <Actions>
                        <Comment wallet={wallet} lensHub={lensHub} profileId={profileId} publicationId={post.id} stats={post.stats} />
                        <Mirror wallet={wallet} lensHub={lensHub} profileId={profileId} publicationId={post.id} stats={post.stats} />
                        <Collect wallet={wallet} lensHub={lensHub} profileId={profileId} publicationId={post.id} stats={post.stats} collected={post.collected} isCommunity={isCommunity} />
                        {/* <Share /> */}
                    </Actions>
                </Content>
            </Container>
        </StyledCard>
    </>
}

export default Post;
