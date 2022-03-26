import { useEffect } from 'react'
import { gql, useMutation } from '@apollo/client'
import { utils } from 'ethers'
import omitDeep from 'omit-deep'
import Button from './Button'
import CommentIcon from '../assets/Comment'

const CREATE_COMMENT_TYPED_DATA = gql`
  mutation($request: CreatePublicCommentRequest!) { 
    createCommentTypedData(request: $request) {
      id
      expiresAt
      typedData {
        types {
          CommentWithSig {
            name
            type
          }
        }
      domain {
        name
        chainId
        version
        verifyingContract
      }
      value {
        nonce
        deadline
        profileId
        profileIdPointed
        pubIdPointed
        contentURI
        collectModule
        collectModuleData
        referenceModule
        referenceModuleData
      }
     }
   }
 }
`;


function Comment({ wallet, lensHub, profileId, publicationId }) {
    const [createCommentTyped, createCommentTypedData] = useMutation(CREATE_COMMENT_TYPED_DATA)

    const commentRequest = [
        {
            profileId: 0x0139,
            publicationId: 0x0139-0x01,
            contentURI: "ipfs://QmPogtffEF3oAbKERsoR4Ky8aTvLgBF5totp5AuF8YN6vl.json",
            collectModule: {
                emptyCollectModule: true
            },
            referenceModule: {
                followerOnlyReferenceModule: false
            }
        }
    ];
    
    const handleClick = async () => {
        createCommentTyped({
            variables: {
                request: commentRequest,
            },
        });
    }
    
    useEffect(() => {
        if (!createCommentTypedData.data) return
  
        const handleCreate = async () => {
            console.log(createCommentTypedData.data)
            
            const typedData = createCommentTypedData.data.createCommentTypedData.typedData;
            const {domain, types, value} = typedData
    
            const signature = await wallet.signer._signTypedData(
                omitDeep(domain, '__typename'),
                omitDeep(types, '__typename'),
                omitDeep(value, '__typename')
            )

            const { v, r, s } = utils.splitSignature(signature);
            
            const tx = await lensHub.commentWithSig({
                profileId: typedData.value.profileId,
                contentURI: typedData.value.contentURI,
                profileIdPointed: typedData.value.profileIdPointed,
                pubIdPointed: typedData.value.pubIdPointed,
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
            console.log('create comment: tx hash', tx.hash);
        }

        handleCreate()
    }, [createCommentTypedData.data])


    return (
        <div>
            <Button onClick={handleClick}>
                <CommentIcon/>
            </Button>
        </div>
    )
}

export default Comment