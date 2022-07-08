import { useEffect, useState } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import { utils } from 'ethers'
import { MODULE_APPROVAL_DATA, CREATE_COLLECT_TYPED_DATA, BROADCAST } from '../utils/queries'
import omitDeep from 'omit-deep'
import Bookmark from '../assets/Bookmark'
import Community from '../assets/Community'
import pollUntilIndexed from '../utils/pollUntilIndexed'
import { CHAIN } from '../utils/constants'
import { RoundedButton } from './Button'
import { useWallet } from '../utils/wallet'

function Collect({ profileId, publicationId, collected, stats, isCommunity, isCta, setToastMsg }) {
    const { wallet, lensHub, provider } = useWallet()
    const [getModuleApproval, getModuleApprovalData] = useLazyQuery(MODULE_APPROVAL_DATA)
    const [createCollectTyped, createCollectTypedData] = useMutation(CREATE_COLLECT_TYPED_DATA, {
        onError(error){
            if (error.message === 'You do not have enough allowance to collect this publication.'){
                getModuleApproval({
                    variables: {
                        request: {
                            currency: CHAIN === 'polygon' ? '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270' : '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
                            value: '1000',
                            collectModule: 'FeeCollectModule',
                        }
                    }
                })
            }
        }
    })
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
        if (!getModuleApprovalData.data) return;

        const handleGenModuleApproval = async () => {

            const generateModuleCurrencyApprovalData = getModuleApprovalData.data.generateModuleCurrencyApprovalData

            const tx = {
                to: generateModuleCurrencyApprovalData.to,
                from: generateModuleCurrencyApprovalData.from,
                data: generateModuleCurrencyApprovalData.data,
                gasPrice: utils.hexlify(parseInt(await provider.getGasPrice())),
            };

            const signer = provider.getSigner();

            await signer.sendTransaction(tx)
            setToastMsg({ type: 'success', msg: 'Module approved', })
        }
        handleGenModuleApproval();

    }, [getModuleApprovalData.data]);

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
