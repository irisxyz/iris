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
import { CREATE_POST_TYPED_DATA } from '../utils/queries'
import pollUntilIndexed from '../utils/pollUntilIndexed'


const client = create('https://ipfs.infura.io:5001/api/v0')

const StyledCard = styled(Card)`
    width: 100%;
    display: inline-block;
    margin-bottom: 2em;
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
        background: #FFF3EE;
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

const InputWrapper = styled.div`
    float: right;
`

const StyledButton = styled(Button)`
    display: block;
    margin: 1em 0;
`

const chain = 'mumbai'

const Compose = ({ wallet, profile, lensHub }) => {
    const [name, setName] = useState('title')
    const [description, setDescription] = useState('')
    const [mutatePostTypedData, typedPostData] = useMutation(CREATE_POST_TYPED_DATA)
    const [showModal, setShowModal] = useState(false)

    const handlePreview = async () => {
        if (!description) return;
        setShowModal(true)
        console.log({ name, description, profile })
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

    const handleSubmitGated = async () => {
        const id = profile.id.replace('0x', '')
        if (!description) return;
        console.log({ id, name, description })

        const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain })

        const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(
            description
        );

        const accessControlConditions = [
            {
                contractAddress: '0xdde7691b609fC36A59Bef8957B5A1F9164cB24d2',
                standardContractType: 'ERC721',
                chain,
                method: 'balanceOf',
                parameters: [
                    ':userAddress',
                ],
                returnValueTest: {
                    comparator: '>',
                    value: '0'
                }
            }
        ]

        const encryptedSymmetricKey = await window.litNodeClient.saveEncryptionKey({
            accessControlConditions,
            symmetricKey,
            authSig,
            chain,
        });


        const blobString = await encryptedString.text()
        console.log(JSON.stringify(encryptedString))
        console.log(encryptedString)
        const newBlob = new Blob([blobString], {
            type: encryptedString.type // or whatever your Content-Type is
        });
        console.log(newBlob)
        console.log(LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16"))

        const ipfsResult = await client.add(encryptedString)

        // const isthisblob = client.cat(ipfsResult.path)
        // let newEcnrypt;
        // for await (const chunk of isthisblob) {
        //     newEcnrypt = new Blob([chunk], {
        //         type: encryptedString.type // or whatever your Content-Type is
        //       })
        // }

        // const key = await window.litNodeClient.getEncryptionKey({
        //     accessControlConditions,
        //     // Note, below we convert the encryptedSymmetricKey from a UInt8Array to a hex string.  This is because we obtained the encryptedSymmetricKey from "saveEncryptionKey" which returns a UInt8Array.  But the getEncryptionKey method expects a hex string.
        //     toDecrypt: LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16"),
        //     chain,
        //     authSig
        //   })

        //   const decryptedString = await LitJsSdk.decryptString(
        //     newEcnrypt,
        //     key
        //   );

        //   console.log(decryptedString)

        const encryptedPost = {
            key: LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16"),
            blobPath: ipfsResult.path,
            contract: '0xdde7691b609fC36A59Bef8957B5A1F9164cB24d2'
        }

        const postIpfsRes = await client.add(JSON.stringify({
            name,
            description: `litcoded}`,
            content: `${JSON.stringify(encryptedPost)}`,
            external_url: null,
            image: null,
            imageMimeType: null,
            version: "1.0.0",
            appId: 'iris',
            attributes: [],
            media: [],
            metadata_id: uuidv4(),
        }))

        const createPostRequest = {
            profileId: profile.id,
            contentURI: 'ipfs://' + postIpfsRes.path,
            collectModule: {
                freeCollectModule: { followerOnly: false },
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

    const handleSubmit = async () => {
        const id = profile.id.replace('0x', '')
        if (!description) return;
        console.log({ id, name, description })

        var ipfsResult = "";

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
            // Sample file of a what it should look like
            // ipfsResult = await client.add(JSON.stringify({
            //     name,
            //     description,
            //     content: description,
            //     external_url: null,
            //     // image: null,
            //     image: "ipfs://bafkreidmlgpjoxgvefhid2xjyqjnpmjjmq47yyrcm6ifvoovclty7sm4wm",
            //     imageMimeType: null,
            //     version: "1.0.0",
            //     appId: 'iris',
            //     attributes: [],
            //     media: [{
            //         item: "ipfs://QmPUwFjbapev1rrppANs17APcpj8YmgU5ThT1FzagHBxm7",
            //         type: "video/mp4"
            //     }],
            //     metadata_id: uuidv4(),
            // }))

        } else {

            // For Only Text Post

            ipfsResult = await client.add(JSON.stringify({
                name,
                description,
                content: description,
                external_url: null,
                image: null,
                imageMimeType: null,
                version: "1.0.0",
                appId: 'iris',
                attributes: [],
                media: [],
                metadata_id: uuidv4(),
            }))


        }

        console.log(ipfsResult.path)

        // hard coded to make the code example clear
        const createPostRequest = {
            profileId: profile.id,
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

    useEffect(() => {
        if (!typedPostData.data) return;

        const processPost = async () => {

            const typedData = typedPostData.data.createPostTypedData.typedData
            const { domain, types, value } = typedData

            const signature = await wallet.signer._signTypedData(
                omitDeep(domain, '__typename'),
                omitDeep(types, '__typename'),
                omitDeep(value, '__typename')
            )

            const { v, r, s } = utils.splitSignature(signature);

            const tx = await lensHub.postWithSig({
                profileId: typedData.value.profileId,
                contentURI: typedData.value.contentURI,
                collectModule: typedData.value.collectModule,
                collectModuleInitData: typedData.value.collectModuleInitData,
                referenceModule: typedData.value.referenceModule,
                referenceModuleInitData: typedData.value.referenceModuleInitData,
                sig: {
                    v,
                    r,
                    s,
                    deadline: typedData.value.deadline,
                },
            });
            console.log('create post: tx hash', tx.hash);
            await pollUntilIndexed(tx.hash)
            setShowModal(false)
            setDescription('')
        }
        processPost()

    }, [typedPostData.data])

    return (
        <>
            {showModal && <Modal onExit={() => setShowModal(false)}>

                <Header>Great plant! 🌱</Header>
                <PostPreview>
                    {description}
                </PostPreview>
                <b>How do you want your post to be viewed?</b>
                <br />
                <StyledButton onClick={handleSubmitGated}>Follower only</StyledButton>
                <StyledButton onClick={handleSubmit}>Public</StyledButton>
            </Modal>}
            <StyledCard>
                <form onSubmit={handlePreview}>
                    <TextArea
                        value={description}
                        placeholder="What's happening?"
                        height={5}
                        onChange={e => setDescription(e.target.value)}
                    />
                </form>
                {videoUploading ? <Button>Video Uploading...</Button> : <Button onClick={handlePreview}>Plant</Button>}

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