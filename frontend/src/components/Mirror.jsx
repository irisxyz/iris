import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { utils } from 'ethers'
import { CREATE_MIRROR_TYPED_DATA, BROADCAST } from '../utils/queries'
import omitDeep from 'omit-deep'
import { useAccount, useSigner } from 'wagmi'
import Retweet from '../assets/Retweet'
import Button from './Button'
import pollUntilIndexed from '../utils/pollUntilIndexed'
import { useWallet } from '../utils/wallet'

function Mirror({ profileId, publicationId, stats, setToastMsg }) {
    const { lensHub } = useWallet()
    const { data: signer } = useSigner()
    const [createMirrorTyped, createMirrorTypedData] = useMutation(CREATE_MIRROR_TYPED_DATA)
    const [broadcast, broadcastData] = useMutation(BROADCAST)
    const [savedTypedData, setSavedTypedData] = useState({})

    const handleClick = async (e) => {
        e.stopPropagation()
        const mirrorRequest = {
            profileId: profileId,
            publicationId: publicationId,
            referenceModule: {
                followerOnlyReferenceModule: true,
            },
        };

        createMirrorTyped({
            variables: {
                request: mirrorRequest,
            },
        });
    };

    useEffect(() => {
        if (!createMirrorTypedData.data) return;

        const handleCreate = async () => {

            const typedData = createMirrorTypedData.data.createMirrorTypedData.typedData

            const { domain, types, value } = typedData

            const signature = await signer._signTypedData(
                omitDeep(domain, "__typename"),
                omitDeep(types, "__typename"),
                omitDeep(value, "__typename")
            )

            setToastMsg({ type: 'loading', msg: 'Transaction indexing...' })

            setSavedTypedData({
                ...typedData,
                signature
            })

            broadcast({
                variables: {
                    request: {
                        id: createMirrorTypedData.data.createMirrorTypedData.id,
                        signature
                    }
                }
            })

        };

        handleCreate();
    }, [createMirrorTypedData.data])

    
    useEffect(() => {
        if (!broadcastData.data) return;
        const processBroadcast = async () => {

            if (broadcastData.data.broadcast.__typename === 'RelayError') {
                console.log('asking user to pay for gas because error', broadcastData.data.broadcast.reason)

                const { v, r, s } = utils.splitSignature(savedTypedData.signature);

                const tx = await lensHub.mirrorWithSig({
                    profileId: savedTypedData.value.profileId,
                    profileIdPointed: savedTypedData.value.profileIdPointed,
                    pubIdPointed: savedTypedData.value.pubIdPointed,
                    referenceModuleData: savedTypedData.value.referenceModuleData,
                    referenceModule: savedTypedData.value.referenceModule,
                    referenceModuleInitData: savedTypedData.value.referenceModuleInitData,
                    sig: {
                        v,
                        r,
                        s,
                        deadline: savedTypedData.value.deadline,
                    },
                });
                
                console.log('mirror: tx hash', tx.hash);
                await pollUntilIndexed(tx.hash)
                console.log('mirror: success')
                setToastMsg({ type: 'success', msg: 'Transaction indexed' })

                return;
            }
            
            const txHash = broadcastData.data.broadcast.txHash
            console.log('mirror: tx hash', txHash);
            if (!txHash) return;
            await pollUntilIndexed(txHash)
            console.log('mirror: success')
            setToastMsg({ type: 'success', msg: 'Transaction indexed' })
        }
        processBroadcast()

    }, [broadcastData.data])

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px'}}>
            <Retweet onClick={handleClick} />
            <p>{ stats.totalAmountOfMirrors }</p>
        </div>
    );
}

export default Mirror;
