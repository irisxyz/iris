import { v4 as uuidv4 } from 'uuid'
import { create } from 'ipfs-http-client'
import LitJsSdk from 'lit-js-sdk'

const client = create('https://ipfs.infura.io:5001/api/v0')

const chain = 'mumbai'

export const handleSubmitGated = async (description, profileId, profileName, mutatePostTypedData) => {
    const id = profileId.replace('0x', '')
    if (!description) return;
    console.log({ id, description })

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
        name: `post by ${profileName}`,
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
        profileId: profileId,
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

export const handleCompose = async (description, profileId, profileName, selectedVisibility, replyTo, mutateCommentTypedData, mutatePostTypedData) => {
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

    // For Only Text Post
    console.log(metadata)
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