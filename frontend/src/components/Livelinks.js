import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import avatar from "../assets/avatar.png";
import { useLazyQuery, useQuery } from "@apollo/client";
import { Wallet } from "ethers";
import { GET_FOLLOWING } from "../utils/queries";

const Icon = styled.div`
    height: 60px;
    width: 60px;
    border: ${p => p.theme.primary} 3px solid;
    border-radius: 100px;
    &:hover {
        cursor: pointer;
        box-shadow: 0px 4px 12px rgba(112, 58, 202, 0.5);
    }
    transition: all 100ms ease-in-out;
    background: url(${avatar});
    background-size: cover;
    margin-bottom: -0.8em;
`;

const UserContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1em;
    font-weight: 500;
    &:hover {
        div {
            cursor: pointer;
            box-shadow: 0px 4px 12px rgba(112, 58, 202, 0.5);
        }
    }
`

const Text = styled(Link)`
    text-decoration: none;
    underline: none;
    color: black;

`

const Container = styled.div`
    display: flex;
    gap: 1em;
    margin-bottom: 1em;
`

const LIVE_OR_NAH = true;





function LiveLinks({ wallet }) {

    const { data } = useQuery(GET_FOLLOWING, {
        variables: {
            request: {
                address: wallet.address,
                limit: 10,
            },
        },
    });

    const [activeFollowersLive, setActiveFollowersLive] = useState([]);


    useEffect(() => {
        if (!data) return;
        console.log("Data from GET FOLLOWING", data.following.items)

        const walletAndHandleList = data.following.items.map((item) => {
            console.log("GET FOLLOWING item frick", item)

            const walletAndHandle = `${item.profile.ownedBy},${item.profile.handle}`


            return walletAndHandle
        })

        //   // Remove duplicates from owned by list
        //   const uniqueOwnedByListAndHandle = [...new Set(ownedByListAndHandle)]


        // console.log("GET FOLLOWING uniqueOwnedByList", uniqueOwnedByListAndHandle)
        console.log("GET FOLLOWING walletAndHandleList", walletAndHandleList)


        const getUsersWithActiveLivestream = async () => {

            try {
                const response = await fetch("https://livepeer.com/api/stream?streamsonly=1&filters=[{id: isActive, value: true}]",
                    {
                        headers: {
                            // TODO: Remove API KEY in the future
                            "authorization": "Bearer fe3ed427-ab88-415e-b691-8fba9e7e6fb0"
                        }
                    },
                );
                const responseData = await response.json();
    
                let livestreamers = []
    
                responseData.map((streamInfo) => {
                    if (streamInfo.isActive & walletAndHandleList.includes(streamInfo.name)) {
                        console.log("GET FOLLOWING IT IS ACTIVE BRUHH")
                        // console.log(streamInfo)
                        console.log("GET FOLLOWING STERAM INFO", streamInfo)
                        streamInfo["handle"] = streamInfo.name.split(",")[1]
                        streamInfo["ownedBy"] = streamInfo.name.split(",")[0]
    
                        livestreamers.push(streamInfo)
                    }
                })
    
                setActiveFollowersLive(livestreamers)
    
                console.log("GET FOLLOWING activeFollowersLive", activeFollowersLive)

            } catch (err) {
                console.log(err)
            }



        }
        getUsersWithActiveLivestream()

    }, [data])

    if (LIVE_OR_NAH) {

        return (
            <Container>
                {activeFollowersLive.map((streamInfo) => {

                    return <Text to={`user/${streamInfo.handle}`}>
                        <UserContainer>
                            <Icon />
                            <p>@{streamInfo.handle}</p>
                        </UserContainer>
                    </Text>
                })}
            </Container>
        )
    }

    return <></>

}

export default LiveLinks