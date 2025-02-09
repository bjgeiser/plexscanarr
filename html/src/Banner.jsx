import React, { useState, useCallback, useEffect, useRef } from "react";
import PlexscanarrIcon from "./img/favicon.png";
import { useNavigate } from "react-router-dom";

const Banner = ({ REST_URL }) => {
  const [version, setVersion] = useState("Unknown");
  const [os, setOs] = useState("Unknown");
  const [server, setServer] = useState("Unknown");
  const [scanActive, setScanActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleDetailsClick = () => {
    navigate("/details");
  };

  const handleScanClick = () => {
    console.log("Scan clicked for GLOBAL");

    fetch(`${REST_URL}plex/libraries`, { method: "POST" });
    //   .then((response) => response.json())
    //   .then((data) => {
    //     console.log("Scan started:", data);
    //     queryClient.invalidateQueries("scanStatus");
    //   })
    //   .catch((error) => {
    //     console.error("Error starting scan:", error);
    //   });
  };

  useEffect(() => {
    console.log("Child component mounted or updated");
    const getServerInfo = async () => {
      try {
        const response = await fetch(REST_URL + "plex/info");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        setOs(json["platform"]);
        setServer(json["server"]);
        setVersion(json["version"]);
        setScanActive(json["scan_active"]);
        console.log(json);
      } catch (e) {
        console.error(e);
      }
    };

    getServerInfo();
  }, []);

  return (
    <div className="navbar bg-base-200">
      <div className="avatar">
        <div className="m-2 w-10">
          <button onClick={() => handleHomeClick()}>
            <img src={PlexscanarrIcon} alt="Plexscanarr Icon" />
          </button>
        </div>
      </div>
      <div className="flex-1">
        <button onClick={() => handleHomeClick()}>
          <a className="btn btn-ghost text-xl">Plexscanarr</a>
        </button>
      </div>
      <div className="flex-none">
        <div></div>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li>
            <h1>Server: {server}</h1>
          </li>
          <li>
            <h1>Server Platform: {os}</h1>
          </li>
          <li>
            <h1>Version: {version}</h1>
          </li>
          <li className="flex flex-row">
            <h1>Scan Active: </h1>
            {scanActive ? (
              <div>
                <div id="active_scan_scanning" className="text-sm font-bold text-orange-600">
                  Scanning
                </div>
                <button id="active_stop_scanning" className="text-sm font-bold">
                  Stop
                </button>
              </div>
            ) : (
              <div>
                <button id="active_scan_not_scanning" className="text-sm font-bold" onClick={() => handleScanClick()}>
                  Scan
                </button>
              </div>
            )}
          </li>
          <li>
            <button id="details_button" className="text-sm font-bold" onClick={() => handleDetailsClick()}>
              Details
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Banner;
