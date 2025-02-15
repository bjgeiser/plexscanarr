import { Form, Link, Outlet, useNavigation } from 'react-router';
import type { Route } from './+types/sidebar';
import { useLibrary } from '../modules/LibraryContext';
import { datalayer } from '../datalayer';
import { useEffect, useState, useRef } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { getBaseUrl } from '../datalayer';
import { type ServerInfo, type ServiceInfo } from '../services/LibraryApi';

export default function SidebarLayout({ loaderData }: Route.ComponentProps) {
  // const { availableLibraries: listOfLibraries } = loaderData;
  const { libraryState, setLibraryState } = useLibrary();
  const navigation = useNavigation();
  const [messageHistory, setMessageHistory] = useState([]); // TODO move this to a context
  const logIndexRef = useRef(0);
  const plexWS = getBaseUrl().plexWS.toString();
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

  return (
    <>
      <div className="card bg-base-300 rounded-box h-fit  h-max-fit w-fit place-items-center">
        <h1>
          {/* The icon is in the css h1::before */}
          <div>
            Server: {serverInfo.server} - Platform: {serverInfo.platform}
            Verion: {serverInfo.version}
          </div>
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
                          onClick={() => window.open(service['serverRoot'], '_blank')}
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
          {/* <Link to="about">Plex Scanarr</Link> */}
        </h1>
        <div>
          <Form id="search-form" role="search">
            <input aria-label="Search libraries" id="q" name="q" placeholder="Search" type="search" />
            <div aria-hidden hidden={true} id="search-spinner" />
          </Form>
          {/* TODO delete this */}
          <Form method="post">
            <button type="submit">New</button>
          </Form>
        </div>
        <nav>
          {libraryState.length ? (
            <ul>
              {libraryState.map((library) => (
                <li key={library.name}>
                  <Link to={`library/${library.id}`}>
                    {library.name || library.type ? <>{library.name}</> : <i>No Name</i>}
                    {library.server_link ? <span>★</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <i>No libraries</i>
            </p>
          )}
        </nav>
      </div>
      <div className={navigation.state === 'loading' ? 'loading' : ''} id="detail">
        <Outlet />
      </div>
    </>
  );
}
