import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { create } from "ipfs-http-client";
import LitJsSdk from "lit-js-sdk";
import Card from "../components/Card";
import { UserIcon } from "../components/Wallet";
import Share from "../assets/Share";
import Comment from "./Comment";
import Mirror from "./Mirror";
import Collect from "./Collect";

const client = create("https://ipfs.infura.io:5001/api/v0");

export const StyledLink = styled(Link)`
    text-decoration: none;
    font-weight: 600;
    color: black;
    transition: all 50ms ease-in-out;
    border-bottom: 1px solid transparent;
    &:hover {
        border-bottom: 2px solid ${(p) => p.theme.primary};
        color: ${(p) => p.theme.primary};
    }
`;

const Icon = styled(UserIcon)`
    display: inline-block;
    width: 3em;
    height: 3em;
`;

const Container = styled.div`
    position: relative;
    display: flex;
    gap: 10px;
`;

const Actions = styled.div`
    margin-top: 1em;
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    width: 400px;
`;

const Content = styled.div`
    padding-top: 4px;
`;

const Premium = styled.div`
    right: 0;
    position: absolute;
    background: #ece8ff;
    border-radius: 100px;
    padding: 0.2em 1em;
    font-weight: 500;
    color: #220d6d;
`;

const StyledCard = styled(Card)`
    margin-bottom: 1em;
`;

const chain = "mumbai";

function Post({ post, wallet, lensHub, profileId }) {
    const [decryptedMsg, setDecryptedMsg] = useState("");

    useEffect(() => {

        const decode = async () => {
            await new Promise(r => setTimeout(r, 500));
            
            if (post.metadata.description === "litcoded}") {
                const encryptedPost = JSON.parse(post.metadata.content.replace("litcoded: ", ""));
    
                const accessControlConditions = [
                    {
                        contractAddress: encryptedPost.contract,
                        standardContractType: "ERC721",
                        chain,
                        method: "balanceOf",
                        parameters: [":userAddress"],
                        returnValueTest: {
                            comparator: ">",
                            value: "0",
                        },
                    },
                ];
    
                const isthisblob = client.cat(encryptedPost.blobPath);
                let newEcnrypt;
                (async () => {
                    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });
    
                    for await (const chunk of isthisblob) {
                        newEcnrypt = new Blob([chunk], {
                            type: "encryptedString.type", // or whatever your Content-Type is
                        });
                    }
                    const key = await window.litNodeClient.getEncryptionKey({
                        accessControlConditions,
                        // Note, below we convert the encryptedSymmetricKey from a UInt8Array to a hex string.  This is because we obtained the encryptedSymmetricKey from "saveEncryptionKey" which returns a UInt8Array.  But the getEncryptionKey method expects a hex string.
                        toDecrypt: encryptedPost.key,
                        chain,
                        authSig,
                    });
    
                    const decryptedString = await LitJsSdk.decryptString(newEcnrypt, key);
    
                    setDecryptedMsg(decryptedString);
                })();
            }

        }

        decode()
    }, []);

    return (
        <StyledCard>
            <Container>
                <Link to={`/user/${post.profile.handle}`}>
                    <Icon link={true} />
                </Link>
                <Content>
                    {post.metadata.description === "litcoded}" && <Premium>Followers Only</Premium>}
                    <StyledLink to={`/user/${post.profile.handle}`}>
                        <b>@{post.profile.handle}</b>
                    </StyledLink>
                    {/* {post.metadata.media} */}
                    {post.metadata.description === "litcoded}" ? <p>{decryptedMsg ? decryptedMsg : <code>Message for followers only</code>}</p> : <p>{post.metadata.content} </p>}
                    {post.metadata.media.length ? <video width="500px" controls>
                        <source src={`https://ipfs.io/ipfs/${post.metadata.media[0].original.url.replace("ipfs://", "")}`} type="video/mp4" />

                    </video> : <p></p>}

                    <Actions>
                        <Comment wallet={wallet} lensHub={lensHub} profileId={profileId} publicationId={post.id} stats={post.stats} />
                        <Mirror wallet={wallet} lensHub={lensHub} profileId={profileId} publicationId={post.id} stats={post.stats} />
                        <Collect wallet={wallet} lensHub={lensHub} profileId={profileId} publicationId={post.id} stats={post.stats} collected={post.collected} />
                        <Share />
                    </Actions>
                </Content>
            </Container>
        </StyledCard>
    );
}

export default Post;
