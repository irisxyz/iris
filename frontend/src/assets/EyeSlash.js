import styled from "styled-components";

const SVG = styled.svg`
    path {
        stroke: #747c90;
        stroke-width: 2.5px;
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
        <SVG {...props} width="24" height="24" viewBox="0 -2 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.25 4.375L22.75 23.625" stroke="#8247E5" stroke-linecap="round" strokeLinejoin="round"/>
            <path d="M16.9417 17.2377C16.1388 17.9732 15.0884 18.3793 13.9995 18.3752C13.1165 18.3751 12.2542 18.1078 11.5259 17.6085C10.7976 17.1091 10.2375 16.4011 9.91919 15.5774C9.60085 14.7538 9.5392 13.8531 9.74235 12.9937C9.94549 12.1344 10.4039 11.3566 11.0573 10.7627" stroke="#8247E5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.09375 7.50293C3.63125 9.75605 1.75 13.9998 1.75 13.9998C1.75 13.9998 5.25 21.8748 14 21.8748C16.0503 21.8915 18.0751 21.4191 19.9062 20.4967" stroke="#8247E5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22.816 18.4953C25.2004 16.3625 26.2504 14 26.2504 14C26.2504 14 22.7504 6.12503 14.0004 6.12503C13.2418 6.12353 12.4845 6.18573 11.7363 6.31096" stroke="#8247E5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14.8203 9.70154C15.7507 9.87782 16.5985 10.352 17.2358 11.0524C17.8731 11.7528 18.2653 12.6415 18.3531 13.5844" stroke="#8247E5" strokeLinecap="round" strokeLinejoin="round"/>
        </SVG>
    );
};

export default Icon;
