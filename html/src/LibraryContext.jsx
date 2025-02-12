import React, { createContext, useContext, useState } from "react";

const LibraryContext = createContext();

export const LibraryProvider = ({ children }) => {
  const [libraryState, setLibraryState] = useState([]);

  return <LibraryContext.Provider value={[libraryState, setLibraryState]}>{children}</LibraryContext.Provider>;
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return context;
};
