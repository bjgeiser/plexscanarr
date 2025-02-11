import React, { useState, useCallback, useEffect, useRef } from "react";
import PlexscanarrIcon from "./img/favicon.png";
import { useNavigate } from "react-router-dom";

const Banner = ({ REST_URL }) => {
  const [serverInfo, setServerInfo] = useState({});
  const [serviceInfo, setServiceInfo] = useState([]);
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
        setServerInfo(json);
        console.log(json);

        const response2 = await fetch(REST_URL + "services");
        if (!response2.ok) {
          throw new Error(`HTTP error! status: ${response2.status}`);
        }
        const json2 = await response2.json();
        console.log(json2);
        setServiceInfo(json2);
      } catch (e) {
        console.error(e);
      }
    };

    getServerInfo();
  }, []);

  return (
    <div className="navbar bg-base-200">
      <div className="avatar">
        <div className="m-2 w-8">
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
            <h1 onClick={() => window.open(serverInfo.server_link, "_blank")}>
              <p className="text-sm font-bold">SERVER:</p> {serverInfo.server}
            </h1>
          </li>
          <li>
            <h1>
              <p className="text-sm font-bold">SERVER PLATFORM:</p> {serverInfo.platform}
            </h1>
          </li>
          <li>
            <h1 onClick={() => window.open("https://forums.plex.tv/t/plex-media-server/30447/10000", "_blank")}>
              <p className="text-sm font-bold">VERSION:</p> {serverInfo.version}

            </h1>
          </li>
          {serviceInfo.length > 0 ? (
            <li>
              <div className="dropdown dropdown-bottom font-bold">
                <div tabIndex={0} role="button" className="">
                  <h1>
                    <p className="text-sm font-bold">SERVICES</p>
                  </h1>
                </div>
                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                  {serviceInfo.map((service) => {
                    return (
                      <li>
                        <button className="text-sm font-bold" onClick={() => window.open(service["server-root"], "_blank")}>
                          {service["instance-name"]}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </li>
          ) : null}
          <li className="flex flex-row">
            <h1>Scan Active: </h1>
            {serverInfo.scan_active ? (
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
