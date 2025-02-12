import React, { createContext, useState, useContext } from "react";

// Create the context
const LibraryContext = createContext();

// LibraryProvider component that wraps children and provides state and updater
export const LibraryProvider = ({ children }) => {
  const [libraryState, setLibraryState] = useState([]);

  return <LibraryContext.Provider value={{ libraryState, setLibraryState }}>{children}</LibraryContext.Provider>;
};

// Custom hook to consume the library context
export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return context;
};

export default LibraryContext;
