import { Form } from 'react-router';

import type { LibraryRecord } from '../plex_data';

import { getLibrary } from '../plex_data';
import type { Route } from './+types/contact';

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const library = await getLibrary(params.libraryId);
  if (!library) {
    throw new Response('Not Found', { status: 404 });
  }
  return { library };
}

export default function Library({ loaderData }: Route.ComponentProps) {
  const { library }: { library: LibraryRecord } = loaderData;

  return (
    <div id="library">
      <div>
        <img
        // TODO load the avatar
        // alt={`${libraryList.first} ${libraryList.last} avatar`}
        // key={libraryList.avatar}
        // src={libraryList.avatar}
        />
      </div>

      <div>
        <h1>
          {library.name ? <>{library.name}</> : <i>No Name</i>}
          <Favorite library={library} />
        </h1>

        {library.server_link ? (
          <p>
            <a href={library.server_link}>Link</a>
          </p>
        ) : null}

        {library.locations ? <p>{library.locations}</p> : null}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>

          <Form
            action="destroy"
            method="post"
            onSubmit={(event) => {
              const response = confirm('Please confirm you want to delete this record.');
              if (!response) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

function Favorite({ library }: { library: Pick<LibraryRecord, 'favorite'> }) {
  const favorite = library.favorite;

  return (
    <Form method="post">
      <button
        aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
        name="favorite"
        value={favorite ? 'false' : 'true'}
      >
        {favorite ? '★' : '☆'}
      </button>
    </Form>
  );
}
