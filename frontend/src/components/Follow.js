import { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client'
import { utils } from 'ethers'
import { CREATE_FOLLOW_TYPED_DATA, BROADCAST } from '../utils/queries'
import omitDeep from 'omit-deep'
import Button from './Button'
import Toast from './Toast'
import pollUntilIndexed from '../utils/pollUntilIndexed'
import { useWallet } from '../utils/wallet'

// profile being the user being viewed, profileId the id of the user using the app
function Follow({ lensHub, profile = {}, profileId }) {
    const { wallet } = useWallet()
    const [toastMsg, setToastMsg] = useState('')
    const [createFollowTyped, createFollowTypedData] = useMutation(CREATE_FOLLOW_TYPED_DATA, {
        onError(error){
            setToastMsg({ type: 'error', msg: error.message })
        }
    });
    const [broadcast, broadcastData] = useMutation(BROADCAST)
    const [savedTypedData, setSavedTypedData] = useState({})

    const followRequest = {
        profile: profile.id,
        followModule: null,
    }

    if (profile?.followModule?.type === 'ProfileFollowModule') {
        followRequest.followModule = {
            profileFollowModule: {
                profileId: profileId
           }  
        }
    }

    const handleClick = async () => {
        // if (profile.followModule !== null) {
        //     const followSubscriptionRequest = [
        //         {
        //             profile: profile.id,
        //             followModule: {
        //                 feeFollowModule: {
        //                     amount: {
        //                         currency: "0x9c3c9283d3e44854697cd22d3faa240cfb032889",
        //                         value: profile.followModule.amount.value,
        //                     },
        //                 },
        //             },
        //         },
        //     ];
        //     createFollowTyped({
        //         variables: {
        //             request: {
        //                 follow: followSubscriptionRequest,
        //             },
        //         },
        //     });
        // } else {
            createFollowTyped({
                variables: {
                    request: {
                        follow: [followRequest],
                    },
                },
            });
            
        // }
    };

    useEffect(() => {
        if (!createFollowTypedData.data) return;

        const handleCreate = async () => {
            const typedData = createFollowTypedData.data.createFollowTypedData.typedData;
            const { domain, types, value } = typedData;

            const signature = await wallet.signer._signTypedData(
                omitDeep(domain, "__typename"),
                omitDeep(types, "__typename"),
                omitDeep(value, "__typename")
            );
            setToastMsg({ type: 'loading', msg: 'Transaction indexing...' })

            setSavedTypedData({
                ...typedData,
                signature
            })

            broadcast({
                variables: {
                    request: {
                        id: createFollowTypedData.data.createFollowTypedData.id,
                        signature
                    }
                }
            })

        };

        handleCreate();
    }, [createFollowTypedData.data])

    
    useEffect(() => {
        if (!broadcastData.data) return;
        const processBroadcast = async () => {

            if (broadcastData.data.broadcast.__typename === 'RelayError') {
                console.log('asking user to pay for gas because error', broadcastData.data.broadcast.reason)

                const { v, r, s } = utils.splitSignature(savedTypedData.signature);

                const tx = await lensHub.followWithSig(
                    {
                        follower: wallet.address,
                        profileIds: savedTypedData.value.profileIds,
                        datas: savedTypedData.value.datas,
                        sig: {
                            v,
                            r,
                            s,
                            deadline: savedTypedData.value.deadline,
                        },
                    },
                    { gasLimit: 1000000 }
                );
                
                console.log('follow: tx hash', tx.hash);
                await pollUntilIndexed(tx.hash)
                console.log('follow: success')
                setToastMsg({ type: 'success', msg: 'Transaction indexed' })
                return;
            }
            
            const txHash = broadcastData.data.broadcast.txHash
            console.log('follow: tx hash', txHash);
            if (!txHash) return;
            await pollUntilIndexed(txHash)
            console.log('follow: success')
            setToastMsg({ type: 'success', msg: 'Transaction indexed' })
        }
        processBroadcast()

    }, [broadcastData.data])

    return (
        <div>
            <Toast type={toastMsg.type}>{toastMsg.msg}</Toast>
            <Button onClick={handleClick}>Follow</Button>
        </div>
    );
}

export default Follow;
