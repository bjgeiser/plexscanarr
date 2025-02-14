import { Form, Link, Outlet, useNavigation } from 'react-router';
import { getLibraries } from '../plex_data';
import type { Route } from './+types/sidebar';
import { useLibrary } from '../modules/LibraryContext';
import { datalayer } from '../datalayer';
import { useEffect, useState, useRef } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { getBaseUrl } from '../datalayer';

// export async function clientLoader() {
//   const libraryList = await getLibraries();
//   console.log('clientLoader', libraryList);
//   return { availableLibraries: libraryList };
// }

export default function SidebarLayout({ loaderData }: Route.ComponentProps) {
  // const { availableLibraries: listOfLibraries } = loaderData;
  const { libraryState, setLibraryState } = useLibrary();
  const navigation = useNavigation();
  const [messageHistory, setMessageHistory] = useState([]); // TODO move this to a context
  const logIndexRef = useRef(0);
  const plexWS = getBaseUrl().plexWS.toString();

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
  }, []);

  return (
    <>
      <div id="sidebar">
        <h1>
          {/* The icon is in the css h1::before */}
          <Link to="about">Plex Scanarr</Link>
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
