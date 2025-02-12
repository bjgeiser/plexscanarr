import React from "react";
import { Outlet } from "react-router-dom";
import Banner from "./Banner";

const Layout = () => {
  return (
    <div>
      <Banner />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
