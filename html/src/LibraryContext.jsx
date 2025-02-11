import React, { createContext, useState, useContext } from "react";

const LibraryContext = createContext();

export const LibraryProvider = ({ children }) => {
  const [libraryState, setLibraryState] = useState([]);

  return <LibraryContext.Provider value={{ libraryState, setLibraryState }}>{children}</LibraryContext.Provider>;
};

export const useLibrary = () => useContext(LibraryContext);
