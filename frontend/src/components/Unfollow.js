import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { utils, ethers } from "ethers";
import { LENS_FOLLOW_NFT_ABI } from "../config.ts";
import { CREATE_UNFOLLOW_TYPED_DATA } from "../utils/queries";
import omitDeep from "omit-deep";
import { FollowButton } from '../components/Button';
import { useWallet } from "../utils/wallet";

function Follow({ profileId }) {
    const { wallet } = useWallet()
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
            <FollowButton onClick={handleClick}>
                <span>Following</span>
            </FollowButton>
        </div>
    );
}

export default Follow;
