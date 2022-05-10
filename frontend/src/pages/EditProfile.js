import { useState, useEffect, createRef } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { CREATE_PROFILE, MODULE_APPROVAL_DATA } from "../utils/queries";
import Card from "../components/Card";
import Button from "../components/Button";
import avatar from "../assets/avatar.png";
import rainbow from "../assets/rainbow.png";

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
`;

const Handle = styled.input`
    border: none;
    font-size: 2em;
    outline: none;
    font-family: ${(p) => p.theme.font};
    font-weight: 600;
`;

const Bio = styled.textarea`
    margin: auto;
    border: none;
    font-size: 1em;
    outline: none;
    width: 270px;
    font-family: ${(p) => p.theme.font};
    resize: none; /*remove the resize handle on the bottom right*/
    border: #e2e4e8 1px solid;
    border-radius: 6px;
    margin-top: 1em;
`;

const Cost = styled.input`
    border: none;
    font-size: 1em;
    outline: none;
    font-family: ${(p) => p.theme.font};
    font-weight: 600;
    width: 270px;
`;

const StyledCard = styled(Card)`
    padding: 0;
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

function EditProfile({ profile = {}, wallet }) {


    return (
        <StyledCard>
            <Cover />
            <CardContent>
                <Icon />
                {/* <Handle ref={handleRef} onChange={handleHandle} placeholder={"@handle"} /> */}
                {/* <Bio ref={bioRef} placeholder={'bio'}/> */}
                <br />
                <br />
                {/* <Button onClick={handleCreate}>Save</Button> */}
            </CardContent>
        </StyledCard>
    );
}

export default EditProfile;