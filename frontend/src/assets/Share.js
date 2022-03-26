import styled from "styled-components"

const SVG = styled.svg`
path {

    stroke: #747C90;
    stroke-width: 3px;
    transition: all 100ms ease-in-out;
}
transition: all 100ms ease-in-out;
&:hover {
    cursor: pointer;
    path {
        stroke: #7329F0;

    }
}
${p=>p.filled && `stroke: #7329F0;`}

`

const Icon = () => {
    return (
<SVG width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M22 19L28 13L22 7" stroke="#7329F0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M24 27H5C4.73478 27 4.48043 26.8946 4.29289 26.7071C4.10536 26.5196 4 26.2652 4 26V11" stroke="#7329F0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9.375 22C10.0423 19.4242 11.5459 17.1428 13.6499 15.5139C15.7539 13.885 18.3392 13.0008 21 13H28" stroke="#7329F0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</SVG>



)
}

export default Icon