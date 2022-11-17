import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import styled from "styled-components";
import LitJsSdk from "lit-js-sdk";

import ApolloProvider from "./components/Apollo";
import GlobalStyle from "./theme/GlobalStyle";
import ThemeProvider from "./theme/ThemeProvider";
import NotFound from "./pages/NotFound";
import Outlet from "./pages/Outlet";
import User from "./pages/User";
import Post from "./pages/Post";
import NewProfile from "./pages/NewProfile";
import Profile from "./components/Profile";
import Nav from "./components/Nav";
import Wallet from "./components/Wallet";
import Compose from "./components/Compose";
import Login from "./components/Login";
import Feed from "./components/Feed";
import Card from "./components/Card";
// import Livelinks from "./components/Livelinks";
import logo from "./assets/iris.svg";
// import LandingPage from './pages/LandingPage'
import { CHAIN } from "./utils/constants";
import { WalletContextProvider } from "./utils/wallet";
import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme 
} from '@rainbow-me/rainbowkit';
import {
  chain,
  configureChains,
  createClient,
  WagmiConfig,
} from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';


const Container = styled.div`
    max-width: 1000px;
    padding: 0 1em 1em 1em;
    min-height: 90vh;
    box-sizing: border-box;
    margin: auto;
    @media (max-width: 768px) {
        padding: 0 0.5em 0.5em 0.5em;
        margin-bottom: 3em;
    }
`;

const LogoContainer = styled.div`
    display: flex;
    padding: 0.6em;
    gap: 8px;
`;

const Navbar = styled.nav`
    box-sizing: border-box;
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0.7em 0;
`;

const Columns = styled.div`
    display: flex;
    gap: 2em;
`;

const Sidebar = styled.div`
  width: 300px;
  height: 100%
  float: left;
  @media (max-width: 768px) {
      display: none;
  }
`;

const Content = styled.main`
    width: 100%;
    @media (min-width: 768px) {
        width: 700px;
    }
`;

const MobileNav = styled(Nav)`
    @media (min-width: 768px) {
        display: none;
    }
`

const Announcement = styled(Card)`
    margin-top: 1em;
    margin-bottom: 0.5em;
    background: #FFCBBB;
    border: #FF9776 1px solid;
    h4 {
        margin: 0;
        padding-bottom: .25em;
        color: #F66030;
        font-weight: 500;
        
    }
`

function App() {
    const [profile, setProfile] = useState({});

    useEffect(() => {
        const initLit = async () => {
            const client = new LitJsSdk.LitNodeClient({
                alertWhenUnauthorized: false,
                debug: false,
            });
            await client.connect();
            window.litNodeClient = client;
        };
        initLit();
    }, []);
  
    const { chains, provider } = configureChains(
        process.env.REACT_APP_CHAIN === 'mumbai' ? [chain.polygonMumbai] : [chain.polygon],
        [
            alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
            publicProvider()
        ]
    );

    const { connectors } = getDefaultWallets({
        appName: 'Iris',
        chains
    });
    
    const wagmiClient = createClient({
        autoConnect: true,
        connectors,
        provider
    })

    return (
        <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains}>
        <WalletContextProvider>
        <ApolloProvider>
            <ThemeProvider>
                <GlobalStyle />
                <MobileNav handle={profile?.handle} />
                <Container>
                    <Navbar>
                        <LogoContainer>
                            <img src={logo} alt="iris logo" width="46px" height="46px" />
                            <h1>iris</h1>
                        </LogoContainer>
                        <Wallet
                            currProfile={profile}
                            setProfile={setProfile}
                        />
                    </Navbar>
                    <Columns>
                        <Sidebar>
                            <Profile profile={profile}>
                                <Login />
                            </Profile>
                            <Nav handle={profile?.handle} />
                            <Announcement>
                                <h4>hello fren 🍑</h4>
                                iris is still in early development so you may run into bugs as your explore the app. Handle with care 💌
                            </Announcement>
                            © iris
                        </Sidebar>
                        <Content>
                            <Routes>
                                <Route
                                    path="/"
                                    element={
                                        <div>
                                            {profile && profile.__typename && <Compose profileId={profile.id} profileName={profile.name || profile.handle} isPost/>}
                                            <Feed profile={profile} />
                                        </div>
                                    }
                                />
                                { CHAIN === 'mumbai' && <Route path="new-profile" element={<NewProfile />} />}
                                <Route path="explore" element={<Feed profile={profile} isExplore/> } />
                                <Route path="user" element={<Outlet />}>
                                    <Route path=":handle" element={<User profileId={profile && profile.id} />} />
                                </Route>
                                <Route path="post" element={<Outlet />}>
                                    <Route path=":postId" element={<Post profileId={profile && profile.id} profileName={profile && (profile.name || profile.handle)}  />} />
                                </Route>
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </Content>
                    </Columns>
                </Container>
            </ThemeProvider>
        </ApolloProvider>
        </WalletContextProvider>
        </RainbowKitProvider>
        </WagmiConfig>
    );
}

export default App;
