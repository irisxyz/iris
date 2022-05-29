import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useLazyQuery, useQuery } from '@apollo/client'
import { GET_PROFILES, GET_PUBLICATION, HAS_COLLECTED } from '../utils/queries'
import PostComponent from '../components/Post'

function Post({ wallet, lensHub, profileId }) {
    let params = useParams();
    const [publication, setPublication] = useState({})
    const [profile, setProfile] = useState('')

    const { data } = useQuery(GET_PROFILES, {
        variables: {
            request: {
                handles: [params.handle],
                limit: 1,
            },
        },
    })

    const [hasCollected, hasCollectedData] = useLazyQuery(HAS_COLLECTED)
    const [getPublication, publicationData] = useLazyQuery(GET_PUBLICATION)

    useEffect(() => {

        // const ownedBy = data.profiles.items[0].ownedBy;
        // const handle = data.profiles.items[0].handle;
        // const id = data.profiles.items[0].id;
        // const decId = hexToDec(id.replace('0x', ''));

        // setProfile({
        //     ...data.profiles.items[0],
        //     address: `${ownedBy.substring(0, 6)}...${ownedBy.substring(37, ownedBy.length - 1)}`,
        //     decId,
        // });

        getPublication({
            variables: {
                request: {
                    publicationId: params.postId,
                },
            },
        });

    }, [data, getPublication])

    useEffect(() => {
        if (!publicationData.data) return;

        setPublication(publicationData.data.publication)

        hasCollected({
            variables: {
                request: {
                    collectRequests: [
                        {
                            walletAddress: wallet.address,
                            publicationIds: [publicationData.data.publication.id],
                        },
                    ],
                },
            },
        });
    }, [publicationData.data])

    useEffect(() => {
        if (!hasCollectedData.data) return;

        const collectedIds = {};

        hasCollectedData.data.hasCollected[0].results.forEach((result) => {
            if (result.collected) {
                collectedIds[result.publicationId] = true;
            }
        });

        const newPub = { ...publication, collected: collectedIds[publication.id] }

        setPublication(newPub)

    }, [hasCollectedData.data])

    return (
        <>
            {publication.metadata && <PostComponent post={publication} wallet={wallet} lensHub={lensHub} profileId={profileId} />}
        </>
    );
}

export default Post
