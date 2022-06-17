import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ethers } from 'ethers'
import { Link } from 'react-router-dom'
import { useLazyQuery } from '@apollo/client'
import Web3Modal from 'web3modal'
import CoinbaseWalletSDK from '@coinbase/wallet-sdk'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { GET_PROFILES } from '../utils/queries'
import { CHAIN } from '../utils/constants'
import avatar from '../assets/avatar.png'
import WalletButton from './WalletButton'
import LensHub from '../abi/LensHub.json'

const WalletContainer = styled.div`
  display: flex;
  gap: 5px;
  position: relative;
  z-index: 3;
`

const Address = styled.code`
  box-shadow: 0px 4px 12px rgba(236, 176, 178, 0.5);
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

const StyledLink = styled.a`
  text-decoration: none;
  color: black;
  transition: all 50ms ease-in-out;
`


const Profile = ({ profile, currProfile, handleClick }) => {
  return <StyledProfile onClick={() => handleClick(profile)} selected={currProfile.id === profile.id}>
    <b>@{profile.handle}</b>
    <UserIcon href={profile.picture?.original.url} />
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
    if (!wallet.address) return;
    // console.log("wallet", wallet)
    getProfiles({
      variables: {
        request: {
          // profileIds?: string[];
          ownedBy: [wallet.address]
          // handles?: string[];
          // whoMirroredPublicationId?: string;
        },
      },
     })

  }, [wallet.address, authToken])

  useEffect(() => {
    if (!profiles.data) return
    // console.log(profiles.data.profiles.items)

    setProfile(profiles.data.profiles.items[0])

  }, [profiles.data])

  const providerOptions = {
    coinbasewallet: {
      package: CoinbaseWalletSDK, // Required
      options: {
        appName: "iris", // Required
        infuraId: "6a436461eae543349fa0de6bc4152fb9", // Required
        rpc: "", // Optional if `infuraId` is provided; otherwise it's required
        chainId: 137, // Optional. It defaults to 1 if not provided
        darkMode: false // Optional. Use dark theme, defaults to false
      }
    },
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: "6a436461eae543349fa0de6bc4152fb9" // required
      }
    }
  };

  const web3Modal = new Web3Modal({
    network: "mainnet", // optional
    cacheProvider: true, 
    providerOptions // required
  });

  const connectWallet = async () => {
    const instance = await web3Modal.connect();

    const provider = new ethers.providers.Web3Provider(instance)
    // const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner()
    const address = await signer.getAddress()

    // const contract = new ethers.Contract('0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d', LensHub, signer)
    const contractAddr = CHAIN === 'polygon' ? '0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d' : '0x60Ae865ee4C725cd04353b5AAb364553f56ceF82';
    const contract = new ethers.Contract(contractAddr, LensHub, signer)
    // console.log({contract})
    setLensHub(contract)
  
    provider.getBalance(address).then((balance) => {
      // convert a currency unit from wei to ether
      const balanceInEth = ethers.utils.formatEther(balance)
      // console.log({balanceInEth})
      setWallet({...wallet, signer, address, balanceInEth})
      })
  }

  // hook to automatically connect to the cached provider
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
  }}, [])
  
  return (
    
    <WalletContainer>
    { wallet.signer
    ? <>
      <AccountPicker show={openPicker}>
        {
          profiles.data?.profiles.items.map((profile) => <Profile key={profile.id} profile={profile} currProfile={currProfile} handleClick={handleSelect} />)
        }
        {/* <StyledLink href='https://claim.lens.xyz/' target='_blank' rel='noopener noreferrer'>
          <StyledProfile onClick={() => handleNew()}>
            <b>+ Create Profile</b>
            <UserIcon/>
          </StyledProfile>
        </StyledLink> */}
      </AccountPicker>
      <Address>{wallet.address.substring(0, 6)}...{wallet.address.substring(37, wallet.address.length-1)}</Address>
      <UserIcon onClick={() => setPicker(!openPicker)} link={true} selected={openPicker} href={profiles.data?.profiles.items[0]?.picture?.original.url} />
    </>
    : <WalletButton onClick={connectWallet} >Connect Wallet</WalletButton>
    }
  </WalletContainer>
  );
}

export default Wallet