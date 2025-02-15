import { Form, Link, Outlet, useNavigation } from 'react-router';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import PlexscanarrIcon from '../img/favicon.png';
import { useLibrary } from '../modules/LibraryContext';
import { datalayer } from '../datalayer';
import { data } from 'react-router';
import type { Route } from './+types/Banner';

export function Banner({ loaderData }: Route.ComponentProps) {
  const { libraryState } = useLibrary();

  const [serverInfo, setServerInfo] = useState({});
  const [serviceInfo, setServiceInfo] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleScanClick = () => {
    console.log('Scan clicked for GLOBAL');
    // TODO add to datalayer?
    // fetch(`${REST_URL}plex/libraries/scan`, { method: 'POST' });
    //   .then((response) => response.json())
    //   .then((data) => {
    //     console.log("Scan started:", data);
    //     queryClient.invalidateQueries("scanStatus");
    //   })
    //   .catch((error) => {
    //     console.error("Error starting scan:", error);
    //   });
  };

  const handleCancelScanClick = () => {
    console.log('Cancel clicked for');

    // fetch(`${REST_URL}plex/libraries/scan`, { method: 'DELETE' })
    //   .then((response) => response.json())
    //   .then((data) => {
    //     console.log('Scan canceled:');
    //   })
    //   .catch((error) => {
    //     console.error('Error starting scan:', error);
    //   });
  };

  useEffect(() => {
    console.log('Child component mounted or updated');
    datalayer.libraryApi
      .getServerInfo()
      .then((data) => {
        setServerInfo(data);
      })
      .catch((error) => {
        console.error(error);
      });
    datalayer.libraryApi
      .getServiceInfo()
      .then((data) => {
        setServiceInfo(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  //   useEffect(() => {
  //     console.log('Updating library list: ', libraryState);
  //     const isAnyLibraryScanning =
  //       Array.isArray(libraryState) && libraryState.length > 0
  //         ? libraryState.some((library) => library.scan_active)
  //         : false;
  //     setServerInfo((prevState) => ({
  //       ...prevState,
  //       scan_active: isAnyLibraryScanning,
  //     }));
  //   }, [libraryState]);

  return (
    <div>
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
              <h1 onClick={() => window.open(serverInfo.server_link, '_blank')}>
                <p className="text-sm font-bold">SERVER:</p> {serverInfo.server}
              </h1>
            </li>
            <li>
              <h1>
                <p className="text-sm font-bold">SERVER PLATFORM:</p> {serverInfo.platform}
              </h1>
            </li>
            <li>
              <h1 onClick={() => window.open('https://forums.plex.tv/t/plex-media-server/30447/10000', '_blank')}>
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
                  <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-32 p-2 shadow">
                    {serviceInfo.map((service) => {
                      return (
                        <li key={service.instanceName}>
                          <button
                            className="text-sm font-bold"
                            onClick={() => window.open(service['server-root'], '_blank')}
                          >
                            {service.instanceName}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            ) : null}
            <li className="flex flex-row">
              {serverInfo.scan_active ? (
                <div className="dropdown dropdown-bottom dropdown-hover">
                  <div tabIndex={0} role="button" className="text-sm font-bold text-orange-600">
                    SCANNING
                  </div>
                  <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] p-2 shadow">
                    <li>
                      <button onClick={() => handleCancelScanClick()} className="text-sm font-bold">
                        Stop
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <button className="text-sm font-bold" onClick={() => handleScanClick()}>
                  SCAN ALL
                </button>
              )}
            </li>
          </ul>
        </div>
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Banner;
