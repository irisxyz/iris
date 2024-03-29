import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { useMutation } from '@apollo/client'
import { utils } from 'ethers'
import omitDeep from 'omit-deep'

import Button from './Button'
import Card from './Card'
import Image from './Image'
import Video from './Video'
import Filmstrip from '../assets/Filmstrip'
import ImageIcon from '../assets/Thumbnail'
import { CREATE_POST_TYPED_DATA, CREATE_COMMENT_TYPED_DATA, BROADCAST } from '../utils/queries'
import pollUntilIndexed from '../utils/pollUntilIndexed'
import { handleCompose } from '../utils/litIntegration'
import { CHAIN } from '../utils/constants'
import VisibilitySelector from './VisibilitySelector'
import Toast from './Toast'
import { useWallet } from '../utils/wallet'
import { useSigner } from 'wagmi'

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

const InputWrapper = styled.div`
    margin-bottom: 0.4em;
`;

const FileInput = styled.input`
    opacity: 0;
    width: 0.1px;
    height: 0.1px;
    position: absolute;
`

const CustomLabel = styled.label`
    border: none;
    border-radius: 6px;
    padding: 0.9em 0.3em 0.1em;
    display: inline-block;
    font-family: ${p => p.theme.font};
    font-weight: 500;
    font-size: 0.8em;
    color: ${p => p.theme.textLight};
    letter-spacing: 0.02em;
    transition: all 100ms;
    :focus {
        box-shadow: 0px 2px 2px -1px rgba(0, 0, 0, 0.12), 0px 0px 0px 3px #D25D38;
        outline: none;
    }
    svg: hover {
        cursor: pointer;
    }
    svg: hover path {
        stroke: ${p => p.theme.primaryHover};
    }
`

const PostButtonWrapper = styled.div`
    align-items: right;
    text-align: right;
`

const Actions = styled.div`
    display: flex;
    align-items: center;
`

const videoFileTypes = ['.mp4','.mov','.webm','.3gpp','.3gpp2','.flv','.mpeg']

const imageFileTypes = ['.jpg','.jpeg','.png','.gif']

const Compose = ({
    profileId,
    profileName,
    cta,
    placeholder,
    replyTo,
    isPost,
    isCommunity,
    isComment,
    }) => {
    const { data: signer } = useSigner()
    const { lensHub } = useWallet()
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
        await handleCompose({description, lensHub, profileId, profileName, selectedVisibility, replyTo, mutateCommentTypedData, mutatePostTypedData})
    }

    useEffect(() => {
        const processPost = async (data) => {
            const { domain, types, value } = data.typedData

            const signature = await signer._signTypedData(
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

    const isValidFileType = (validFileTypes, file) => {
        if (!file.type) {
            return false;
        }
        const fileType = "." + file.type.split("/").pop();
        return validFileTypes.includes(fileType);
    }
    
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
                {selectedFile && isValidFileType(videoFileTypes, selectedFile) &&
                    <Video 
                        src={selectedFile}
                        hasCloseButton={true}
                        closeButtonFn={() => setSelectedFile("")}
                    />
                }
                {selectedFile && isValidFileType(imageFileTypes, selectedFile) &&
                    <Image 
                        src={selectedFile} 
                        hasCloseButton={true}
                        closeButtonFn={() => setSelectedFile("")}
                    />
                }
                <Actions>
                    <InputWrapper>
                        <div className="file-input">
                            <FileInput type="file" id="fileVideo" accept={videoFileTypes.join(',')} className="file" onClick={(e) => e.target.value = ''} onChange={(e) => setSelectedFile(e.target.files[0])}/>
                            <CustomLabel htmlFor="fileVideo"><Filmstrip/></CustomLabel>
                            <FileInput type="file" id="fileImage" accept={imageFileTypes.join(',')} className="file" onClick={(e) => e.target.value = ''} onChange={(e) => setSelectedFile(e.target.files[0])} />
                            <CustomLabel htmlFor="fileImage"><ImageIcon/></CustomLabel>
                        </div>
                    </InputWrapper>
                    {CHAIN === 'mumbai' && <VisibilitySelector
                        showFollower={isPost}
                        showCommunity={isCommunity}
                        showCollector={isComment}
                        selectedVisibility={selectedVisibility}
                        setSelectedVisibility={setSelectedVisibility} />}
                </Actions>

                <PostButtonWrapper>
                {videoUploading ? <Button>Video Uploading...</Button> : <Button disabled={!description} onClick={handleSubmit}>{cta || 'Post'}</Button>}
                </PostButtonWrapper>

            </StyledCard>
        </>
    )
}

export default Compose