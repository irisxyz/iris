import styled from 'styled-components'

const Card = styled.div`
    background: #fff;
    box-shadow: 0px 3px 6px rgba(112, 58, 202, 0.4);
    border-radius: 18px;
    box-sizing: border-box;
    padding: ${p => p.padding || '1em'};
    border: #EDDAFD 1px solid;
    width: 100%;
`

export default Card