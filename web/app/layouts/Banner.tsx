import { Form, Link, Outlet, useNavigation } from 'react-router';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import PlexscanarrIcon from '/img/favicon.png';
import { useLibrary } from '../modules/LibraryContext';
import { usePlexMessage } from '../modules/PlexMessageContext';
import { datalayer } from '../datalayer';
import type { Route } from './+types/Banner';
import { type ServerInfo, type ServiceInfo } from '../services/LibraryApi';

export function Banner({ loaderData }: Route.ComponentProps) {
  const { libraryState } = useLibrary();

  const [serverInfo, setServerInfo] = useState<ServerInfo>({});
  const [serviceInfo, setServiceInfo] = useState<{ instance_name: string; server_root: string }[]>([]);
  const plexMessage = usePlexMessage();

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
    console.log('Banner - load');
    datalayer.libraryApi
      .getServiceInfo()
      .then((data) => {
        setServiceInfo(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    console.log('Banner - new plex msg:', plexMessage);
    datalayer.libraryApi
      .getServerInfo()
      .then((data) => {
        setServerInfo(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [plexMessage]);

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
      <div className="flex flex-col">
        <div className="navbar bg-base-200">
          <div className="avatar">
            <div className="m-2 w-8">
              <Link to="/" className="text-sm font-bold">
                <img src={PlexscanarrIcon} alt="Plexscanarr Icon" />
              </Link>
            </div>
          </div>
          <div className="flex-1">
            <Link to="/" className="text-sm font-bold">
              <p className="btn btn-ghost text-xl">Plexscanarr</p>
            </Link>
          </div>
          <div className="flex-none">
            <ul className="menu menu-horizontal px-4 flex items-center space-x-4">
              <li>
                <div>
                  <Link to={serverInfo.server_link || '#'} target="_blank" className="text-sm font-bold">
                    SERVER: {serverInfo.server}
                  </Link>
                </div>
              </li>
              <li>
                <div>
                  <Link to={serverInfo.server_link || '#'} target="_blank" className="text-sm font-bold">
                    SERVER PLATFORM: {serverInfo.platform}
                  </Link>
                </div>
              </li>
              <li>
                <Link
                  to="https://forums.plex.tv/t/plex-media-server/30447/10000"
                  target="_blank"
                  className="text-sm font-bold"
                >
                  VERSION: {serverInfo.version}
                </Link>
              </li>
              {serviceInfo.length > 0 ? (
                <li>
                  <div className="dropdown dropdown-bottom font-bold">
                    <div tabIndex={0} role="button" className="">
                      <p className="text-sm font-bold">SERVICES</p>
                    </div>
                    <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-32 p-2 shadow">
                      {serviceInfo.map((service) => {
                        return (
                          <li key={service.instance_name}>
                            <Link to={service.server_root} target="_blank" className="text-sm font-bold">
                              {service.instance_name}
                            </Link>
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
                        <button onClick={() => datalayer.libraryApi.cancelScan()} className="text-sm font-bold">
                          Stop
                        </button>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <button className="text-sm font-bold" onClick={() => datalayer.libraryApi.startScan()}>
                    SCAN ALL
                  </button>
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="flex flex-1">
        <Outlet />
      </div>
    </div>
  );
}

export default Banner;
