import React, { useState, useEffect } from "react";
import styled from "styled-components";
import avatar from "../assets/avatar.png";

const Icon = styled.div`
    height: 60px;
    width: 60px;
    border: ${p=>p.theme.primary} 3px solid;
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
`

const Container = styled.div`
    display: flex;
    gap: 1em;
    margin-bottom: 1em;
`

const LIVE_OR_NAH = true;

const LiveLinks = () => {

    if (LIVE_OR_NAH) {

        return (
            <Container>
                <UserContainer>
                    <Icon/>
                    @lapierre
                </UserContainer>
                <UserContainer>
                <Icon/>
                    @player1
                </UserContainer>
            </Container>
        )
    }

    return <></>

}

export default LiveLinks