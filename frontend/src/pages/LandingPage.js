import styled, { withTheme } from 'styled-components'
import bg from '../assets/bg.png'
import logo from '../assets/logo-open.png'
import Wallet from '../components/Wallet'

const LandingStyle = styled.div`
    width: 100vw;
    height: 100vh;
    display: flex;
    background: url(${bg});
    background-size: cover;
`

const Logo = styled.div`
    width: 184px;
    height: 184px;
    display: flex;
    padding: 10px;
`

const Title = styled.div`
    font-weight: 600;
    font-size: 8em;
    color: #220D6D;
    display: flex;
    float: left;
    padding: 10px;
`
const Subtitle = styled.div`
    font-weight: 300;
    font-size: 2em;
    color: #220D6D;
    display: flex;
    padding: 5px;
`
const Body = styled.div`
    margin: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
`

const Center = styled.div`
    align-items: center;
    display: flex;
    justify-content: center;
    padding: 2em;
    flex-direction: column;
`
const Row = styled.div`
    flex-direction: row;
`

function Landing({ wallet, setWallet, authToken, currProfile, setProfile, setLensHub }) {
    return (
    <>
    <LandingStyle>
        <Body>
            <Row>
                <Title>IRIS</Title>
                <Logo><img src={logo}/></Logo>
            </Row>
            <Center>
                <Subtitle>decentralized sharing at your fingertips</Subtitle>
                <br></br>
                <br></br>
                <Wallet wallet={wallet} setWallet={setWallet} authToken={authToken} currProfile={currProfile} setProfile={setProfile} setLensHub={setLensHub}>Connect Wallet</Wallet>
            </Center>
        </Body>
    </LandingStyle>
    </>
    );
}


export default Landing