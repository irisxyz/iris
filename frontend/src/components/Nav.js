import styled from 'styled-components'
import { Link } from 'react-router-dom'
import Card from './Card'
import Home from '../assets/Home'
import Profile from '../assets/Profile'
import Subscriptions from '../assets/Subscriptions'
import Compass from '../assets/Compass'
import Share from '../assets/Logout'
import Heart from '../assets/Heart'
import { useWallet } from '../utils/wallet'

const StyledLink = styled(Link)`
text-decoration: none;
display: flex;
align-items: center;
gap: 12px;
p {
    padding-top: 1px;
    font-weight: 600;
    display: inline;
    color: black;
    transition: all 100ms ease-in-out;
    @media (max-width: 768px) {
        display: none;
    }
}

padding: .5em;
transition: all 150ms ease-in-out;
border-radius: 8px;
border: 2px solid transparent;
&:hover {
  border: ${p=>p.theme.border};
  cursor: pointer;
  p {
    color: ${p=>p.theme.primary};
  }
}
`

const StyledCard = styled(Card)`
  margin-top: 1em;
  @media (max-width: 768px) {
      display: flex;
      justify-content: space-between;
      position: fixed;
      bottom: 0;
      z-index: 100;
      border-radius: 0;
      padding: 0.3em 1em;
  }
`

function Nav({ handle, setProfile, ...props }) {
  const { authToken } = useWallet()
  const handleClick = () => {
    window.sessionStorage.removeItem('lensToken')
    window.sessionStorage.removeItem('signature')
    setProfile({})
  }

  return (
    <StyledCard {...props}>
        <StyledLink to={`/`}>
            <Home/>
            <p>Home</p>
        </StyledLink>
        {handle && <StyledLink to={`user/${handle}`}>
            <Profile/>
            <p>Profile</p>
        </StyledLink>}
        {/* <StyledLink to={`user/${Nav.handle}`}>
            <Subscriptions/>
            <p>Subscriptions</p>
        </StyledLink>
        <StyledLink to={`user/${Nav.handle}`}>
            <Heart filled/>
            <p>Collection</p>
        </StyledLink> */}
        <StyledLink to={`explore`}>
            <Compass/>
            <p>Explore</p>
        </StyledLink>
        {authToken && <StyledLink onClick={handleClick} to={``}>
            <Share/>
            <p>Logout</p>
        </StyledLink>}
    </StyledCard>
  );
}

export default Nav