import styled from "styled-components";

const SVG = styled.svg`
    path {
        stroke: #747c90;
        ${(p) => p.filled && `stroke: #F28A56;`}
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
        <SVG {...props} width="25" height="25" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M11 20C14.5899 20 17.5 17.0899 17.5 13.5C17.5 9.91015 14.5899 7 11 7C7.41015 7 4.5 9.91015 4.5 13.5C4.5 17.0899 7.41015 20 11 20Z"
                stroke="#8247E5"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"/>
            <path
                d="M19.4248 7.2375C19.9994 7.08166 20.592 7.00181 21.1873 7C22.9112 7 24.5645 7.68482 25.7835 8.90381C27.0025 10.1228 27.6873 11.7761 27.6873 13.5C27.6873 15.2239 27.0025 16.8772 25.7835 18.0962C24.5645 19.3152 22.9112 20 21.1873 20"
                stroke="#8247E5"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"/>
            <path
                d="M2 24.675C3.01493 23.2307 4.36255 22.0519 5.92901 21.2381C7.49547 20.4243 9.23477 19.9995 11 19.9995C12.7652 19.9995 14.5045 20.4243 16.071 21.2381C17.6375 22.0519 18.9851 23.2307 20 24.675"
                stroke="#8247E5"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"/>
            <path
                d="M21.1875 20C22.9529 19.9989 24.6925 20.4232 26.2592 21.237C27.8258 22.0508 29.1733 23.2301 30.1875 24.675"
                stroke="#8247E5"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"/>
        </SVG>
    );
};

export default Icon;

