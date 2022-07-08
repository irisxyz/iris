import React, { useState } from 'react';

const WalletContext = React.createContext();

const WalletContextProvider = ({ children }) => {
  const [wallet, setWallet] = useState({});
  const [authToken, setAuthToken] = useState(false);
  const [lensHub, setLensHub] = useState();
  const [provider, setProvider] = useState();

  return (
    <WalletContext.Provider value={{ wallet, setWallet, lensHub, setLensHub, authToken, setAuthToken, provider, setProvider }}>
      {children}
    </WalletContext.Provider>
  );
};

const useWallet = () => {
  const context = React.useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletContextProvider')
  }
  return context
}

export { WalletContextProvider, useWallet }
