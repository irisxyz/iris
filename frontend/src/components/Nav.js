import styled from 'styled-components'
import { Link } from 'react-router-dom'
import Card from './Card'
import Home from '../assets/Home'
import Profile from '../assets/Profile'
import Subscriptions from '../assets/Subscriptions'
import Compass from '../assets/Compass'
import Share from '../assets/Logout'
import Heart from '../assets/Heart'

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
}

padding: .5em;
transition: all 150ms ease-in-out;
border-radius: 12px;
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
`

function Nav({ handle, setProfile }) {

const handleClick = () => {
    window.sessionStorage.removeItem('lensToken')
    setProfile({})
}

  return (
    <StyledCard>
        <StyledLink to={`/`}>
            <Home/>
            <p>Home</p>
        </StyledLink>
        <StyledLink to={`user/${handle}`}>
            <Profile/>
            <p>Profile</p>
        </StyledLink>
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
        <StyledLink onClick={handleClick} to={``}>
            <Share/>
            <p>Logout</p>
        </StyledLink>
    </StyledCard>
  );
}

export default Nav