import styled from "styled-components";

const Path = styled.path`
    stroke: #747c90;
    stroke-width: 3px;
    transition: all 100ms ease-in-out;
    &:hover {
        stroke: #F28A56;
        cursor: pointer;
    }
    ${(p) => p.filled && `stroke: #F28A56;`}
`;

const Icon = ({ filled, ...props }) => {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 32 32"
            fill={filled ? "#F28A56" : "#ffffff00"}
            xmlns="http://www.w3.org/2000/svg"
        >
        <Path
            filled={filled}
            {...props}
            d="M23 4H9C8.46957 4 7.96086 4.21071 7.58579 4.58579C7.21071 4.96086 7 5.46957 7 6V28C7.00096 28.178 7.04884 28.3527 7.13882 28.5063C7.22879 28.6599 7.35769 28.7871 7.5125 28.875C7.66081 28.9597 7.82922 29.0029 8 29C8.18562 29.0003 8.36758 28.9483 8.525 28.85L16 24.175L23.4625 28.85C23.6165 28.9426 23.792 28.9936 23.9717 28.998C24.1514 29.0023 24.3291 28.96 24.4875 28.875C24.6423 28.7871 24.7712 28.6599 24.8612 28.5063C24.9512 28.3527 24.999 28.178 25 28V6C25 5.46957 24.7893 4.96086 24.4142 4.58579C24.0391 4.21071 23.5304 4 23 4Z"
            stroke="#F28A56"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"/>
        </svg>
    );
};

export default Icon;
