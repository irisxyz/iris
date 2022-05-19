import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import styled from "styled-components";
import { GET_TIMELINE, SEARCH, HAS_COLLECTED } from "../utils/queries";
import Post from "../components/Post";

const Main = styled.main``;

function Feed({ profile = {}, wallet, lensHub }) {
    const [notFound, setNotFound] = useState(false);
    const [publications, setPublications] = useState([]);

    const [getTimeline, timelineData] = useLazyQuery(GET_TIMELINE);

    useEffect(() => {
        if (!profile.id) return;

        getTimeline({
            variables: {
                request: {
                    profileId: profile.id,
                },
            },
        })
    }, [getTimeline, profile])

    const [hasCollected, hasCollectedData] = useLazyQuery(HAS_COLLECTED);

    useEffect(() => {
        if (!timelineData.data) return;

        if (timelineData.data.timeline.items.length < 1) {
            setNotFound(true);
            return;
        }

        console.log('timeline loaded')

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

    // const searchData = useQuery(SEARCH, {
    //     variables: {
    //         request: {
    //             query: "LFG",
    //             type: "PUBLICATION",
    //         },
    //     },
    // });

    // useEffect(() => {
    //     if (!searchData.data) return;
    //     if (publications.length > 0) return;

    //     if (searchData.data.search.items.length < 1) {
    //         return;
    //     }

    //     setPublications(searchData.data.search.items);
    // }, [searchData.data]);

    // if (notFound) {
    //   return <>
    //     <h3>No posts, go follow some profiles!</h3>
    //   </>
    // }

    return (
        <Main>
            {notFound && (
                <>
                    <h3>You don't follow anyone yet. Follow and come back here to view your feed!</h3>
                    <br />
                </>
            )}
            {publications.map((post) => {
                return <Post key={post.id} post={post} wallet={wallet} lensHub={lensHub} profileId={profile.id} />;
            })}
        </Main>
    );
}

export default Feed;
