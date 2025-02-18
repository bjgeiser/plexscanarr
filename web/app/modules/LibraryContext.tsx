import React, { createContext, useState, useContext, type ReactNode } from 'react';

export type LibraryRecord = {
  id: string;
  name: string;
  key: string;
  type: string;
  scan_active: boolean;
  server_link: string;
  locations?: string[];
  path?: string;
};

// Create the context
const LibraryContext = createContext<{
  libraryState: LibraryContextType[];
  setLibraryState: React.Dispatch<React.SetStateAction<LibraryContextType[]>>;
}>({
  libraryState: [],
  setLibraryState: () => [],
});

// LibraryProvider component that wraps children and provides state and updater
export const LibraryProvider = ({ children }: { children: ReactNode }) => {
  const [libraryState, setLibraryState] = useState<LibraryContextType[]>([]);

  return <LibraryContext.Provider value={{ libraryState, setLibraryState }}>{children}</LibraryContext.Provider>;
};

// Custom hook to consume the library context
export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};

export default LibraryContext;
