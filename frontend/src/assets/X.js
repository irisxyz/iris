import styled from "styled-components";

const Icon = ({...props }) => {
    return (
        <svg width="10" height="10" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="2.12132" y1="2" x2="17" y2="16.8787" stroke="white" stroke-width="3" stroke-linecap="round"/>
            <line x1="2" y1="16.8787" x2="16.8787" y2="2" stroke="white" stroke-width="3" stroke-linecap="round"/>
        </svg>
    );
};

export default Icon;
