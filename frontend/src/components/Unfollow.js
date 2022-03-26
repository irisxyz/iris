import { useEffect } from "react";
import { gql, useMutation } from "@apollo/client";
import { utils, ethers } from "ethers";
import { LENS_FOLLOW_NFT_ABI } from "../config.ts";
import omitDeep from "omit-deep";
import Button from "./Button";

const CREATE_UNFOLLOW_TYPED_DATA = gql`
    mutation ($request: UnfollowRequest!) {
        createUnfollowTypedData(request: $request) {
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
                    BurnWithSig {
                        name
                        type
                    }
                }
                value {
                    nonce
                    deadline
                    tokenId
                }
            }
        }
    }
`;

function Follow({ wallet, profileId }) {
    const [createUnfollowTyped, createUnfollowTypedData] = useMutation(CREATE_UNFOLLOW_TYPED_DATA);

    const unfollowRequest = {
        profile: profileId,
    };

    const handleClick = async () => {
        createUnfollowTyped({
            variables: {
                request: unfollowRequest,
            },
        });
    };

    useEffect(() => {
        if (!createUnfollowTypedData.data) return;

        const handleCreate = async () => {
            console.log(createUnfollowTypedData.data);

            const typedData = createUnfollowTypedData.data.createUnfollowTypedData.typedData;
            const { domain, types, value } = typedData;

            const signature = await wallet.signer._signTypedData(
                omitDeep(domain, "__typename"),
                omitDeep(types, "__typename"),
                omitDeep(value, "__typename")
            );

            const { v, r, s } = utils.splitSignature(signature);

            // load up the follower nft contract
            const followNftContract = new ethers.Contract(
                typedData.domain.verifyingContract,
                LENS_FOLLOW_NFT_ABI,
                wallet.signer
            );

            const sig = {
                v,
                r,
                s,
                deadline: typedData.value.deadline,
            };

            const tx = await followNftContract.burnWithSig(typedData.value.tokenId, sig);
            console.log("Unfollowed:", tx.hash);
        };

        handleCreate();
    }, [createUnfollowTypedData.data]);

    return (
        <div>
            <Button onClick={handleClick}>Unfollow profile</Button>
        </div>
    );
}

export default Follow;
