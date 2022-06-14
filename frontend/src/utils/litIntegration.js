import { v4 as uuidv4 } from 'uuid'
import { create } from 'ipfs-http-client'
import LitJsSdk from 'lit-js-sdk'

const client = create('https://ipfs.infura.io:5001/api/v0')
const chain = 'mumbai'

const getEncodedMetadata = async (params) => {
    const {description, lensHub, wallet, profileId, profileName, selectedVisibility, replyTo} = params
    const followNFTAddr = await lensHub.getFollowNFT(profileId);
    
    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(
        description
    );

    const accessControlConditions = [
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

    const authSig = JSON.parse(window.sessionStorage.getItem('signature'))

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
        appId: 'iris super',
        attributes,
        media: [],
        metadata_id: uuidv4(),
    }

    attributes.push({
        traitType: 'Encoded Post Data',
        value: `${JSON.stringify(encryptedPost)}`,
    })
    
    // switch(selectedVisibility) {
    //     case 'follower':
    //         attributes.push({
    //             traitType: 'Encoded Post Data',
    //             value: '',
    //         });
    //         break;
    //     case 'collector':
    //         attributes.push({
    //             traitType: 'Encoded Post Data',
    //             value: '',
    //         });
    //         break;
    //     case 'community':
    //         attributes.push({
    //             traitType: 'Encoded Post Data',
    //             value: '',
    //         });
    //         break;
    //     default:
    // }

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
