import styled from "styled-components"

const Path = styled.path`
stroke: #747C90;
stroke-width: 3px;
transition: all 100ms ease-in-out;
&:hover {
    stroke: #7329F0;
    cursor: pointer;
}
${p=>p.filled && `stroke: #7329F0;`}

`

const Icon = ({ filled, ...props}) => {
    return (
        
        <svg width="24" height="24" viewBox="0 0 32 32" fill={filled ? "#7329F0" : "#fff"} xmlns="http://www.w3.org/2000/svg">
<Path d="M5.67534 22.125C4.18645 19.613 3.66565 16.6439 4.21072 13.7752C4.75579 10.9064 6.32925 8.33525 8.63569 6.54438C10.9421 4.75352 13.823 3.86611 16.7373 4.04875C19.6517 4.2314 22.3992 5.47153 24.464 7.53634C26.5288 9.60115 27.7689 12.3486 27.9516 15.263C28.1342 18.1774 27.2468 21.0582 25.4559 23.3646C23.6651 25.6711 21.0939 27.2445 18.2252 27.7896C15.3564 28.3347 12.3873 27.8139 9.87534 26.325V26.325L5.72534 27.5C5.55531 27.5497 5.37503 27.5528 5.20341 27.5089C5.03178 27.465 4.87513 27.3757 4.74986 27.2504C4.6246 27.1252 4.53534 26.9685 4.49144 26.7969C4.44753 26.6253 4.45061 26.445 4.50034 26.275L5.67534 22.125Z" stroke="#7329F0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
</svg>


)
}

export default Icon