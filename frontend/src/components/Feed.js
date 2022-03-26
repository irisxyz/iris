import React, { useState, useEffect } from "react";
import { useLazyQuery, useQuery } from "@apollo/client";
import styled from "styled-components";
import { GET_TIMELINE, SEARCH } from "../utils/queries";
import Card from "../components/Card";
import Post from "../components/Post";

const Main = styled.main``;

function Feed({ profile = {}, wallet, lensHub }) {
    const [notFound, setNotFound] = useState(false);
    const [publications, setPublications] = useState([]);
    const { loading, error, data } = useQuery(GET_TIMELINE, {
        variables: {
            request: {
                profileId: profile.id,
            },
        },
    });

    useEffect(() => {
        if (!data) return;

        if (data.timeline.items.length < 1) {
            setNotFound(true);
            return;
        }

        setPublications(data.timeline.items);
    }, [data]);

    const searchData = useQuery(SEARCH, {
        variables: {
            request: {
                query: "LFG",
                type: "PUBLICATION",
            },
        },
    });

    useEffect(() => {
        if (!searchData.data) return;
        if (publications.length > 0) return;

        if (searchData.data.search.items.length < 1) {
            return;
        }

        setPublications(searchData.data.search.items);
    }, [searchData.data]);

    // if (notFound) {
    //   return <>
    //     <h3>No posts, go follow some profiles!</h3>
    //   </>
    // }

    return (
        <Main>
            {notFound && (
                <>
                    <h3>You don't follow anyone. Here are some posts #LFG</h3>
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
