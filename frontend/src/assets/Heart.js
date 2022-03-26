import styled from "styled-components"

const Path = styled.path`
stroke: #747C90;
stroke-width: 3px;
transition: all 100ms ease-in-out;
&:hover {
    stroke: ${p => p.theme.primary};
    cursor: pointer;
}
${p=>p.filled && `stroke: ${p.theme.primary};`}
`

const Icon = ({ filled, ...props }) => {
    return (
        
        <svg width="24" height="24" viewBox="0 0 32 32" fill={filled ? "#7329F0" : "#fff"} xmlns="http://www.w3.org/2000/svg">
<Path filled={filled} {...props} d="M16.7127 26.4874L26.8377 16.3624C29.3252 13.8624 29.6877 9.77493 27.3377 7.16243C26.7483 6.50407 26.0309 5.97278 25.2293 5.60103C24.4277 5.22929 23.5587 5.02488 22.6754 5.00032C21.7921 4.97575 20.9131 5.13153 20.0921 5.45814C19.271 5.78476 18.5252 6.27534 17.9002 6.89993L16.0002 8.81243L14.3627 7.16243C11.8627 4.67493 7.77517 4.31243 5.16267 6.66243C4.50431 7.25179 3.97302 7.96919 3.60128 8.7708C3.22953 9.57242 3.02513 10.4414 3.00056 11.3247C2.97599 12.208 3.13177 13.087 3.45839 13.908C3.785 14.7291 4.27559 15.4749 4.90017 16.0999L15.2877 26.4874C15.4773 26.6752 15.7333 26.7806 16.0002 26.7806C16.267 26.7806 16.5231 26.6752 16.7127 26.4874V26.4874Z" stroke="#7329F0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
</svg>


)
}

export default Icon