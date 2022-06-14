import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useMutation } from '@apollo/client'
import { utils } from 'ethers'
import omitDeep from 'omit-deep'
import { v4 as uuidv4 } from 'uuid';
import { create } from 'ipfs-http-client'
import LitJsSdk from 'lit-js-sdk'

import Button from './Button'
import Card from './Card'
import Modal from './Modal'
import { CREATE_POST_TYPED_DATA, CREATE_COMMENT_TYPED_DATA, BROADCAST } from '../utils/queries'
import pollUntilIndexed from '../utils/pollUntilIndexed'
import VisibilitySelector from './VisibilitySelector'


const client = create('https://ipfs.infura.io:5001/api/v0')

const StyledCard = styled(Card)`
    width: 100%;
    display: inline-block;
    margin-bottom: 1em;
`

const TextArea = styled.textarea`
    border: none;
    border-radius: 6px;
    font-family: ${p => p.theme.font};
    overflow: auto;
    outline: none;
    padding: 0.3em;
    margin-bottom: 0.4em;
  
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
    box-shadow: none;
  
    resize: none; /*remove the resize handle on the bottom right*/
    box-sizing: border-box;
    resize: none;
    font-size: 1em;
    height: ${p => p.height || 3}em;
    width: 100%;
    padding-bottom: 1em;
    color: #000;
    transition: all 100ms ease-in-out;

    &:focus {
        background: ${p => p.theme.darken2};
    }
`

const Header = styled.h2`
    margin: 0;
    color: ${p => p.theme.primary};
`

const PostPreview = styled.div`
    background: #FFF3EE;
    border-radius: 12px;
    padding: 1em;
    margin: 1em 0;
`

const FileInput = styled.input`
    opacity: 0;
    width: 0.1px;
    height: 0.1px;
    position: absolute;
`

const CustomLabel = styled.label`
    border: none;
    border-radius: 6px;
    padding: 0.6em 2em;
    display: inline-block;
    font-family: ${p => p.theme.font};
    font-weight: 500;
    font-size: 0.8em;
    color: ${p => p.theme.textLight};
    background: ${p => p.theme.primary};
    letter-spacing: 0.02em;
    transition: all 100ms;
    :hover {
        background: ${p => p.theme.primaryHover};
        cursor: pointer;
    }
    :focus {
        box-shadow: 0px 2px 2px -1px rgba(0, 0, 0, 0.12), 0px 0px 0px 3px #D25D38;
        outline: none;
    }
`

const Actions = styled.div`
    display: flex;
    align-items: center;
`

const StyledButton = styled(Button)`
    display: block;
    margin: 1em 0;
`

const chain = 'mumbai'

