import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksNetworkType } from '../lib/stacks-config';

interface StacksContextType {
  address: string | null;
  network: StacksNetworkType;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (network: StacksNetworkType) => void;
  userSession: UserSession | null;
}

const StacksContext = createContext<StacksContextType | undefined>(undefined);

const appConfig = new AppConfig(['store_write', 'publish_data']);

interface StacksProviderProps {
  children: ReactNode;
}

export const StacksProvider: React.FC<StacksProviderProps> = ({ children }) => {
  const [userSession] = useState(() => new UserSession({ appConfig }));
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<StacksNetworkType>('testnet');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setAddress(userData.profile.stxAddress.testnet);
      setIsConnected(true);
    }
  }, [userSession]);

  const connect = async () => {
    showConnect({
      appDetails: {
        name: 'CECD - Community Emergency Coordination Dashboard',
        icon: '/assets/ADADA-removebg-preview.png',
      },
      onFinish: () => {
        const userData = userSession.loadUserData();
        const addr = network === 'mainnet' 
          ? userData.profile.stxAddress.mainnet 
          : userData.profile.stxAddress.testnet;
        setAddress(addr);
        setIsConnected(true);
      },
      userSession,
    });
  };

  const disconnect = () => {
    userSession.signUserOut();
    setAddress(null);
    setIsConnected(false);
  };

  const switchNetwork = (newNetwork: StacksNetworkType) => {
    setNetwork(newNetwork);
    if (isConnected && userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      const addr = newNetwork === 'mainnet'
        ? userData.profile.stxAddress.mainnet
        : userData.profile.stxAddress.testnet;
      setAddress(addr);
    }
  };

  return (
    <StacksContext.Provider
      value={{
        address,
        network,
        isConnected,
        connect,
        disconnect,
        switchNetwork,
        userSession,
      }}
    >
      {children}
    </StacksContext.Provider>
  );
};

export const useStacks = () => {
  const context = useContext(StacksContext);
  if (!context) {
    throw new Error('useStacks must be used within StacksProvider');
  }
  return context;
};
