import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Routes, Route, HashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

import "./main.css";
import { LibraryProvider, useLibrary } from "./LibraryContext";
import Main, { fetchLibraries, toRoutePath } from "./main";
import Layout from "./Layout";
import Details from "./Details";
import Library from "./Library";

// Your App component uses the custom useLibrary hook to set the routes.
const App = () => {
  const { libraryState, setLibraryState } = useLibrary();

  useEffect(() => {
    const fetchAndSetLibraries = async () => {
      const libraries = await fetchLibraries();
      console.log("index - Libraries fetched:", libraries);
      setLibraryState(libraries);
    };

    fetchAndSetLibraries();
  }, [setLibraryState]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Main />} />
        <Route element={<Library />} path=":libraryName" />
      </Route>
    </Routes>
  );
};

// Initialize react-query client
const queryClient = new QueryClient();

// Render the app. LibraryProvider makes the library state available to all components inside your app.
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <LibraryProvider>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <App />
      </HashRouter>
    </QueryClientProvider>
  </LibraryProvider>,
);
