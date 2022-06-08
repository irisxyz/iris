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
import Livelinks from "./components/Livelinks";
import logo from "./assets/logo.svg";
import LandingPage from './pages/LandingPage'

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
    const [wallet, setWallet] = useState({});
    const [authToken, setAuthToken] = useState(false);
    const [profile, setProfile] = useState({});
    const [lensHub, setLensHub] = useState();

    useEffect(() => {
        const initLit = async () => {
            const client = new LitJsSdk.LitNodeClient({
                alertWhenUnauthorized: false,
            });
            await client.connect();
            window.litNodeClient = client;
        };
        initLit();
    }, []);

    return (
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
                            wallet={wallet}
                            setWallet={setWallet}
                            authToken={authToken}
                            currProfile={profile}
                            setProfile={setProfile}
                            setLensHub={setLensHub}
                        />
                    </Navbar>
                    <Columns>
                        <Sidebar>
                            <Profile profile={profile} wallet={wallet}>
                                {wallet.address && <Login wallet={wallet} auth={[authToken, setAuthToken]} />}
                            </Profile>
                            <Nav handle={profile?.handle} />
                        </Sidebar>
                        <Content>
                            <Routes>
                                <Route
                                    path="/"
                                    element={
                                        <div>
                                            {/* <Livelinks wallet={wallet} /> */}
                                            {profile && profile.__typename && <Compose wallet={wallet} profile={profile} lensHub={lensHub} />}
                                            <Feed profile={profile} wallet={wallet} lensHub={lensHub} />
                                        </div>
                                    }
                                />
                                <Route path="new-profile" element={<NewProfile wallet={wallet} />} />
                                <Route path="explore" element={ <Feed /> } />
                                <Route path="user" element={<Outlet />}>
                                    <Route path=":handle" element={<User wallet={wallet} lensHub={lensHub} profileId={profile && profile.id} />} />
                                </Route>
                                <Route path="post" element={<Outlet />}>
                                    <Route path=":postId" element={<Post wallet={wallet} lensHub={lensHub} profileId={profile && profile.id} />} />
                                </Route>
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </Content>
                    </Columns>
                </Container>
            </ThemeProvider>
        </ApolloProvider>
    );
}

export default App;
