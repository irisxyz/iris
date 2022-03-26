import { useEffect } from "react";
import { gql, useQuery } from "@apollo/client";

const DOES_FOLLOW = gql`
    query ($request: DoesFollowRequest!) {
        doesFollow(request: $request) {
            followerAddress
            profileId
            follows
        }
    }
`;

function DoesFollow({ wallet, profileId }) {
    const doesFollow = useQuery(DOES_FOLLOW, {
        variables: {
            request: {
                followInfos,
            },
        },
    });

    const followInfos = [
        {
            followerAddress: wallet.address,
            profileId: profileId,
        },
    ];

    useEffect(() => {
        if (!doesFollow.data) return;

        const handleCreate = async () => {
            console.log(doesFollow.data.doesFollow);
        };

        handleCreate();
    }, [doesFollow.data]);

    console.log(doesFollow.data.doesFollow);
    return doesFollow.data.doesFollow[0].follows;
}

export default DoesFollow;
