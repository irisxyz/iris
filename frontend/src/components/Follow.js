import { useEffect } from "react";
import { gql, useMutation } from "@apollo/client";
import { utils } from "ethers";
import omitDeep from "omit-deep";
import Button from "./Button";

const CREATE_FOLLOW_TYPED_DATA = gql`
    mutation ($request: FollowRequest!) {
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
`;

function Follow({ wallet, lensHub, profileId }) {
    const [createFollowTyped, createFollowTypedData] = useMutation(CREATE_FOLLOW_TYPED_DATA);

    const followRequest = [
        {
            profile: profileId,
        },
    ];

    const handleClick = async () => {
        createFollowTyped({
            variables: {
                request: {
                    follow: followRequest,
                },
            },
        });
    };

    useEffect(() => {
        if (!createFollowTypedData.data) return;

        const handleCreate = async () => {
            console.log(createFollowTypedData.data);

            const typedData = createFollowTypedData.data.createFollowTypedData.typedData;
            const { domain, types, value } = typedData;

            const signature = await wallet.signer._signTypedData(
                omitDeep(domain, "__typename"),
                omitDeep(types, "__typename"),
                omitDeep(value, "__typename")
            );

            const { v, r, s } = utils.splitSignature(signature);

            const tx = await lensHub.followWithSig({
                follower: wallet.address,
                profileIds: typedData.value.profileIds,
                datas: typedData.value.datas,
                sig: {
                    v,
                    r,
                    s,
                    deadline: typedData.value.deadline,
                },
            });

            console.log("Following:", tx.hash);
        };

        handleCreate();
    }, [createFollowTypedData.data]);

    return (
        <div>
            <Button onClick={handleClick}>Follow profile</Button>
        </div>
    );
}

export default Follow;
