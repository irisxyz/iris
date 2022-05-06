import { useEffect } from "react";
import { useMutation } from "@apollo/client";
import { utils } from "ethers";
import { CREATE_MIRROR_TYPED_DATA } from "../utils/queries";
import omitDeep from "omit-deep";
import Retweet from "../assets/Retweet";
import Button from "./Button";

function Mirror({ wallet, lensHub, profileId, publicationId, stats }) {
    const [createMirrorTyped, createMirrorTypedData] = useMutation(CREATE_MIRROR_TYPED_DATA);

    const handleClick = async () => {
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
            console.log(createMirrorTypedData.data);

            const typedData = createMirrorTypedData.data.createMirrorTypedData.typedData;
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
            console.log("create mirror: tx hash", tx.hash);
        };

        handleCreate();
    }, [createMirrorTypedData.data]);

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px'}}>
            <Retweet onClick={handleClick} />
            <p>{ stats.totalAmountOfMirrors }</p>
        </div>
    );
}

export default Mirror;
