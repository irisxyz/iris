import { useEffect, useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { utils } from "ethers";
import omitDeep from "omit-deep";
import Heart from "../assets/Heart";

const CREATE_COLLECT_TYPED_DATA = gql`
  mutation($request: CreateCollectRequest!) { 
    createCollectTypedData(request: $request) {
      id
      expiresAt
      typedData {
        types {
          CollectWithSig {
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
        pubId
        data
      }
     }
   }
 }
`;

function Collect({ wallet, lensHub, profileId, publicationId, collected, stats }) {
    const [createCollectTyped, createCollectTypedData] = useMutation(CREATE_COLLECT_TYPED_DATA)
    const [apiError, setApiError] = useState('')

    const handleClick = async () => {
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
            console.log(createCollectTypedData.data);

            const typedData = createCollectTypedData.data.createCollectTypedData.typedData;
            const { domain, types, value } = typedData;

            const signature = await wallet.signer._signTypedData(
                omitDeep(domain, "__typename"),
                omitDeep(types, "__typename"),
                omitDeep(value, "__typename")
            );

            const { v, r, s } = utils.splitSignature(signature);

            const tx = await lensHub.collectWithSig({
              collector: wallet.address,
              profileId: typedData.value.profileId,
              pubId: typedData.value.pubId,
              data: typedData.value.data,
              sig: {
                v,
                r,
                s,
                deadline: typedData.value.deadline,
              },
            },
            { gasLimit: 1000000 }
            );
            
            console.log("collect: tx hash", tx.hash);
        };

        handleCreate();
    }, [createCollectTypedData.data]);
    
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px'}}>
            <Heart onClick={handleClick} filled={collected} />
            <p>{ stats.totalAmountOfCollects }</p>
        </div>
    );
}

export default Collect;
