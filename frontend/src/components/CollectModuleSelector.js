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
    font-family: ${p => p.theme.font};
    margin-left: 1em;
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
    font-family: ${p => p.theme.font};
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
    ${p => p.selected && `
        border: ${p.theme.border};
        cursor: pointer;
        b {
            color: ${p.theme.primary};
        }
    `}
`

const Span = styled.span`
    display: flex;
    align-items: center;
    gap: 0.5em;
`

const CollectModuleSelector = ({ selectedModule, setModule }) => {
    const [showModal, setShowModal] = useState(false)

    return <>
    {showModal && <StyledModal onExit={() => setShowModal(false)}>
        <h3>Collect Module</h3>
        <StyledButton
            selected={selectedModule === 'public'}
            onClick={() => setModule('public')}>
            <Span>
                <Globe filled/>
                <b>Free Collect</b>
            </Span>
            <p>Collecting this publication will be free.</p>
        </StyledButton>
        {<StyledButton
            selected={selectedModule === 'follower'}
            onClick={() => setModule('follower')}>
            <Span>
                <Community filled/>
                <b>Fee Collect</b>
            </Span>
            <p>Collecting this publication will require a fee set by the poster.</p>
        </StyledButton>}
        {<StyledButton
            selected={selectedModule === 'community'}
            onClick={() => setModule('community')}>
            <Span>
                <Community filled/>
                <b>Revert Collect</b>
            </Span>
            <p>Disable collecting this publication.</p>
        </StyledButton>}
    </StyledModal>}
    <Container onClick={() => setShowModal(true)}>
        {selectedModule === 'public' && <>
            <Globe width="18" height="18"/>
        </>}
        {selectedModule === 'follower' && <>
            <Community width="18" height="18"/>
        </>}
        {selectedModule === 'community' && <>
            <Community width="18" height="18"/>
        </>}
    </Container>
    </>
}

export default CollectModuleSelector