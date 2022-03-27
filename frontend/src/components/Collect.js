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

function Mirror({ wallet, lensHub, profileId, publicationId }) {
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

            const tx = await lensHub.mirrorWithSig({
                profileId: typedData.value.profileId,
                profileIdPointed: typedData.value.profileIdPointed,
                pubIdPointed: typedData.value.pubIdPointed,
                referenceModule: typedData.value.referenceModule,
                referenceModuleData: typedData.value.referenceModuleData,
                sig: {
                    v,
                    r,
                    s,
                    deadline: typedData.value.deadline,
                },
            });
            console.log("collect: tx hash", tx.hash);
        };

        handleCreate();
    }, [createCollectTypedData.data]);

    return (
        <div>
            <Heart onClick={handleClick} />
        </div>
    );
}

export default Mirror;
