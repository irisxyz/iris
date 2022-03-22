import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ethers } from 'ethers'
import { useLazyQuery, useMutation } from '@apollo/client'
import Button from './Button'
import { GET_PROFILES } from '../utils/queries'
import gradient from '../utils/gradients'

const WalletContainer = styled.div`
  display: flex;
  gap: 5px;
  position: relative;
  z-index: 3;
`

const Address = styled.div`
  border: #E2E4E8 1px solid;
  border-radius: 100px;
  height: 30px;
  display: flex;
  align-items: center;
  padding: 0 .6em;
`

const WalletIcon = styled.div`
  height: 30px;
  width: 30px;
  border: #E2E4E8 1px solid;
  border-radius: 100px;
  &:hover {
    cursor: pointer;
  }
  display: flex;
  justify-content: center;
  align-items: center;
`

const AccountPicker = styled.div`
  position: absolute;
  padding-top: 30px;
  max-height: 100px;
  right: 0;
  width: 260px;
  border: #E2E4E8 1px solid;
  border-radius: 6px;
  background: ${p=>p.theme.background};
  z-index: -300;
  transition: all 300ms cubic-bezier(0.455, 0.030, 0.515, 0.955);
  ${p => !p.show && `
    max-height: 0;
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
`

const Profile = ({ profile }) => {
  return <StyledProfile>
    {profile.handle}
    <WalletIcon>{profile.handle[0]}</WalletIcon>
  </StyledProfile>
}


function Wallet({ wallet, setWallet, authToken }) {
  const [getProfiles, profiles] = useLazyQuery(GET_PROFILES)
  const [openPicker, setPicker] = useState(false)

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
    console.log(profiles.data?.profiles.items)

  }, [profiles.data])

  const connectWallet = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner()
    const address = await signer.getAddress()
  
    provider.getBalance(address).then((balance) => {
      // convert a currency unit from wei to ether
      const balanceInEth = ethers.utils.formatEther(balance)
      console.log(balanceInEth)
      setWallet({...wallet, signer, address, balanceInEth})
      })
  }
  
  return (
    
    <WalletContainer>
    { wallet.signer
    ? <>
      <AccountPicker show={openPicker}>
        {
          profiles.data?.profiles.items.map((profile) => <Profile key={profile.id} profile={profile} />)
        }
      </AccountPicker>
      <Address>{wallet.address.substring(0, 6)}...{wallet.address.substring(37, wallet.address.length-1)}</Address>
      <WalletIcon onClick={() => setPicker(!openPicker)}/>
    </>
    : <Button onClick={connectWallet} >Connect Wallet</Button>
    }
  </WalletContainer>
  );
}

export default Wallet