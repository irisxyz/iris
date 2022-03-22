import { useState } from 'react'
import { ethers } from 'ethers'
import { Routes, Route } from "react-router-dom";

import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  ApolloProvider,
} from "@apollo/client";

import GlobalStyle from './theme/GlobalStyle'
import ThemeProvider from './theme/ThemeProvider'
import NotFound from './pages/NotFound'
import User from './pages/User'
import UserHandle from './pages/UserHandle'
import Login from "./components/Login";
import Button from './components/Button'
import Follow from "./components/Follow";

import LensHub from './artifacts/contracts/core/LensHub.sol/LensHub.json'

let LensHubContract;

const LENS_API = 'https://api-mumbai.lens.dev/';

const httpLink = new HttpLink({
    uri: LENS_API,
    fetch,
});
  
const authLink = new ApolloLink((operation, forward) => {
    // const token = window.authToken;
    const token = window.sessionStorage.getItem('lensToken')
    console.log('jwt token:', token);

    // Use the setContext method to set the HTTP headers.
    operation.setContext({
        headers: {
        'x-access-token': token ? `Bearer ${token}` : '',
        },
    });

    // Call the next link in the middleware chain.
    return forward(operation);
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

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
    <ApolloProvider client={client}>
      <ThemeProvider>
        <GlobalStyle />
        { wallet.signer ? 'Connected' : <Button onClick={connectWallet}>Connect Wallet</Button> }
        <h1>Iris</h1>
        {LensHubContract && <Login wallet={wallet} contract={LensHubContract}/>}
        {LensHubContract && <Follow wallet={wallet} contract={LensHubContract}/>}
        <Routes>
          <Route path="/" element={<div>Welcome to Iris</div>} />
          <Route path="user" element={<User/>} >
            <Route path=":handle" element={<UserHandle />} />
          </Route>
          <Route path="*" element={<NotFound/>} />
        </Routes>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
