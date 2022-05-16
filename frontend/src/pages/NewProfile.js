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

function NewProfile({ profile = {}, wallet }) {
    const [newProfile, setNewProfile] = useState({ ...profile });
    const [createProfile, createProfileData] = useMutation(CREATE_PROFILE);
    const handleRef = createRef();
    // const costRef = createRef();

    // const bioRef = createRef()

    const handleCreate = async () => {
        const handle = handleRef.current.value.replace("@", "");
        if (!handle) {
            console.log("no handle");
            return;
        }
        // const cost = costRef.current.value;
        // if (!cost) {
        //     console.log("no cost");
        //     return;
        // }

        const profileRequest = {
            handle: handle,
        };

        // const bio = bioRef.current.value
        createProfile({
            variables: {
                request: profileRequest,
            },
        });
    };

    useEffect(() => {
        if (!createProfileData.data) return;

        console.log(createProfileData.data);
    }, [createProfileData.data]);

    // const moduleApprovalRequest = {
    //     currency: "0x9c3c9283d3e44854697cd22d3faa240cfb032889",
    //     value: "1",
    //     followModule: "FeeFollowModule",
    // };

    // const approveModule = useQuery(MODULE_APPROVAL_DATA, {
    //     variables: {
    //         request: moduleApprovalRequest,
    //     },
    // });

    // useEffect(() => {
    //     if (!approveModule.data) return;

    //     const handleCreate = async () => {
    //         console.log(approveModule.data);

    //         const generateModuleCurrencyApprovalData = approveModule.data.generateModuleCurrencyApprovalData;

    //         const tx = await wallet.signer.sendTransaction({
    //             to: generateModuleCurrencyApprovalData.to,
    //             from: generateModuleCurrencyApprovalData.from,
    //             data: generateModuleCurrencyApprovalData.data,
    //         });
    //         console.log(tx.hash);
    //     };

    //     handleCreate();
    // }, [approveModule.data]);

    const handleHandle = (e) => {
        if (e.target.value[0] !== "@") {
            e.target.value = "@" + e.target.value;
        }
        if (e.target.value.length === 1) {
            e.target.value = "";
        }
    };

    return (
        <StyledCard>
            <Cover />
            <CardContent>
                <Icon />
                <Handle ref={handleRef} onChange={handleHandle} placeholder={"@handle"} />
                {/* <Bio ref={bioRef} placeholder={'bio'}/> */}
                {/* <Cost ref={costRef} placeholder={"Subscription Cost (MATIC)"} /> */}
                <br />
                <br />
                <Button onClick={handleCreate}>Create Profile</Button>
            </CardContent>
        </StyledCard>
    );
}

export default NewProfile;