import React, { useState } from 'react';

const WalletContext = React.createContext();

const WalletContextProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(false);
  const [lensHub, setLensHub] = useState();

  return (
    <WalletContext.Provider value={{ lensHub, setLensHub, authToken, setAuthToken }}>
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
