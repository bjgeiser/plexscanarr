import { React, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import Main from "./main";
import "./main.css";
import { LibraryRoutes } from "./Libraries";
import { LibraryProvider } from "./LibraryContext";

const queryClient = new QueryClient();

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <LibraryProvider>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        {/* <Main /> */}
        <LibraryRoutes />
      </HashRouter>
    </QueryClientProvider>
  </LibraryProvider>,
);
