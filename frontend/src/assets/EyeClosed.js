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
            <path d="M25.1377 15.9125L28.0002 20.85" stroke="#8247E5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19.2754 18.6625L20.1629 23.7" stroke="#8247E5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12.7127 18.65L11.8252 23.7" stroke="#8247E5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.8498 15.9125L3.9873 20.875" stroke="#8247E5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 13.1125C6.1 15.7125 9.95 19 16 19C22.05 19 25.9 15.7125 28 13.1125" stroke="#8247E5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </SVG>
    );
};

export default Icon;
