import styled from 'styled-components'
import X from '../assets/X';

const Container = styled.div`
    display: flex;
    justify-content: center;
`;

const CloseButton = styled.button`
    color: white;
    padding-top: 3px;
    background-color: rgba(0, 0, 0, 0.5);
    border: none;
    border-radius: 4px;
    position: absolute;
    top: 5px;
    right: 5px;
    :hover {
        cursor: pointer;
        background-color:rgba(100, 100, 100, 0.5);
    }
`

const Img = styled.img`
    max-height: 18em;
    border-radius: 6px;
    filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
`

const ImageWrapper = styled.div`
    position: relative;
    display: inline-block;
`;

const Image = ({src, hasCloseButton, closeButtonFn}) => {
    return (
        <Container>
            <ImageWrapper>
                <Img src={URL.createObjectURL(src)}/>
                {hasCloseButton && <CloseButton onClick={closeButtonFn}><X/></CloseButton>}
            </ImageWrapper>
        </Container>
    )
}

export default Image;