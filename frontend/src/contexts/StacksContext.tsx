import React, { createContext, useContext, useState, ReactNode } from 'react';

interface StacksContextType {
  address: string | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const StacksContext = createContext<StacksContextType | undefined>(undefined);

interface StacksProviderProps {
  children: ReactNode;
}

export const StacksProvider: React.FC<StacksProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = async () => {
    setAddress('STX_CONNECTED');
    setIsConnected(true);
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
  };

  return (
    <StacksContext.Provider value={{ address, isConnected, connect, disconnect }}>
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
