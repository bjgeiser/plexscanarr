import React from "react";
import { Outlet } from "react-router-dom";
import Banner from "./Banner";

const Layout = ({ REST_URL }) => {
  return (
    <div>
      <Banner REST_URL={REST_URL} />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
