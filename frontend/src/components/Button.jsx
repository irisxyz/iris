import styled from "styled-components";

const Button = styled.button`
    border: none;
    border-radius: 6px;
    padding: 0.6em 2em;
    font-family: ${(p) => p.theme.font};
    font-weight: 500;
    color: ${(p) => p.theme.textLight};
    background: ${(p) => p.theme.primary};
    letter-spacing: 0.02em;
    transition: all 100ms;
    :hover {
        background: ${(p) => p.theme.primaryHover};
        cursor: pointer;
    }
    :focus {
        box-shadow: 0px 2px 2px -1px rgba(0, 0, 0, 0.12), 0px 0px 0px 3px #D25D38;
        outline: none;
    }
    :disabled {
        opacity: 35%;
        cursor: inherit;
    }
    :disabled:hover {
        background: ${(p) => p.theme.primary};
    }
`;


export const RoundedButton = styled(Button)`
    border-radius: 5em;
    padding: 0.6em 2em;
    color: black;
    background: ${(p) => p.theme.textLight};
    letter-spacing: 0.02em;
    transition: all 100ms;
    :hover {
        background: #ffe8e8;
    }
    :focus {
        box-shadow: 0px 2px 2px -1px rgba(0, 0, 0, 0.72), 0px 0px 0px 3px #D25D38;
        outline: none;
    }
`;

export const OutlineButton = styled(Button)`
    width: 9em;
    color: ${(p) => p.theme.primary};
    background: ${(p) => p.theme.textLight};
    outline: 2px solid ${(p) => p.theme.primary};
    outline-offset: -2px;
    :hover span {
        display: none;
    }
    :hover:before {
        color: ${(p) => p.theme.textLight};
        content: "Unfollow";
    }
`;

export default Button;
