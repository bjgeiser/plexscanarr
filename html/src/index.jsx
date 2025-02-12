import { React, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { HashRouter, Route, Routes } from "react-router-dom";

import Main from "./main";
import "./main.css";
import { LibraryProvider, useLibrary } from "./LibraryContext";
import Layout from "./Layout";
import Details from "./Details";
import Library from "./Library";

const queryClient = new QueryClient();

const container = document.getElementById("root");
const root = createRoot(container);

const App = () => {
  const { libraryState } = useLibrary();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Main />} />
        <Route path="details" element={<Details />} />
        {Array.isArray(libraryState) && libraryState.map((library) => <Route key={library.name} path={toRoutePath(library.name)} element={<Library library={library} />} />)}
      </Route>
    </Routes>
  );
};

root.render(
  <LibraryProvider>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <App />
      </HashRouter>
    </QueryClientProvider>
  </LibraryProvider>,
);
