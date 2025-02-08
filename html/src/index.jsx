import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import Main from "./main";
import "./main.css";

// Create a client
const queryClient = new QueryClient();

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <Main />
  </QueryClientProvider>,
  document.getElementById("root"),
);
