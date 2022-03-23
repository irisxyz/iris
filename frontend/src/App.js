import { useEffect, useState } from 'react'
import { Routes, Route } from "react-router-dom"
import styled from 'styled-components'

import ApolloProvider from './components/Apollo'
import GlobalStyle from './theme/GlobalStyle'
import ThemeProvider from './theme/ThemeProvider'
import NotFound from './pages/NotFound'
import User from './pages/User'
import UserHandle from './pages/UserHandle'
import Profile from "./components/Profile"
import Wallet from "./components/Wallet"
import Compose from "./components/Compose"
import Login from "./components/Login"

const Container = styled.div`
  max-width: 1200px;
  padding: 0 1em 1em 1em;
  min-height: 90vh;
  box-sizing: border-box;
  margin: auto;
  border-left: #EDDAFD 1px solid;
  border-right: #EDDAFD 1px solid;
`

const Navbar = styled.nav`
  box-sizing: border-box;
  border-bottom: #EDDAFD 1px solid;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1em;
`

const Columns = styled.div`
  display: flex;
  gap: 2em;
`

const Sidebar = styled.div`
  width: 300px;
  height: 100%
  float: left;
`

const Content = styled.main`
  width: 460px;
`

function App() {
  const [wallet, setWallet] = useState({})
  const [authToken, setAuthToken] = useState(false)
  const [profile, setProfile] = useState({})
  const [lensHub, setLensHub] = useState()

  return (
    <ApolloProvider>
      <ThemeProvider>
        <GlobalStyle />
        <Container>
          <Navbar>
            <h1>Iris</h1>
            <Wallet wallet={wallet} setWallet={setWallet} authToken={authToken} currProfile={profile} setProfile={setProfile} setLensHub={setLensHub} />
          </Navbar>
          <Columns>
            <Sidebar>
              <Profile profile={profile}/>
            </Sidebar>
            <Content>
              {wallet.address && <Login wallet={wallet} auth={[authToken, setAuthToken]} />}
              <Routes>
                <Route path="/" element={<div>
                  <Compose wallet={wallet} profile={profile} lensHub={lensHub} />
                </div>} />
                <Route path="user" element={<User/>} >
                  <Route path=":handle" element={<UserHandle wallet={wallet} lensHub={lensHub} />} />
                </Route>
                <Route path="*" element={<NotFound/>} />
              </Routes>
            </Content>
          </Columns>
        </Container>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
