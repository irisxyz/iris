import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useMutation } from '@apollo/client'
import { utils } from 'ethers'
import omitDeep from 'omit-deep'

import Button from './Button'
import Card from './Card'
import { CREATE_POST_TYPED_DATA, CREATE_COMMENT_TYPED_DATA, BROADCAST } from '../utils/queries'
import pollUntilIndexed from '../utils/pollUntilIndexed'
import { handleCompose } from '../utils/litIntegration'
import { CHAIN } from '../utils/constants'
import VisibilitySelector from './VisibilitySelector'
import CollectModuleSelector from './CollectModuleSelector'
import Toast from './Toast'

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
    const [toastMsg, setToastMsg] = useState({})

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
        await handleCompose({description, lensHub, wallet, profileId, profileName, selectedVisibility, replyTo, mutateCommentTypedData, mutatePostTypedData})
    }

    useEffect(() => {
        const processPost = async (data) => {
            const { domain, types, value } = data.typedData

            const signature = await wallet.signer._signTypedData(
                omitDeep(domain, '__typename'),
                omitDeep(types, '__typename'),
                omitDeep(value, '__typename'),
            )

            setToastMsg({type: 'loading', msg: 'Transaction indexing...'})

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
                setToastMsg({type: 'success', msg: 'Transaction indexed'})
                return;
            }
            
            const txHash = broadcastData.data.broadcast.txHash
            console.log('create post: tx hash', txHash);
            if (!txHash) return;
            await pollUntilIndexed(txHash)
            setShowModal(false)
            setDescription('')
            setToastMsg({type: 'success', msg: 'Transaction indexed'})
        }
        processBroadcast()

    }, [broadcastData.data])

    return (
        <>
            <Toast type={toastMsg.type}>{toastMsg.msg}</Toast>
            <StyledCard>
                <TextArea
                    value={description}
                    placeholder={placeholder || 'What\'s blooming?'}
                    height={5}
                    onChange={e => setDescription(e.target.value)}
                />
                <Actions>
                    {videoUploading ? <Button>Video Uploading...</Button> : <Button disabled={!description} onClick={handleSubmit}>{cta || 'Post'}</Button>}
                    {CHAIN === 'mumbai' && <VisibilitySelector
                        showFollower={isPost}
                        showCommunity={isCommunity}
                        showCollector={isComment}
                        selectedVisibility={selectedVisibility}
                        setSelectedVisibility={setSelectedVisibility} />}
                    {/* {CHAIN === 'mumbai' && <CollectModuleSelector
                        showFollower={isPost}
                        showCommunity={isCommunity}
                        showCollector={isComment}
                        selectedModule={selectedVisibility}
                        setModule={setSelectedVisibility} />} */}
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