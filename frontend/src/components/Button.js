import styled from 'styled-components'


const Button = styled.button`
    border: none;
    border-radius: 6px;
    padding: 0.6em 2em;
    font-family: ${p => p.theme.font};
    font-weight: 500;
    color: ${p => p.theme.textLight};
    background: ${p => p.theme.primary};
    letter-spacing: 0.02em;
    transition: all 100ms;
    :hover {
        background: ${p => p.theme.primaryHover};
        cursor: pointer;
    }
    :focus {
        box-shadow: 0px 2px 2px -1px rgba(0, 0, 0, 0.12), 0px 0px 0px 3px #DCD4FF;
        outline: none;
    }
`

export default Button