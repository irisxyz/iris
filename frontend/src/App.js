import { useState } from 'react'
import { ethers } from 'ethers'
import { Routes, Route, Link } from "react-router-dom";

import GlobalStyle from './theme/GlobalStyle'
import ThemeProvider from './theme/ThemeProvider'
import NotFound from './pages/NotFound'
import User from './pages/User'
import UserHandle from './pages/UserHandle'
import CreateProfile from "./components/CreateProfile";
import Follow from "./components/Follow";

import LensHub from './artifacts/contracts/core/LensHub.sol/LensHub.json'

let LensHubContract;

function App() {
  const [wallet, setWallet] = useState({})

  const connectWallet = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner()
    const address = await signer.getAddress()      
    LensHubContract = new ethers.Contract('0xa439225B4a4BF47b355Dd1d3e50D5Ba4984c1Db0', LensHub.abi, signer)
  
    provider.getBalance(address).then((balance) => {
      // convert a currency unit from wei to ether
      const balanceInEth = ethers.utils.formatEther(balance)
      console.log(balanceInEth)
      setWallet({...wallet, signer, address, balanceInEth})
      })
  }

  return (
    <ThemeProvider>
      <GlobalStyle />
      { wallet.signer ? 'Connected' : <button onClick={connectWallet}>Connect Wallet</button> }
      <h1>Iris</h1>
      {LensHubContract && <CreateProfile wallet={wallet} contract={LensHubContract}/>}
      {LensHubContract && <Follow wallet={wallet} contract={LensHubContract}/>}
      <Routes>
        <Route path="/" element={<div>Welcome to Iris</div>} />
        <Route path="user" element={<User/>} >
          <Route path=":handle" element={<UserHandle />} />
        </Route>
        <Route path="*" element={<NotFound/>} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
