import { useState } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
	width: fit-content;
	display: flex;
	flex-flow: wrap row;
	align-items: center;
	justify-content: flex-start;
	gap: 0.6rem;
    cursor: pointer;
`

const Input = styled.input`;
    width: 1.625rem;
    height: 1.625rem;
    margin: 0;
    padding: 0;
    opacity: 0;
    position: absolute;
    transform: translateX(-100%);
    pointer-events: none;
    visibility: hidden;
`

const Button = styled.button`
    width: 1.625rem;
    height: 1.625rem;
    margin: 0;
    padding: 0;
    display: flex;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    outline-style: none;
    border: none;
    border-radius: .25rem;
    background-color: hsl(0, 0%, 100%);
    box-shadow: hsl(0, 0%, 0%, 14%) 0 2px 6px;

    &:focus-within,
    &:focus-visible {
        outline: .125rem solid hsl(228, 24%, 22%);
        outline-offset: .125rem
    }
`

const Span = styled.span`
    width: 100%;
    height: 100%;
    opacity: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    transition-property: opacity;
    transition-duration: .16s;
    transition-timing-function: ease;

    ${p => p.checked && 'opacity: 1;'}
`

const Label = styled.label`
    cursor: pointer;
`

const Checkbox = ({ children }) => {
    const [checked, setChecked] = useState(false)
    console.log(checked)
    return <Wrapper onClick={() => setChecked(!checked)}>
        <Input id='cboxinput' aria-hidden='true' type='checkbox' checked={checked}/>
        <Button role='checkbox' aria-checked={checked}>
            <Span checked={checked}>icon</Span>
        </Button>
        <Label onClick={(e) => e.stopPropagation()} htmlFor='cboxinput'>{ children }</Label>
    </Wrapper>
}

export default Checkbox