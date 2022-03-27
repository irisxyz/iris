import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ethers } from 'ethers'
import { Link } from 'react-router-dom'
import { useLazyQuery, useQuery, useMutation } from '@apollo/client'
import Button from './Button'
import { GET_PROFILES } from '../utils/queries'
import gradient from '../utils/gradients'
import avatar from '../assets/avatar.png'
import WalletButton from './WalletButton'
import LensHub from '../artifacts/contracts/core/LensHub.sol/LensHub.json'

const WalletContainer = styled.div`
  display: flex;
  gap: 5px;
  position: relative;
  z-index: 3;
`

const Address = styled.code`
  box-shadow: 0px 3px 6px rgba(112, 58, 202, 0.4);
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
  background: url(${avatar});
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

const StyledLink = styled(Link)`
  text-decoration: none;
  color: black;
  transition: all 50ms ease-in-out;
`


const Profile = ({ profile, currProfile, handleClick }) => {
  return <StyledProfile onClick={() => handleClick(profile)} selected={currProfile.id === profile.id}>
    <b>@{profile.handle}</b>
    <UserIcon/>
  </StyledProfile>
}


function Wallet({ wallet, setWallet, authToken, currProfile, setProfile, setLensHub }) {
  const [getProfiles, profiles] = useLazyQuery(GET_PROFILES)
  const [openPicker, setPicker] = useState(false)

  const handleSelect = (profile) => {
    console.log(profile)
    setProfile(profile)
    setPicker(false)
  }

  const handleNew = () => {
    console.log('new profile')
    setPicker(false)
  }
  
  useEffect(() => {
    if (!authToken) return;

    getProfiles({
      variables: {
        request: {
          // profileIds?: string[];
          ownedBy: wallet.address
          // handles?: string[];
          // whoMirroredPublicationId?: string;
        },
      },
     })

  }, [authToken])

  useEffect(() => {
    if (!profiles.data) return
    console.log(profiles.data.profiles.items)

    setProfile(profiles.data.profiles.items[0])

  }, [profiles.data])

  const connectWallet = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner()
    const address = await signer.getAddress()

    const contract = new ethers.Contract('0xd7B3481De00995046C7850bCe9a5196B7605c367', LensHub.abi, signer)
    // console.log({contract})
    setLensHub(contract)
  
    provider.getBalance(address).then((balance) => {
      // convert a currency unit from wei to ether
      const balanceInEth = ethers.utils.formatEther(balance)
      console.log({balanceInEth})
      setWallet({...wallet, signer, address, balanceInEth})
      })
  }
  
  return (
    
    <WalletContainer>
    { wallet.signer
    ? <>
      <AccountPicker show={openPicker}>
        {
          profiles.data?.profiles.items.map((profile) => <Profile key={profile.id} profile={profile} currProfile={currProfile} handleClick={handleSelect} />)
        }
        <StyledLink to='new-profile'>
        <StyledProfile onClick={() => handleNew()}>
          <b>+ Create Profile</b>
          <UserIcon/>
        </StyledProfile>
        </StyledLink>
      </AccountPicker>
      <Address>{wallet.address.substring(0, 6)}...{wallet.address.substring(37, wallet.address.length-1)}</Address>
      <UserIcon onClick={() => setPicker(!openPicker)} link={true} selected={openPicker} />
    </>
    : <WalletButton onClick={connectWallet} >Connect Wallet</WalletButton>
    }
  </WalletContainer>
  );
}

export default Wallet