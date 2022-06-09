import React, { useState, useEffect } from "react";
import { useLazyQuery, useQuery } from "@apollo/client";
import styled from "styled-components";
import { GET_TIMELINE, EXPLORE_PUBLICATIONS, HAS_COLLECTED } from "../utils/queries";
import Post from "../components/Post";

const Main = styled.main``;

function Feed({ profile = {}, wallet, lensHub, isExplore }) {
    const [publications, setPublications] = useState([]);

    const [getTimeline, timelineData] = useLazyQuery(GET_TIMELINE);
    const [explorePublications, explorePublicationsData] = useLazyQuery(EXPLORE_PUBLICATIONS);
    const [hasCollected, hasCollectedData] = useLazyQuery(HAS_COLLECTED);

    useEffect(() => {
        if (!profile.id) {
            if (publications.length > 0) return;
            explorePublications({
                variables: {
                    request: {
                        sortCriteria: 'TOP_COLLECTED',
                        limit: 10,
                    },
                },
            })
            return
        };

        if (isExplore) return;
        getTimeline({
            variables: {
                request: {
                    profileId: profile.id,
                },
            },
        })
    }, [getTimeline, profile])

    useEffect(() => {
        if (!timelineData.data) return;

        if (timelineData.data.timeline.items.length < 1) {
            return;
        }

        // console.log('timeline loaded')

        const pubIds = {}
        const pubs = []

        timelineData.data.timeline.items.forEach((post) => {
            if (pubIds[post.id]) return;
            else {
                pubIds[post.id] = true
                pubs.push(post)
            }
        })

        setPublications(pubs);

        const publications = timelineData.data.timeline.items.map((thing) => {
            return thing.id
        })

        hasCollected({
            variables: {
                request: {
                    collectRequests: [
                        {
                          walletAddress: wallet.address,
                          publicationIds: publications,
                        },
                    ],
                },
            },
        })
    }, [timelineData.data]);

    useEffect(() => {
        if (profile.id && !isExplore) return;
        if (!explorePublicationsData.data) return;

        if (publications.length > 0) return;

        if (explorePublicationsData.data.explorePublications.items.length < 1) {
            return;
        }

        setPublications(explorePublicationsData.data.explorePublications.items);
    }, [explorePublicationsData.data]);

    useEffect(() => {
        if (!hasCollectedData.data) return;

        const collectedIds = {}

        hasCollectedData.data.hasCollected[0].results.forEach((result) => {
            if(result.collected) {
                collectedIds[result.publicationId] = true
            }
        })

        const newPubs = publications.map((post) => {
            return {...post, collected: collectedIds[post.id]}
        })

        setPublications([...newPubs])

    }, [hasCollectedData.data]);

    return (
        <Main>
            {!profile.id && <h3>Popular Posts</h3>}
            {publications.map((post) => {
                return <Post key={post.id} post={post} wallet={wallet} lensHub={lensHub} profileId={profile.id} />;
            })}
        </Main>
    );
}

export default Feed;
