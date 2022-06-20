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
// import Livelinks from "./components/Livelinks";
import logo from "./assets/logo.svg";
// import LandingPage from './pages/LandingPage'
import { CHAIN } from "./utils/constants";
import { WalletContextProvider } from "./utils/wallet";

const Container = styled.div`
    max-width: 1000px;
    padding: 0 1em 1em 1em;
    min-height: 90vh;
    box-sizing: border-box;
    margin: auto;
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
`;

const Content = styled.main`
    width: 700px;
`;

function App() {
    const [authToken, setAuthToken] = useState(false);
    const [profile, setProfile] = useState({});
    const [lensHub, setLensHub] = useState();

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

    return (
        <WalletContextProvider>
        <ApolloProvider>
            <ThemeProvider>
                <GlobalStyle />
                <Container>
                    <Navbar>
                        <LogoContainer>
                            <img src={logo} alt="iris logo" width="50px" height="50px" />
                            <h1>iris</h1>
                        </LogoContainer>
                        <Wallet
                            authToken={authToken}
                            currProfile={profile}
                            setProfile={setProfile}
                            setLensHub={setLensHub}
                        />
                    </Navbar>
                    <Columns>
                        <Sidebar>
                            <Profile profile={profile}>
                                <Login auth={[authToken, setAuthToken]} />
                            </Profile>
                            <Nav handle={profile?.handle} />
                        </Sidebar>
                        <Content>
                            <Routes>
                                <Route
                                    path="/"
                                    element={
                                        <div>
                                            {profile && profile.__typename && <Compose profileId={profile.id} profileName={profile.name || profile.handle} lensHub={lensHub} isPost/>}
                                            <Feed profile={profile} lensHub={lensHub} />
                                        </div>
                                    }
                                />
                                { CHAIN === 'mumbai' && <Route path="new-profile" element={<NewProfile />} />}
                                <Route path="explore" element={<Feed profile={profile} lensHub={lensHub} isExplore/> } />
                                <Route path="user" element={<Outlet />}>
                                    <Route path=":handle" element={<User lensHub={lensHub} profileId={profile && profile.id} />} />
                                </Route>
                                <Route path="post" element={<Outlet />}>
                                    <Route path=":postId" element={<Post lensHub={lensHub} profileId={profile && profile.id} profileName={profile && (profile.name || profile.handle)}  />} />
                                </Route>
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </Content>
                    </Columns>
                </Container>
            </ThemeProvider>
        </ApolloProvider>
        </WalletContextProvider>
    );
}

export default App;
