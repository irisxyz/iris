import { useEffect } from 'react'
import { signedTypeData, getAddressFromSigner, splitSignature } from './ethers.service';
import { gql } from '@apollo/client'
import Button from './Button'

const CREATE_FOLLOW_TYPED_DATA = gql`
  mutation($request: FollowRequest!) { 
    createFollowTypedData(request: $request) {
      id
      expiresAt
      typedData {
        domain {
          name
          chainId
          version
          verifyingContract
        }
        types {
          FollowWithSig {
            name
            type
          }
        }
        value {
          nonce
          deadline
          profileIds
          datas
        }
      }
    }
 }
`

function Follow({ wallet, contract }) {
    const [createFollowTyped, createFollowTypedData] = useMutation(CREATE_FOLLOW_TYPED_DATA)

    const followRequest = [
        {
           profile: "0x01",
        },
        {
           profile: "0x02",
           followModule: {
             feeFollowModule: {
               amount: {
                 currency: "0xD40282e050723Ae26Aeb0F77022dB14470f4e011",
                 value: "0.01"
               }
             }
           }
        }
    ];
    
    const handleClick = async () => {
        createFollowTyped({
            variables: {
              request: {
                follow: followRequest,
              },
            },
        });
    }
    
    useEffect(() => {
        if (!createFollowTypedData.data) return
  
        const handleCreate = async () => {
          console.log(createFollowTypedData.data)
          
          const typedData = createFollowTypedData.data.createFollowTypedData.typedData;
          const signature = await signedTypeData(typedData.domain, typedData.types, typedData.value);
          
          const { v, r, s } = splitSignature(signature);
          const tx = await contract.followWithSig({
            follower: getAddressFromSigner(),
            profileIds: typedData.value.profileIds,
            datas: typedData.value.datas,
            sig: {
              v,
              r,
              s,
              deadline: typedData.value.deadline,
            },
          });
          
          console.log(tx.hash);
        }

        handleCreate()
    }, [createFollowTypedData.data])


    return (
        <div>
            <Button onClick={handleClick}>Follow profile</Button>
        </div>
    )
}

export default Follow