import React, { createContext, useState, useContext, type ReactNode } from 'react';

export type PlexMessageContextType = {
  id: string;
  name: string;
  key: string;
};

// Create the context
const PlexMessageContext = createContext<{
  plexMessage: PlexMessageContextType[];
  setPlexMessage: React.Dispatch<React.SetStateAction<PlexMessageContextType[]>>;
}>({
  plexMessage: [],
  setPlexMessage: () => [],
});

// LibraryProvider component that wraps children and provides state and updater
export const PlexMessageProvider = ({ children }: { children: ReactNode }) => {
  const [plexMessage, setPlexMessage] = useState<PlexMessageContextType[]>([]);

  return <PlexMessageContext.Provider value={{ plexMessage: plexMessage, setPlexMessage: setPlexMessage }}>{children}</PlexMessageContext.Provider>;
};

// Custom hook to consume the library context
export const usePlexMessage = () => {
  const context = useContext(PlexMessageContext);
  if (!context) {
    throw new Error('usePlexMessage must be used within a PlexMessageProvider');
  }
  return context;
};

export default PlexMessageContext;
