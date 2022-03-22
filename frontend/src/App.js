import { useState } from 'react'
import { ethers } from 'ethers'

import CreateProfile from "./components/CreateProfile";

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
    <div>
      <header>
        { wallet.signer ? 'Connected' : <button onClick={connectWallet}>Connect Wallet</button> }
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React. Find God.
        </a>
        {LensHubContract && <CreateProfile wallet={wallet} contract={LensHubContract}/>}
      </header>
    </div>
  );
}

export default App;
