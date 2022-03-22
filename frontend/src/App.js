import { useState } from 'react'
import { ethers } from 'ethers'
import { Routes, Route } from "react-router-dom"
import styled from 'styled-components'

import ApolloProvider from './components/Apollo'
import GlobalStyle from './theme/GlobalStyle'
import ThemeProvider from './theme/ThemeProvider'
import NotFound from './pages/NotFound'
import User from './pages/User'
import UserHandle from './pages/UserHandle'
import Login from "./components/Login"
import Button from './components/Button'
import Follow from "./components/Follow"

const Container = styled.div`
  max-width: 1200px;
  padding: 0 1em 1em 1em;
  min-height: 90vh;
  box-sizing: border-box;
  margin: auto;
  border-left: #E2E4E8 1px solid;
  border-right: #E2E4E8 1px solid;
`

const Navbar = styled.nav`
  box-sizing: border-box;
  border-bottom: #E2E4E8 1px solid;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1em;
`

const Wallet = styled.div`
  border: #E2E4E8 1px solid;
  border-radius: 100px;
  padding: .3em .6em;
`

function App() {
  const [wallet, setWallet] = useState({})

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
    <ApolloProvider>
      <ThemeProvider>
        <Container>
          <Navbar>
            <h1>Iris</h1>
            <div>
              { wallet.signer
              ? <Wallet>{wallet.address.substring(0, 6)}...{wallet.address.substring(37, wallet.address.length-1)}</Wallet>
              : <Button onClick={connectWallet} >Connect Wallet</Button>
              }
            </div>
          </Navbar>
          <GlobalStyle />
          {wallet.address && <Login wallet={wallet} />}
          {wallet.address && <Follow wallet={wallet} />}
          <Routes>
            <Route path="/" element={<div>Welcome to Iris</div>} />
            <Route path="user" element={<User/>} >
              <Route path=":handle" element={<UserHandle />} />
            </Route>
            <Route path="*" element={<NotFound/>} />
          </Routes>
        </Container>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
