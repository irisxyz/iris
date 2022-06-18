import styled from "styled-components";

const StrokePath = styled.path`
    stroke: ${p => p.theme.error};
    stroke-width: 3px;

`

const FillPath = styled.path`
    fill: ${p => p.theme.error};
`

const Icon = ({ ...props }) => {
    return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <StrokePath d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z" stroke="#8247E5" strokeLinecap="round" strokeLinejoin="round"/>
        <StrokePath d="M16 10V16.5" stroke="#8247E5" strokeLinecap="round" strokeLinejoin="round"/>
        <FillPath d="M16 23.5C17.1046 23.5 18 22.6046 18 21.5C18 20.3954 17.1046 19.5 16 19.5C14.8954 19.5 14 20.3954 14 21.5C14 22.6046 14.8954 23.5 16 23.5Z" />
    </svg>
    );
};

export default Icon;
