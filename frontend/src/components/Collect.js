import { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client'
import { utils } from 'ethers'
import { CREATE_COLLECT_TYPED_DATA, BROADCAST } from '../utils/queries'
import omitDeep from 'omit-deep'
import Bookmark from '../assets/Bookmark'
import Community from '../assets/Community'
import pollUntilIndexed from '../utils/pollUntilIndexed'
import { RoundedButton } from './Button'

function Collect({ wallet, lensHub, profileId, publicationId, collected, stats, isCommunity, isCta, setToastMsg }) {
    const [createCollectTyped, createCollectTypedData] = useMutation(CREATE_COLLECT_TYPED_DATA)
    const [broadcast, broadcastData] = useMutation(BROADCAST)
    const [savedTypedData, setSavedTypedData] = useState({})
    const [apiError, setApiError] = useState('')

    const handleClick = async (e) => {
        e.stopPropagation()
        const collectReq = {
            publicationId: publicationId,
        };
        try {
            await createCollectTyped({
                variables: {
                    request: collectReq,
                },
            });
        }
        catch (err) {
            alert(err)
            setApiError(apiError)
        }
    };

    useEffect(() => {
        if (!createCollectTypedData.data) return;

        const handleCreate = async () => {

            const typedData = createCollectTypedData.data.createCollectTypedData.typedData;

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
                        id: createCollectTypedData.data.createCollectTypedData.id,
                        signature
                    }
                }
            })
        }
        handleCreate();

    }, [createCollectTypedData.data]);

    
    useEffect(() => {
        if (!broadcastData.data) return;
        const processBroadcast = async () => {

            if (broadcastData.data.broadcast.__typename === 'RelayError') {
                console.log('asking user to pay for gas because error', broadcastData.data.broadcast.reason)

                const { v, r, s } = utils.splitSignature(savedTypedData.signature);

                const tx = await lensHub.collectWithSig({
                    collector: wallet.address,
                    profileId: savedTypedData.value.profileId,
                    pubId: savedTypedData.value.pubId,
                    data: savedTypedData.value.data,
                    sig: {
                      v,
                      r,
                      s,
                      deadline: savedTypedData.value.deadline,
                    },
                  },
                  { gasLimit: 1000000 }
                  );
                
                console.log('collect: tx hash', tx.hash);
                await pollUntilIndexed(tx.hash)
                console.log('collect: success')
                setToastMsg({ type: 'success', msg: 'Transaction indexed' })

                return;
            }
            
            const txHash = broadcastData.data.broadcast.txHash
            console.log('collect: tx hash', txHash);
            if (!txHash) return;
            await pollUntilIndexed(txHash)
            console.log('collect: success')
            setToastMsg({ type: 'success', msg: 'Transaction indexed' })
        }
        processBroadcast()

    }, [broadcastData.data])

    if(isCta) return <RoundedButton onClick={handleClick}>{collected ? 'Joined' : 'Join Community'}</RoundedButton>
    
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px'}}>
            {isCommunity
                ? <Community onClick={handleClick} filled={collected} />
                : <Bookmark onClick={handleClick} filled={collected} />
            }
            <p>{ stats.totalAmountOfCollects }</p>
        </div>
    );
}

export default Collect;
