import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { GET_PROFILES, GET_PUBLICATIONS } from "../utils/queries";
import { hexToDec } from "../utils";
import Follow from "../components/Follow";
import Unfollow from "../components/Unfollow";
import Post from "../components/Post";
import Card from "../components/Card";
import avatar from "../assets/avatar.png";
import rainbow from "../assets/rainbow.png";
import opensea from "../assets/opensea.svg";

const HAS_COLLECTED = gql`
  query($request: HasCollectedRequest!) {
    hasCollected(request: $request) {
      walletAddress
      results {
        collected
        publicationId
        collectedTimes
      }
    }
  }
`;

const Icon = styled.div`
    height: 100px;
    width: 100px;
    border: #fff 4px solid;
    border-radius: 100px;
    &:hover {
        cursor: pointer;
    }
    display: flex;
    justify-content: center;
    align-items: center;
    background: url(${avatar});
    background-size: cover;
    margin-bottom: -0.8em;
`;

const StyledCard = styled(Card)`
    padding: 0;
    margin-bottom: 2em;
`;

const CardContent = styled.div`
    margin-top: -6em;
    padding: 2em;
`;

const Cover = styled.div`
    width: 100%;
    height: 200px;
    background: url(${rainbow});
    background-size: cover;
    border-radius: 16px 15px 0 0;
`;

const Stats = styled.div`
    width: 400px;
    display: flex;
    justify-content: space-between;
`;

const Columns = styled.div`
    display: flex;
    justify-content: space-between;
`;

const Handle = styled.h1`
    display: inline-block;
`;

const Address = styled.code`
    box-shadow: 0px 2px 7px rgba(112, 58, 202, 0.2);
    border-radius: 100px;
    padding: 0.6em;
    background: white;
`;

const UserInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 1em;
`;

const Opensea = styled.a`
    display: flex;
    align-items: center;
    gap: 1em;
    border-radius: 100px;
    box-shadow: 0px 2px 7px rgba(112, 58, 202, 0.2);
    transition: all 100ms ease-in-out;
    &:hover {
        box-shadow: 0px 2px 7px rgba(112, 58, 202, 1);
    }
`;

const DOES_FOLLOW = gql`
    query ($request: DoesFollowRequest!) {
        doesFollow(request: $request) {
            followerAddress
            profileId
            follows
        }
    }
`;

function User({ wallet, lensHub }) {
    let params = useParams();
    const [notFound, setNotFound] = useState(false);
    const [publications, setPublications] = useState([]);
    const [profile, setProfile] = useState("");
    const [following, setFollowing] = useState(false);
    const { data } = useQuery(GET_PROFILES, {
        variables: {
            request: {
                handles: [params.handle],
                limit: 1,
            },
        },
    });

    const followInfos = [
        {
            followerAddress: wallet.address,
            profileId: profile.id,
        },
    ];
    const doesFollow = useQuery(DOES_FOLLOW, {
        variables: {
            request: {
                followInfos,
            },
        },
    });

    const [hasCollected, hasCollectedData] = useLazyQuery(HAS_COLLECTED);
    const [getPublications, publicationsData] = useLazyQuery(GET_PUBLICATIONS);

    useEffect(() => {
        if (!data) return;

        if (data.profiles.items.length < 1) {
            setNotFound(true);
            return;
        }

        const ownedBy = data.profiles.items[0].ownedBy;
        const id = data.profiles.items[0].id;
        const decId = hexToDec(id.replace("0x", ""));

        setProfile({
            ...data.profiles.items[0],
            address: `${ownedBy.substring(0, 6)}...${ownedBy.substring(37, ownedBy.length - 1)}`,
            decId,
        });

        getPublications({
            variables: {
                request: {
                    profileId: data.profiles.items[0].id,
                    publicationTypes: ["POST", "COMMENT", "MIRROR"],
                },
            },
        });
    }, [data, getPublications]);

    useEffect(() => {
        if (!publicationsData.data) return;

        setPublications(publicationsData.data.publications.items);
        
        const publications = publicationsData.data.publications.items.map((thing) => {
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

    }, [publicationsData.data]);

    useEffect(() => {
        if (!hasCollectedData.data) return;

        const collectedIds = {}

        hasCollectedData.data.hasCollected[0].results.forEach((result) => {
            if(result.collected) {
                collectedIds[result.publicationId] = true
            }
        })

        console.log(collectedIds)

        const newPubs = publications.map((post) => {
            return {...post, collected: collectedIds[post.id]}
        })

        setPublications([...newPubs])

    }, [hasCollectedData.data]);

    useEffect(() => {
        if (!doesFollow.data) return;

        const handleCreate = async () => {
            setFollowing(doesFollow.data.doesFollow[0].follows);
        };

        handleCreate();
    }, [doesFollow.data]);

    if (notFound) {
        return (
            <>
                <h2>No user with handle {params.handle}!</h2>
            </>
        );
    }
    return (
        <>
            <StyledCard>
                <Cover />
                <CardContent>
                    <Icon />
                    <Columns>
                        <div>
                            <UserInfo>
                                <Handle>@{params.handle}</Handle>
                                <Address>{profile?.address}</Address>
                                <Opensea
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={`https://testnets.opensea.io/assets/mumbai/0xd7b3481de00995046c7850bce9a5196b7605c367/${profile.decId}`}
                                >
                                    <img src={opensea} alt="Opensea" />
                                </Opensea>
                            </UserInfo>
                            <Stats>
                                <p>{profile.stats?.totalFollowers} followers</p>
                                <p>{profile.stats?.totalFollowing} following</p>
                                <p>{profile.stats?.totalPublications} posts</p>
                                <p>{profile.stats?.totalCollects} collects</p>
                            </Stats>
                        </div>
                        <div>
                            {following ? (
                                <Unfollow wallet={wallet} profileId={profile.id} />
                            ) : (
                                <Follow wallet={wallet} lensHub={lensHub} profile={profile} />
                            )}
                        </div>
                    </Columns>
                </CardContent>
            </StyledCard>

            {publications.map((post) => {
                return <Post key={post.id} post={post} wallet={wallet} lensHub={lensHub} profileId={profile.id} />;
            })}
        </>
    );
}

export default User;
