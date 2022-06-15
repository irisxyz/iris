import { v4 as uuidv4 } from 'uuid'
import { create } from 'ipfs-http-client'
import LitJsSdk from 'lit-js-sdk'

const client = create('https://ipfs.infura.io:5001/api/v0')
const chain = 'mumbai'

const getAccessControlConditions = async (params) => {
    const {description, lensHub, wallet, profileId, profileName, selectedVisibility, replyTo} = params

    switch(selectedVisibility) {
        case 'follower':
            const followNFTAddr = await lensHub.getFollowNFT(profileId);
            return [
                {
                    contractAddress: followNFTAddr,
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
        case 'collector':
        case 'community':
            const pubProfileId = replyTo.split('-')[0]
            const pubId = replyTo.split('-')[1]
            console.log({replyTo, pubProfileId, pubId})
            const collectNFTAddr = await lensHub.getCollectNFT(pubProfileId, pubId);
            console.log(collectNFTAddr)
            if (collectNFTAddr === '0x0000000000000000000000000000000000000000') {
                console.warn('getCollectNFT returned 0x0 address')
                return
            }
            return [
                {
                    contractAddress: collectNFTAddr,
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
        default:
            console.warn(`invalid selectedVisibilty ${selectedVisibility}`)
            return []
    }

}

const getEncodedMetadata = async (params) => {
    const {description, lensHub, wallet, profileId, profileName, selectedVisibility, replyTo} = params
    
    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(
        description
    );

    const authSig = JSON.parse(window.sessionStorage.getItem('signature'))

    const accessControlConditions = await getAccessControlConditions(params)

    const encryptedSymmetricKey = await window.litNodeClient.saveEncryptionKey({
        accessControlConditions,
        symmetricKey,
        authSig,
        chain,
    });

    const ipfsResult = await client.add(encryptedString)
    
    const encryptedPost = {
        key: LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16"),
        blobPath: ipfsResult.path,
        accessControlConditions
    }

    const attributes = [];
    const metadata = {
        name: `encoded post by ${profileName}`,
        description: `This post is encoded. View it on https://irisapp.xyz`,
        content: `This post is encoded. View it on https://irisapp.xyz`,
        external_url: `https://irisapp.xyz`,
        image: null,
        imageMimeType: null,
        version: "1.0.0",
        appId: 'iris exclusive',
        attributes,
        media: [],
        metadata_id: uuidv4(),
    }

    attributes.push({
        traitType: 'Encoded Post Data',
        value: `${JSON.stringify(encryptedPost)}`,
    })

    return metadata
}

export const handleCompose = async (params) => {
    const {description, profileId, profileName, selectedVisibility, replyTo, mutateCommentTypedData, mutatePostTypedData} = params
    if (!description) return;

    let ipfsResult;
    let metadata;

    if(selectedVisibility !== 'public') {
        metadata = await getEncodedMetadata(params)
    } else {
        metadata = {
            name: `post by ${profileName}`,
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
        }
    }

    // For Only Text Post
    ipfsResult = await client.add(JSON.stringify(metadata))

    if(replyTo) {
        const createCommentRequest  = {
            profileId,
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
            profileId,
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
