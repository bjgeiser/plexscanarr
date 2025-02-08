// index.js

import React from "react";
import './main.css';

import { createRoot } from "react-dom/client";
import Main from "./main";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<Main />);