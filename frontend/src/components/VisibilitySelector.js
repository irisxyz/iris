import { useState } from 'react'
import styled from 'styled-components'
import Modal from './Modal'
import CaretDown from '../assets/CaretDown'
import Globe from '../assets/Globe'
import Community from '../assets/Community'

const StyledModal = styled(Modal)`
    max-width: 500px;
`

const Container = styled.button`
    border: none;
    font-family: ${(p) => p.theme.font};
    margin-left: auto;
    background: ${p => p.theme.darken2};
    padding: 0.4em 1em 0.4em 0.75em;
    border-radius: 6px;
    font-size: 0.8em;
    display: flex;
    align-items: center;
    gap: 0.25em;
    transition: all 100ms ease;
    &:hover {
        cursor: pointer;
        background: ${p => p.theme.darken};
    }
`

const StyledButton = styled.button`
    background: none;
    font-family: ${(p) => p.theme.font};
    font-size: 1em;
    text-align: left;
    b {
        font-weight: 600;
        display: inline;
        color: black;
        transition: all 100ms ease-in-out;
    }

    margin-top: 4px;
    padding: .5em 1em .5em .75em;
    transition: all 150ms ease-in-out;
    border-radius: 12px;
    border: 2px solid transparent;
    &:hover {
        border: ${p=>p.theme.border};
        cursor: pointer;
        b {
            color: ${p=>p.theme.primary};
        }
    }
`

const Span = styled.span`
    display: flex;
    align-items: center;
    gap: 0.5em;
`

const VisibilitySelector = ({ selectedVisibility }) => {
    const [showModal, setShowModal] = useState(false)

    return <>
    {showModal && <StyledModal onExit={() => setShowModal(false)}>
        <h3>Post Visibility</h3>
        <StyledButton>
            <Span>
                <Globe filled/>
                <b>Public</b>
            </Span>
            <p>Everyone on the internet can view this post.</p>
        </StyledButton>
        <StyledButton>
            <Span>
                <Community filled/>
                <b>Community Only</b>
            </Span>
            <p>Only members of this community can view this post.</p>
        </StyledButton>
    </StyledModal>}
    <Container onClick={() => setShowModal(true)}>
        <Globe width="18" height="18"/>
        Public
        <CaretDown filled/>
    </Container>
    </>
}

export default VisibilitySelector