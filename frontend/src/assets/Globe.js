import styled from "styled-components";

const SVG = styled.svg`
    path {
        stroke: #747c90;
        stroke-width: 2px;
        transition: all 100ms ease-in-out;
        ${(p) => p.filled && `stroke: #F28A56;`}
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
        <SVG width="25" height="25" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props} >
            <path d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z"strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4.6875 12H27.3125"strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4.6875 20H27.3125"strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 27.6749C18.7614 27.6749 21 22.4479 21 16C21 9.55203 18.7614 4.32495 16 4.32495C13.2386 4.32495 11 9.55203 11 16C11 22.4479 13.2386 27.6749 16 27.6749Z"strokeLinecap="round" strokeLinejoin="round"/>
       </SVG>
    );
};

export default Icon;
