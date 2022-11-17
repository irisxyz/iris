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
        <SVG width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path
                d="M22.0254 12.4625H28.0254V6.46252"
                stroke="#F28A56"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M8.22461 8.22505C9.2451 7.20307 10.4571 6.3923 11.7912 5.83913C13.1253 5.28595 14.5554 5.00122 15.9996 5.00122C17.4439 5.00122 18.8739 5.28595 20.208 5.83913C21.5422 6.3923 22.7541 7.20307 23.7746 8.22505L28.0246 12.4626"
                stroke="#F28A56"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M9.97461 19.5375H3.97461V25.5375"
                stroke="#F28A56"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M23.7746 23.775C22.7541 24.797 21.5422 25.6077 20.208 26.1609C18.8739 26.7141 17.4439 26.9988 15.9996 26.9988C14.5554 26.9988 13.1253 26.7141 11.7912 26.1609C10.4571 25.6077 9.2451 24.797 8.22461 23.775L3.97461 19.5375"
                stroke="#F28A56"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </SVG>
    );
};

export default Icon;
