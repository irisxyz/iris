import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useMutation } from '@apollo/client'
import { utils } from 'ethers'
import omitDeep from 'omit-deep'
import { v4 as uuidv4 } from 'uuid';
import { create } from 'ipfs-http-client'
import Button from './Button'
import Card from './Card'
import Modal from './Modal'
import { CREATE_POST_TYPED_DATA } from '../utils/queries'


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
        background: #ECE8FF;
    }
`

const Header = styled.h2`
    margin: 0;
    color: ${p => p.theme.primary};
`

const PostPreview = styled.div`
    background: #ECE8FF;
    border-radius: 12px;
    padding: 1em;
    margin: 1em 0;
`

const Compose = ({ wallet, profile, lensHub }) => {
    const [name, setName] = useState('title')
    const [description, setDescription] = useState('')
    const [mutatePostTypedData, typedPostData] = useMutation(CREATE_POST_TYPED_DATA)
    const [showModal, setShowModal] = useState(false)

    const handlePreview = async () => {
        if (!description) return;
        setShowModal(true)
        console.log({name, description})
    }

    const handleSubmitGated = async () => {
        const id = profile.id.replace('0x', '')
        if (!description) return;
        console.log({id, name, description})

        const ipfsResult = await client.add(JSON.stringify({
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

        // hard coded to make the code example clear
        const createPostRequest = {
            profileId: profile.id,
            contentURI: 'ipfs://' + ipfsResult.path,
            collectModule: {
                revertCollectModule: true,
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
        console.log({id, name, description})

        const ipfsResult = await client.add(JSON.stringify({
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

        // hard coded to make the code example clear
        const createPostRequest = {
            profileId: profile.id,
            contentURI: 'ipfs://' + ipfsResult.path,
            collectModule: {
                revertCollectModule: true,
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
            const {domain, types, value} = typedData
    
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
                collectModuleData: typedData.value.collectModuleData,
                referenceModule: typedData.value.referenceModule,
                referenceModuleData: typedData.value.referenceModuleData,
                sig: {
                  v,
                  r,
                  s,
                  deadline: typedData.value.deadline,
                },
              });
              console.log('create post: tx hash', tx.hash);
        }
        processPost()

    }, [typedPostData.data])

    return (
        <>
        { showModal && <Modal onExit={() => setShowModal(false)}>

            <Header>Great plant! 🌱</Header>
            <PostPreview>
            { description }
            </PostPreview>
            <b>How do you want your post to be viewed?</b>
            <br/>
            <Button onClick={handleSubmit}>Follower only</Button>
            <br/>
            <Button onClick={handleSubmitGated}>Public</Button>
            </Modal> }
        <StyledCard>
            <form onSubmit={handlePreview}>
                {/* <TextArea
                    value={name}
                    placeholder="Title"
                    style={{ overflow: 'hidden' }}
                    height={2}
                    onChange={e => setName(e.target.value)}
                /> */}
                <TextArea
                    value={description}
                    placeholder="What's happening?"
                    height={5}
                    onChange={e => setDescription(e.target.value)}
                />
            </form>
            <Button onClick={handlePreview}>Plant</Button>
        </StyledCard>
        </>
    )
}

export default Compose