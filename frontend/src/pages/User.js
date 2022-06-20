import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { useLazyQuery, useQuery } from "@apollo/client";
import { GET_PROFILES, GET_PUBLICATIONS, HAS_COLLECTED, DOES_FOLLOW } from "../utils/queries";
import { hexToDec } from "../utils";
import Follow from "../components/Follow";
import Unfollow from "../components/Unfollow";
import Post from "../components/Post";
import Card from "../components/Card";
import Livestream from "../components/Livestream";
import avatar from "../assets/avatar.png";
import rainbow from "../assets/rainbow.png";
import opensea from "../assets/opensea.svg";
import { useWallet } from "../utils/wallet";

const Icon = styled.div`
    height: 100px;
    width: 100px;
    border: #fff 4px solid;
    border-radius: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: url(${p => p.href || avatar});
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
    background: url(${p => p.href || avatar});
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
    background: url(${p => p.src || rainbow});
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

const Name = styled.h1`
    margin-bottom: 0;
`;

const Handle = styled.h3`
    font-weight: normal;
    margin: 0 0 1em 0;
`;

const Address = styled.code`
    box-shadow: 0px 3px 12px rgba(236, 176, 178, 0.8);
    border-radius: 100px;
    padding: 0.6em;
    background: white;
    margin: 4em 0;
`;

const UserInfo = styled.div`
    margin-bottom: 2em;
`;

const Opensea = styled.a`
    display: flex;
    align-items: center;
    gap: 1em;
    border-radius: 100px;
    box-shadow: 0px 3px 12px rgba(236, 176, 178, 0.2);
    transition: all 100ms ease-in-out;
    &:hover {
        box-shadow: 0px 3px 12px rgba(236, 176, 178, 1);
    }
`;

function User({ profileId }) {
    const { wallet } = useWallet()
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
                reactionRequest: profileId ? { profileId } : null,
            },
        });

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


    }, [data, profileId, getPublications]);

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

    return (
        <>
            <StyledCard>
                <Cover src={profile.coverPicture?.original?.url} />
                <CardContent>
                    <Icon href={profile.picture?.original?.url}/>
                    <Columns>
                        <div>
                            <UserInfo>
                                <Name>{profile.name || params.handle}</Name>
                                <Handle>@{params.handle}</Handle>
                                <Address>{profile?.address}</Address>
                                {/* <Opensea
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={`https://testnets.opensea.io/assets/mumbai/0x60ae865ee4c725cd04353b5aab364553f56cef82/${profile.decId}`}
                                >
                                    <img src={opensea} alt="Opensea" />
                                </Opensea> */}
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
                                <Unfollow profileId={profile.id} />
                            ) : (
                                <Follow profile={profile} profileId={profileId} />
                            )}
                        </div>
                    </Columns>
                </CardContent>
            </StyledCard>

            {publications.map((post) => {
                return <Post key={post.id} post={post} profileId={profileId} />;
            })}
        </>
    );
}

export default User;
