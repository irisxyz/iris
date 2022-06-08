import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { create } from 'ipfs-http-client'
import LitJsSdk from 'lit-js-sdk'
import moment from 'moment'
import reactStringReplace from 'react-string-replace';
import Card from '../components/Card'
import { UserIcon } from '../components/Wallet'
import Share from '../assets/Share'
import Comment from './Comment'
import Mirror from './Mirror'
import Collect from './Collect'
import Modal from './Modal'

const client = create("https://ipfs.infura.io:5001/api/v0");

export const StyledLink = styled(Link)`
    text-decoration: none;
    font-weight: 600;
    color: black;
    transition: all 50ms ease-in-out;
    &:hover {
        color: ${(p) => p.theme.primary};
    }
`;

const StyledTime = styled(StyledLink)`
    font-weight: normal;
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
    padding-top: 4px;
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
`;

const MediaContainer = styled.div`
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

const chain = "mumbai";

const PostBody = ({ children }) => {
    // Match URLs
    let replacedText = reactStringReplace(children, /(https?:\/\/\S+)/g, (match, i) => {
        if (match.length > 50) return <a key={match + i} href={match} target="_blank" rel="noopener noreferrer">{match.substring(0,30)}...{match.substring(match.length-24,match.length-1)}</a>
        return <a key={match + i} href={match} target="_blank" rel="noopener noreferrer">{match}</a>
    });
      
    // Match @xyz.lens-mentions
    replacedText = reactStringReplace(replacedText, /@(\w+\.lens)/g, (match, i) => (
        <a key={match + i} href={`/user/${match}`}>@{match}</a>
    ));
      
    // Match @xyz-mentions
    replacedText = reactStringReplace(replacedText, /@(\w+)/g, (match, i) => (
        <a key={match + i} href={`/user/${match}`}>@{match}</a>
    ));

    // Match hashtags
    replacedText = reactStringReplace(replacedText, /#(\w+)/g, (match, i) => (
      <a key={match + i} href={`/hashtag/${match}`}>#{match}</a>
    ));

    return <>{ replacedText }</>
}

function Post({ post, wallet, lensHub, profileId }) {
    const [decryptedMsg, setDecryptedMsg] = useState("")
    const [showModal, setShowModal] = useState(false)
    const [selectedImage, setSelectedImage] = useState('')

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

        const decode = async () => {
            await new Promise(r => setTimeout(r, 500));
            
            // TODO: fix lit protocol code
            if (post.metadata.description === "litcode}") {
                const encryptedPost = JSON.parse(post.metadata.content.replace("litcoded: ", ""));
    
                const accessControlConditions = [
                    {
                        contractAddress: encryptedPost.contract,
                        standardContractType: "ERC721",
                        chain,
                        method: "balanceOf",
                        parameters: [":userAddress"],
                        returnValueTest: {
                            comparator: ">",
                            value: "0",
                        },
                    },
                ];
    
                const isthisblob = client.cat(encryptedPost.blobPath);
                let newEcnrypt;
                (async () => {
                    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });
    
                    for await (const chunk of isthisblob) {
                        newEcnrypt = new Blob([chunk], {
                            type: "encryptedString.type", // or whatever your Content-Type is
                        });
                    }
                    const key = await window.litNodeClient.getEncryptionKey({
                        accessControlConditions,
                        // Note, below we convert the encryptedSymmetricKey from a UInt8Array to a hex string.  This is because we obtained the encryptedSymmetricKey from "saveEncryptionKey" which returns a UInt8Array.  But the getEncryptionKey method expects a hex string.
                        toDecrypt: encryptedPost.key,
                        chain,
                        authSig,
                    });
    
                    const decryptedString = await LitJsSdk.decryptString(newEcnrypt, key);
    
                    setDecryptedMsg(decryptedString);
                })();
            }

        }

        decode()
    }, []);
    
    const handleImageClick = (media) => {
        setShowModal(true)
        setSelectedImage(media)
    }

    return <>
        {showModal && <Modal padding='0em' onExit={() => setShowModal(false)}>
            <ImageDisplay src={selectedImage} />
        </Modal>}
        <StyledCard>
            <Container>
                <Link to={`/user/${post.profile?.handle}`}>
                    <Icon link={true} href={post.profile?.picture?.original?.url} />
                </Link>
                <Content className="hrefUnderline">
                    {post.metadata.description === "litcoded}" && <Premium>Followers Only</Premium>}
                    <Header>
                        <StyledLink to={`/user/${post.profile?.handle}`}>
                            <b>@{post.profile?.handle}</b>
                        </StyledLink>
                        <StyledTime to={`/post/${post.id}`}>{moment(post.createdAt).fromNow()}</StyledTime>
                    </Header>
                    {/* {post.metadata.media} */}
                    {post.metadata.description === "litcoded}" ? <p>{decryptedMsg ? decryptedMsg : <code>Message for followers only</code>}</p> : <PostBody>{post.metadata.content}</PostBody>}
                    {/* {post.metadata.media.length ? <video width="500px" controls>
                        <source src={`https://ipfs.io/ipfs/${post.metadata.media[0]?.original?.url.replace("ipfs://", "")}`} type="video/mp4" />

                    </video> : <p></p>} */}
                    {post.metadata.media.length ? <MediaContainer>
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

                    <Actions>
                        <Comment wallet={wallet} lensHub={lensHub} profileId={profileId} publicationId={post.id} stats={post.stats} />
                        <Mirror wallet={wallet} lensHub={lensHub} profileId={profileId} publicationId={post.id} stats={post.stats} />
                        <Collect wallet={wallet} lensHub={lensHub} profileId={profileId} publicationId={post.id} stats={post.stats} collected={post.collected} />
                        {/* <Share /> */}
                    </Actions>
                </Content>
            </Container>
        </StyledCard>
    </>
}

export default Post;
