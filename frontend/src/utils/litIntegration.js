import { v4 as uuidv4 } from 'uuid'
import { create } from 'ipfs-http-client'
import LitJsSdk from 'lit-js-sdk'
import { CHAIN } from '../utils/constants'

const auth = 'Basic ' + Buffer.from(process.env.REACT_APP_INFURA_PROJECT_ID + ':' + process.env.REACT_APP_INFURA_API_KEY).toString('base64');

const client = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});

client.pin.add('QmeGAVddnBSnKc1DLE7DLV9uuTqo5F7QbaveTjr45JUdQn').then((res) => {
    console.log(res);
});

const getAccessControlConditions = async (params) => {
    const {description, lensHub, profileId, profileName, selectedVisibility, replyTo} = params

    switch(selectedVisibility) {
        case 'follower':
            const followNFTAddr = await lensHub.getFollowNFT(profileId);
            return [
                {
                    contractAddress: followNFTAddr,
                    standardContractType: 'ERC721',
                    chain: CHAIN,
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
            const collectNFTAddr = await lensHub.getCollectNFT(pubProfileId, pubId);
            if (collectNFTAddr === '0x0000000000000000000000000000000000000000') {
                console.warn('getCollectNFT returned 0x0 address')
                return
            }
            return [
                {
                    contractAddress: collectNFTAddr,
                    standardContractType: 'ERC721',
                    chain: CHAIN,
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
    const {description, profileId, profileName, selectedVisibility, replyTo} = params
    
    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(
        description
    );

    const authSig = JSON.parse(window.sessionStorage.getItem('signature'))

    const accessControlConditions = await getAccessControlConditions(params)

    const encryptedSymmetricKey = await window.litNodeClient.saveEncryptionKey({
        accessControlConditions,
        symmetricKey,
        authSig,
        chain: CHAIN,
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
    const {description, profileId, profileName, selectedVisibility, replyTo, videoIPFSData, mutateCommentTypedData, mutatePostTypedData} = params
    if (!description) return;

    let ipfsResult;
    let metadata;

    if (selectedVisibility !== 'public') {
        metadata = await getEncodedMetadata(params)
    } else if (videoIPFSData) {
        // ipfs.cid: bafybeihv5ahbgd2awcpmdzmonow4jx7d5okljxcrgu4mhbzmhudb7gugcq
        // ipfs.nftMetadata.cid: bafkreibgs2wbczztbojot6ynyjhbv6hp6moiyf5laxegshfbevcm3pvm6a
        console.log("posting video")
        console.log(videoIPFSData)
        metadata = {
            name: `post by ${profileName}`,
            description,
            content: description,
            external_url: null,
            image: null,
            imageMimeType: null,
            animation_url: `ipfs://${videoIPFSData.cid}`,
            version: "1.0.0",
            appId: 'iris',
            attributes: [],
            media: [{
                item: `ipfs://${videoIPFSData.cid}`,
                type: "video/mp4"
            }],
            metadata_id: uuidv4(),
        }
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
