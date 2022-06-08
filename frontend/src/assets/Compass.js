import styled from "styled-components";

const SVG = styled.svg`
    path {
        stroke: #F28A56;
        stroke-width: 3px;
        transition: all 100ms ease-in-out;
    }
    transition: all 100ms ease-in-out;
    &:hover {
        cursor: pointer;
        path {
            stroke: #F28A56;
        }
    }
    ${(p) => p.filled && `stroke: #F28A56;`}
`;

const Icon = ({ ...props }) => {
    return (
        <SVG {...props} width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z"
                stroke="#F28A56"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M18.1248 18.125L20.9248 11.0625L13.8748 13.875L11.0498 20.95L18.1248 18.125Z"
                stroke="#F28A56"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </SVG>
    );
};

export default Icon;
