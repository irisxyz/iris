import styled from 'styled-components'

const Card = styled.div`
    background: #fff;
    box-shadow: 0px 4px 12px rgba(236, 176, 178, 0.8);
    border-radius: 18px;
    box-sizing: border-box;
    padding: ${p => p.padding || '1em'};
    width: 100%;
`

export default Card