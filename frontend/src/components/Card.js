import styled from 'styled-components'

const Card = styled.div`
    background: #fff;
    box-shadow: 0px 2px 5px rgba(200, 176, 178, 0.6);
    border-radius: 8px;
    box-sizing: border-box;
    padding: ${p => p.padding || '1em'};
    width: 100%;

    @media (max-width: 768px) {
        padding: 0.75em;
        overflow-wrap: break-word;
        word-wrap: break-word;
        word-break: break-word;
        hyphens: auto;
    }
    
`

export default Card