const Compose = ({
    wallet,
    profileId,
    profileName,
    lensHub,
    cta,
    placeholder,
    replyTo,
    isPost,
    isCommunity,
    isComment,
    }) => {
    const [description, setDescription] = useState('')
    const [selectedVisibility, setSelectedVisibility] = useState('public')
    const [mutatePostTypedData, typedPostData] = useMutation(CREATE_POST_TYPED_DATA)
    const [mutateCommentTypedData, typedCommentData] = useMutation(CREATE_COMMENT_TYPED_DATA)
    const [broadcast, broadcastData] = useMutation(BROADCAST)
    const [savedTypedData, setSavedTypedData] = useState({})
    const [showModal, setShowModal] = useState(false)
    const [showError, setShowError] = useState(false)

    const handlePreview = async () => {
        if (!description) return;
        setShowModal(true)
        // console.log({ name, description, profile })
    }

    // Uploading Video
    const [videoUploading, setVideoUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState("");
    const [video, setVideo] = useState("")
    const [videoNftMetadata, setVideoNftMetadata] = useState({})


    const videoUpload = async () => {
        setVideoUploading(true)
        const formData = new FormData();
        console.log(selectedFile)
        formData.append(
            "fileName",
            selectedFile,
            selectedFile.name
        );

        const response = await fetch('https://irisxyz.herokuapp.com/upload', { method: "POST", body: formData, mode: "cors" });
        const data = await response.json();

        console.log(data);

        // console.log("The nftmetadataURL ", data["nftMetadataGatewayUrl"])

        // Get metadata from livepeer
        const responseVidNftMetadata = await fetch(data["nftMetadataGatewayUrl"], { method: "GET" });
        const vidNftData = await responseVidNftMetadata.json();

        setVideoNftMetadata(vidNftData)
        console.log("VideoNFTMetaData :", vidNftData)

        setVideoUploading(false)


        // console.log(data);
        // const ipfs = await fetch(`https://ipfs.io/${data.data.replace(":", "")}`);
        // const nftMetadata = await ipfs.json()
        // console.log(nftMetadata);
        // setVideo(`https://ipfs.io/${nftMetadata.properties.video.replace(":", "")}`)

    }

    const handleSubmit = async () => {
        if (!description) return;

        let ipfsResult = '';
        const attributes = [];
        const metadata = {
            name: `post by ${profileName}`,
            description,
            content: description,
            external_url: null,
            image: null,
            imageMimeType: null,
            version: "1.0.0",
            appId: 'iris',
            attributes,
            media: [],
            metadata_id: uuidv4(),
        }
        
        switch(selectedVisibility) {
            case 'follower':
                attributes.push({
                    traitType: 'Encoded Post Data',
                    value: '',
                });
                break;
            case 'collector':
                attributes.push({
                    traitType: 'Encoded Post Data',
                    value: '',
                });
                break;
            case 'community':
                attributes.push({
                    traitType: 'Encoded Post Data',
                    value: '',
                });
                break;
            default:
        }

        if (videoNftMetadata.animation_url) {
            // For video
            ipfsResult = await client.add(JSON.stringify({
                name: videoNftMetadata["name"],
                description,
                content: description,
                external_url: null,
                // image: null,
                image: videoNftMetadata["image"],
                imageMimeType: null,
                version: "1.0.0",
                appId: 'iris',
                attributes: [],
                media: [{
                    item: videoNftMetadata["animation_url"],
                    type: "video/mp4"
                }],
                metadata_id: uuidv4(),
            }))

        } else {
            // For Only Text Post
            console.log(metadata)
            ipfsResult = await client.add(JSON.stringify(metadata))
        }

        if(replyTo) {
            const createCommentRequest  = {
                profileId: profileId,
                publicationId: replyTo,
                contentURI: 'ipfs://' + ipfsResult.path,
                collectModule: {
                    freeCollectModule: { 
                        followerOnly: false 
                    },
                },
                referenceModule: {
                    followerOnlyReferenceModule: false,
                },
            };
    
            mutateCommentTypedData({
                variables: {
                    request: createCommentRequest ,
                }
            })
        } else {
            const createPostRequest = {
                profileId: profileId,
                contentURI: 'ipfs://' + ipfsResult.path,
                collectModule: {
                    freeCollectModule: { 
                        followerOnly: false
                    },
                },
                referenceModule: {
                    followerOnlyReferenceModule: false,
                },
            };
    
            mutatePostTypedData({
                variables: {
                    request: createPostRequest,
                }
            })
        }

    }

    useEffect(() => {
        const processPost = async (data) => {
            const { domain, types, value } = data.typedData

            const signature = await wallet.signer._signTypedData(
                omitDeep(domain, '__typename'),
                omitDeep(types, '__typename'),
                omitDeep(value, '__typename'),
            )

            setSavedTypedData({
                ...data.typedData,
                signature,
            })

            broadcast({
                variables: {
                    request: {
                        id: data.id,
                        signature,
                    }
                }
            })

        }
        if (typedPostData.data) processPost(typedPostData.data.createPostTypedData);
        else if (typedCommentData.data) processPost(typedCommentData.data.createCommentTypedData);

    }, [typedPostData.data, typedCommentData.data])

    useEffect(() => {
        if (!broadcastData.data) return;
        const processBroadcast = async () => {

            if (broadcastData.data.broadcast.__typename === 'RelayError') {
                console.log('asking user to pay for gas because error', broadcastData.data.broadcast.reason)

                const { v, r, s } = utils.splitSignature(savedTypedData.signature);

                const tx = await lensHub.postWithSig({
                    profileId: savedTypedData.value.profileId,
                    contentURI: savedTypedData.value.contentURI,
                    collectModule: savedTypedData.value.collectModule,
                    collectModuleInitData: savedTypedData.value.collectModuleInitData,
                    referenceModule: savedTypedData.value.referenceModule,
                    referenceModuleInitData: savedTypedData.value.referenceModuleInitData,
                    sig: {
                        v,
                        r,
                        s,
                        deadline: savedTypedData.value.deadline,
                    },
                });
                
                console.log('create post: tx hash', tx.hash);
                await pollUntilIndexed(tx.hash)
                setShowModal(false)
                setDescription('')

                return;
            }
            
            const txHash = broadcastData.data.broadcast.txHash
            console.log('create post: tx hash', txHash);
            if (!txHash) return;
            await pollUntilIndexed(txHash)
            setShowModal(false)
            setDescription('')
        }
        processBroadcast()

    }, [broadcastData.data])

    return (
        <>
            <StyledCard>
                <form onSubmit={handlePreview}>
                    <TextArea
                        value={description}
                        placeholder={placeholder || 'What\'s blooming?'}
                        height={5}
                        onChange={e => setDescription(e.target.value)}
                    />
                </form>
                <Actions>
                    {videoUploading ? <Button>Video Uploading...</Button> : <Button disabled={!description} onClick={handleSubmit}>{cta || 'Post'}</Button>}
                    <VisibilitySelector
                        showFollower={isPost}
                        showCommunity={isCommunity}
                        showCollector={isComment}
                        selectedVisibility={selectedVisibility}
                        setSelectedVisibility={setSelectedVisibility} />
                </Actions>

                {/* <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
            /> */}
                {/* <InputWrapper>
                    {selectedFile ? <>
                        {selectedFile.name}  <Button onClick={videoUpload}>Upload</Button>
                    </>
                        : <div class="file-input">
                            <FileInput type="file" id="file" class="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
                            <CustomLabel for="file">Select Video</CustomLabel>
                        </div>}
                </InputWrapper> */}

            </StyledCard>
        </>
    )
}

export default Compose