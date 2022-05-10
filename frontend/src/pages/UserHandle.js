import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { useLazyQuery, useQuery } from "@apollo/client";
import { GET_PROFILES, GET_PUBLICATIONS, HAS_COLLECTED, DOES_FOLLOW } from "../utils/queries";
import { hexToDec } from "../utils";
import { Link } from 'react-router-dom'
import Button from "../components/Button";
import Follow from "../components/Follow";
import Unfollow from "../components/Unfollow";
import Post from "../components/Post";
import Card from "../components/Card";
import Livestream from "../components/Livestream";
import avatar from "../assets/avatar.png";
import rainbow from "../assets/rainbow.png";
import opensea from "../assets/opensea.svg";

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

const LiveIcon = styled.div`
    height: 50px;
    width: 50px;
    border: ${p => p.theme.primary} 4px solid;
    border-radius: 100px;
    &:hover {
        cursor: pointer;
    }
    background: url(${avatar});
    background-size: cover;
    margin-bottom: -0.6em;
`;

const StyledCard = styled(Card)`
    padding: 0;
    margin-bottom: 2em;
`;

const CardContent = styled.div`
    margin-top: -6em;
    padding: 2em;
`;

const LiveCardContent = styled.div`
    padding: 2em;
`;

const Live = styled.span`
    position: absolute;
    margin-top: 60px;
    margin-left: 13px;
    background: red;
    color: white;
    font-weight: 500;
    font-size: 12px;
    border-radius: 6px;
    padding: 0.1em 0.4em;
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
    margin-bottom: 1em;
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

const StyledLink = styled(Link)`
  text-decoration: none;
  color: black;
  transition: all 50ms ease-in-out;
`

function User({ wallet, lensHub }) {
    let params = useParams();
    const [notFound, setNotFound] = useState(false);
    const [publications, setPublications] = useState([]);
    const [profile, setProfile] = useState("");
    const [following, setFollowing] = useState(false);

    const [streamInfo, setStreamInfo] = useState({});

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
        const handle = data.profiles.items[0].handle;
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
        
        console.log("profile:", profile)

        // const isUserLivestreaming = async () => {

        //     const response = await fetch("https://livepeer.com/api/stream?streamsonly=1&filters=[{id: isActive, value: true}]",
        //         {
        //             headers: {
        //                 // TODO: Remove API KEY in the future
        //                 "authorization": "Bearer fe3ed427-ab88-415e-b691-8fba9e7e6fb0"
        //             }
        //         },
        //     );
        //     const responseData = await response.json();

        //     responseData.map((streamInfo) => {
        //         if (streamInfo.isActive & streamInfo.name === `${ownedBy},${handle}`) {
        //             setStreamInfo(streamInfo)
        //         }
        //     })

        // }

        // isUserLivestreaming()


    }, [data, getPublications]);

    useEffect(() => {
        if (!publicationsData.data) return;

        setPublications(publicationsData.data.publications.items);

        const publications = publicationsData.data.publications.items.map((thing) => {
            return thing.id;
        });

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
        });
    }, [publicationsData.data]);

    useEffect(() => {
        if (!hasCollectedData.data) return;

        const collectedIds = {};

        hasCollectedData.data.hasCollected[0].results.forEach((result) => {
            if (result.collected) {
                collectedIds[result.publicationId] = true;
            }
        });

        console.log(collectedIds);

        const newPubs = publications.map((post) => {
            return { ...post, collected: collectedIds[post.id] };
        });

        setPublications([...newPubs]);
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

    if (streamInfo.playbackId) {
        return (
            <>
                <StyledCard>
                    <LiveCardContent>
                        <Livestream playbackId={streamInfo.playbackId} />
                        <Columns>
                            <div>
                                <UserInfo>
                                    <LiveIcon />
                                    <Live>Live</Live>
                                    <Handle>@{params.handle}</Handle>
                                    <Address>{profile?.address}</Address>
                                    <Opensea
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={`https://testnets.opensea.io/${profile?.ownedBy}`}
                                    >
                                        <img src={opensea} alt="Opensea" />
                                    </Opensea>
                                    <div>
                                        {following ? (
                                            <Unfollow wallet={wallet} profile={profile} />
                                        ) : (
                                            <Follow wallet={wallet} lensHub={lensHub} profile={profile} />
                                        )}
                                    </div>
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
                            <div>
                                <StyledLink to='edit-profile'>
                                    <Button>Edit Profile</Button>
                                </StyledLink>
                            </div>
                        </Columns>
                    </LiveCardContent>
                </StyledCard>

                {publications.map((post) => {
                    return <Post key={post.id} post={post} wallet={wallet} lensHub={lensHub} profileId={profile.id} />;
                })}
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
                                    href={`https://testnets.opensea.io/${profile?.ownedBy}`}
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
                        <div>
                            <StyledLink to='edit-profile'>
                                <Button>Edit Profile</Button>
                            </StyledLink>
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
