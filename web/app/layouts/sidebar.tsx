import { Form, Link, Outlet, useNavigation } from 'react-router';
import type { Route } from './+types/sidebar';
import { useLibrary } from '../modules/LibraryContext';
import { datalayer } from '../datalayer';
import { useEffect, useState, useRef } from 'react';
import { getBaseUrl } from '../datalayer';
import { type ServerInfo, type ServiceInfo } from '../services/LibraryApi';
import { usePlexMessage } from '../modules/PlexMessageContext';

export default function SidebarLayout({ loaderData }: Route.ComponentProps) {
  // const { availableLibraries: listOfLibraries } = loaderData;
  const { libraryState, setLibraryState } = useLibrary();
  const navigation = useNavigation();
  const [messageHistory, setMessageHistory] = useState([]); // TODO move this to a context
  const logIndexRef = useRef(0);
  const plexWS = getBaseUrl().plexWS.toString();
  const plexMessage = usePlexMessage();
  const [serverInfo, setServerInfo] = useState<ServerInfo>({
    server: '',
    platform: '',
    version: '',
    scan_active: false,
    server_link: '',
  });
  const [serviceInfo, setServiceInfo] = useState<ServiceInfo[]>([]);

  // TODO how to move this out of useEffect
  useEffect(() => {
    datalayer.libraryApi
      .getPlexLibrary()
      .then((data) => {
        setLibraryState(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [plexMessage]);

  return (
    <>
      <div className="card bg-base-300 rounded-box h-fit  h-max-fit w-fit mt-5 ml-5 place-items-center">
        <div>
          {Array.isArray(libraryState) && libraryState.length > 0 ? (
            <table className="table-sm">
              <thead>
                <tr className="text-left text-orange-300 text-sm">
                  <th>Library Name</th>
                  <th>Type</th>
                  <th>Locations</th>
                  <th>Scan</th>
                </tr>
              </thead>
              <tbody>
                {libraryState.map((library) => {
                  //console.log("Library:", library);
                  return (
                    <tr key={library.key}>
                      <td>
                        <div className="dropdown dropdown-hover font-bold">
                          <div tabIndex={0} role="button" className="">
                            {library.name}
                          </div>
                          <ul
                            tabIndex={0}
                            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-48 p-2 shadow"
                          >
                            <li>
                              <Link
                                to={`library/${library.path}`}
                                onClick={() => (document.activeElement as HTMLElement)?.blur()}
                              >
                                Open Details
                              </Link>
                            </li>
                            <li>
                              <Link
                                to={library.server_link}
                                target="_blank"
                                onClick={() => (document.activeElement as HTMLElement)?.blur()}
                              >
                                Open on Plex Server
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </td>
                      <td>
                        <div className="font-medium">{library.type}</div>
                      </td>
                      <td>
                        {library.locations.map((loc: string, index: number) => (
                          <div key={index} className="text-sm opacity-50">
                            {loc}
                          </div>
                        ))}
                      </td>
                      <td>
                        {library.scan_active ? (
                          <div className="dropdown dropdown-hover">
                            <div
                              tabIndex={0}
                              role="button"
                              id={'active_' + library.key + '_scanning'}
                              className="text-sm font-bold text-orange-600"
                            >
                              Scanning
                            </div>
                            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] p-2 shadow">
                              <li>
                                <button
                                  id={'active_' + library.key + '_stop_scanning'}
                                  onClick={() => datalayer.libraryApi.cancelScan(library)}
                                  className="text-sm font-bold"
                                >
                                  Stop
                                </button>
                              </li>
                            </ul>
                          </div>
                        ) : (
                          <button
                            id={'active_' + library.key + '_not_scanning'}
                            className="text-sm font-bold"
                            onClick={() => datalayer.libraryApi.startScan(library)}
                          >
                            Scan
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div>No libraries available.</div>
          )}
        </div>
      </div>
      <div className={"flex w-full h-max-content mr-5 ml-5 mt-5 bg-black rounded-box"} id="detail">
        <div className={navigation.state === 'loading' ? 'flex w-full items-center justify-center' : 'flex w-full items-start'}>
          <div className={navigation.state === 'loading' ? "" : "hidden "  + ""}>
            <span className="loading loading-bars loading-lg"></span>
          </div>
          <div className={navigation.state === 'loading' ? "hidden" : "flex w-full"}>
              <Outlet/>
          </div>
        </div>
      </div>
    </>
  );
}
