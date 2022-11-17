import styled from "styled-components";

const SVG = styled.svg`
    path {
        stroke: #747c90;
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
            <path d="M21.75 10.75L27 16L21.75 21.25" stroke="#8247E5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 16H27" stroke="#8247E5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 27H6C5.73478 27 5.48043 26.8946 5.29289 26.7071C5.10536 26.5196 5 26.2652 5 26V6C5 5.73478 5.10536 5.48043 5.29289 5.29289C5.48043 5.10536 5.73478 5 6 5H13" stroke="#8247E5" strokeLinecap="round" strokeLinejoin="round"/>
        </SVG>
    );
};

export default Icon;
