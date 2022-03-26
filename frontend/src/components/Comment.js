import { useEffect } from "react";
import { gql, useMutation } from "@apollo/client";
import { utils } from "ethers";
import { create } from "ipfs-http-client";
import { v4 as uuidv4 } from "uuid";
import omitDeep from "omit-deep";
import Button from "./Button";
import CommentIcon from "../assets/Comment";

const client = create("https://ipfs.infura.io:5001/api/v0");

const CREATE_COMMENT_TYPED_DATA = gql`
    mutation ($request: CreatePublicCommentRequest!) {
        createCommentTypedData(request: $request) {
            id
            expiresAt
            typedData {
                types {
                    CommentWithSig {
                        name
                        type
                    }
                }
                domain {
                    name
                    chainId
                    version
                    verifyingContract
                }
                value {
                    nonce
                    deadline
                    profileId
                    profileIdPointed
                    pubIdPointed
                    contentURI
                    collectModule
                    collectModuleData
                    referenceModule
                    referenceModuleData
                }
            }
        }
    }
`;

function Comment({ wallet, lensHub, profileId, publicationId }) {
    const [createCommentTyped, createCommentTypedData] = useMutation(CREATE_COMMENT_TYPED_DATA);

    const handleClick = async () => {
        const ipfsResult = await client.add(
            JSON.stringify({
                name: "post",
                description: "comment",
                content: "description",
                external_url: null,
                image: null,
                imageMimeType: null,
                version: "1.0.0",
                appId: "iris",
                attributes: [],
                media: [],
                metadata_id: uuidv4(),
            })
        );

        const commentRequest = {
            profileId: profileId,
            publicationId: publicationId,
            contentURI: "ipfs://" + ipfsResult.path,
            collectModule: {
                emptyCollectModule: true,
            },
            referenceModule: {
                followerOnlyReferenceModule: false,
            },
        };

        createCommentTyped({
            variables: {
                request: commentRequest,
            },
        });
    };

    useEffect(() => {
        if (!createCommentTypedData.error) return;

        console.log(createCommentTypedData.error);
    }, [createCommentTypedData.error]);

    useEffect(() => {
        if (!createCommentTypedData.data) return;

        const handleCreate = async () => {
            console.log(createCommentTypedData.data);

            const typedData = createCommentTypedData.data.createCommentTypedData.typedData;
            const { domain, types, value } = typedData;

            const signature = await wallet.signer._signTypedData(
                omitDeep(domain, "__typename"),
                omitDeep(types, "__typename"),
                omitDeep(value, "__typename")
            );

            const { v, r, s } = utils.splitSignature(signature);

            const tx = await lensHub.commentWithSig({
                profileId: typedData.value.profileId,
                contentURI: typedData.value.contentURI,
                profileIdPointed: typedData.value.profileIdPointed,
                pubIdPointed: typedData.value.pubIdPointed,
                collectModule: typedData.value.collectModule,
                collectModuleData: typedData.value.collectModuleData,
                referenceModule: typedData.value.referenceModule,
                referenceModuleData: typedData.value.referenceModuleData,
                sig: {
                    v,
                    r,
                    s,
                    deadline: typedData.value.deadline,
                },
            });
            console.log("create comment: tx hash", tx.hash);
        };

        handleCreate();
    }, [createCommentTypedData.data]);

    return (
        <div>
            <CommentIcon onClick={handleClick} />
        </div>
    );
}

export default Comment;
