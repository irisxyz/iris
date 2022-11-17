import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ethers } from 'ethers'
import { Link } from 'react-router-dom'
import { useLazyQuery } from '@apollo/client'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useSigner } from 'wagmi'
import { GET_PROFILES } from '../utils/queries'
import { CHAIN } from '../utils/constants'
import avatar from '../assets/avatar.png'
import Login from './Login'
import LensHub from '../abi/LensHub.json'
import { useWallet } from '../utils/wallet'

const WalletContainer = styled.div`
  display: flex;
  gap: 5px;
  position: relative;
  z-index: 3;
`

export const Address = styled.code`
  box-shadow: 0px 2px 5px rgba(190, 176, 178, 0.6);
  border-radius: 100px;
  height: 34px;
  display: flex;
  align-items: center;
  padding: 0 .6em;
  background: white;
`

export const UserIcon = styled.div`
  height: 30px;
  width: 30px;
  border-radius: 100px;
  &:hover {
    cursor: pointer;
  }
  display: flex;
  justify-content: center;
  align-items: center;
  background: url(${p => p.href || avatar});
  background-size: cover;
  transition: all 100ms ease-in-out;
  border: 2px solid #fff;
  ${p=>p.link && `&:hover {
    border: ${p.theme.border};
    cursor: pointer;
  }`}
  ${p => p.selected && `
    border: ${p.theme.border};
  `}
`

const AccountPicker = styled.div`
  position: absolute;
  top: 38px;
  right: -10px;
  padding: 0 10px;
  width: 260px;
  border: ${p=>p.theme.border};
  border-radius: 16px;
  background: #fff;
  z-index: -300;
  transition: all 300ms cubic-bezier(0.455, 0.030, 0.515, 0.955);
  ${p => !p.show && `
    opacity: 0;
    display: none;
  `}
`

const StyledProfile = styled.div`
  margin: 0.75em 0;
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: right;
  gap: 7px;
  box-sizing: border-box;
  border: 2px solid transparent;
  ${p => p.selected && `
    background: ${p.theme.primary};
    color: #fff;
  `}
  padding: 0.3em;
  border-radius: 16px;
  transition: all 100ms ease-in-out;
  &:hover {
    border: ${p=>p.theme.border};
    cursor: pointer;
  }
`

const StyledA = styled.a`
  text-decoration: none;
  color: black;
  transition: all 50ms ease-in-out;
`

const StyledLink = styled(Link)`
  text-decoration: none;
  color: black;
  transition: all 50ms ease-in-out;
`

const StyledLogin = styled(Login)`
  width: 100%;
  background: white;
  color: black;
  :hover {
    background: white;
    color: ${p=>p.theme.primary};
  }
`

const Profile = ({ profile, currProfile, handleClick }) => {
  return <StyledProfile onClick={() => handleClick(profile)} selected={currProfile.id === profile.id}>
    <b>@{profile.handle}</b>
    <UserIcon href={profile.picture?.original?.url} />
  </StyledProfile>
}


function Wallet({ currProfile, setProfile }) {
  const { setLensHub, authToken } = useWallet()
  const [getProfiles, profiles] = useLazyQuery(GET_PROFILES)
  const [openPicker, setPicker] = useState(false)
  const { address } = useAccount()
  const { data: signer } = useSigner()

  const handleSelect = (profile) => {
    setProfile(profile)
    setPicker(false)
  }

  const handleNew = () => {
    console.log('new profile')
    setPicker(false)
  }
  
  useEffect(() => {
    if (!authToken) return;
    if (!address) return;
    getProfiles({
      variables: {
        request: {
          // profileIds?: string[];
          ownedBy: [address]
          // handles?: string[];
          // whoMirroredPublicationId?: string;
        },
      },
     })

  }, [address, authToken, getProfiles])

  useEffect(() => {
    if (!address) return;
    const contractAddr = CHAIN === 'polygon' ? '0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d' : '0x60Ae865ee4C725cd04353b5AAb364553f56ceF82';
    const contract = new ethers.Contract(contractAddr, LensHub, signer)
    setLensHub(contract)
  }, [address, signer, setLensHub])

  useEffect(() => {
    if (!profiles.data) return

    setProfile(profiles.data.profiles.items[0])

  }, [profiles.data, setProfile])

  return (
    <WalletContainer>
    { address
    ? <>
          <AccountPicker show={openPicker}>
          { authToken
            ? <>
              {
                profiles.data?.profiles.items.map((profile) => <Profile key={profile.id} profile={profile} currProfile={currProfile} handleClick={handleSelect} />)
              }
              { CHAIN === 'polygon'
              ? <StyledA href='https://claim.lens.xyz/' target='_blank' rel='noopener noreferrer'>
                <StyledProfile onClick={() => handleNew()}>
                  <b>+ Create Profile</b>
                  <UserIcon/>
                </StyledProfile>
              </StyledA>
              : <StyledLink to="/new-profile">
                <StyledProfile onClick={() => handleNew()}>
                  <b>+ Create Profile</b>
                  <UserIcon/>
                </StyledProfile>
              </StyledLink>
              }
              </>
            : <StyledLogin />
          }
        </AccountPicker>
        <Address>{address.substring(0, 6)}...{address.substring(38, address.length)}</Address>
        <UserIcon onClick={() => setPicker(!openPicker)} link={true} selected={openPicker} href={profiles.data?.profiles.items[0]?.picture?.original?.url} />
    </>
    : <ConnectButton />
    }
  </WalletContainer>
  );
}

export default Wallet