import React, { createContext, useState, ReactNode } from 'react';

interface InternetIdentityContextType {
  isAuthenticated: boolean;
  principal?: string;
  login: () => void;
  logout: () => void;
}

const InternetIdentityContext = createContext<InternetIdentityContextType | undefined>(undefined);

export const InternetIdentityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState<string>();

  const login = async () => {
    try {
      // Placeholder for Internet Identity login logic
      setIsAuthenticated(true);
      setPrincipal('user-principal-id');
    } catch (error) {
      console.error('Internet Identity login failed:', error);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setPrincipal(undefined);
  };

  return (
    <InternetIdentityContext.Provider value={{ isAuthenticated, principal, login, logout }}>
      {children}
    </InternetIdentityContext.Provider>
  );
};

export const useInternetIdentity = (): InternetIdentityContextType => {
  const context = React.useContext(InternetIdentityContext);
  if (!context) {
    throw new Error('useInternetIdentity must be used within InternetIdentityProvider');
  }
  return context;
};
