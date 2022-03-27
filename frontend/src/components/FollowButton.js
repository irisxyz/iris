import styled from "styled-components";
import Button from "./Button";

const FollowButton = styled(Button)`
    width: 9em;
    :hover span {
        display: none;
    }
    :hover:before {
        content: "Unfollow";
    }
`;

export default FollowButton;
