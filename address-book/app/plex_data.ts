import { matchSorter } from 'match-sorter';
// @ts-expect-error - no types, but it's a tiny function
import sortBy from 'sort-by';

export type LibraryRecord = {
  id: string;
  name: string;
  key: string;
  type: string;
  scan_active: boolean;
  server_link: string;
  locations: string[];
  favorite?: boolean;
};

const getPlexLibrary = async () => {
  const REST_URL = 'http://127.0.0.1:5002/'; // Make sure to change this to your own REST API URL

  const response = await fetch(`${REST_URL}plex/libraries`);
  return response.json();
};

const libraries = {
  records: {} as Record<string, LibraryRecord>,

  async getAll(): Promise<LibraryRecord[]> {
    // put this in a react query

    const librariesFromApi = await getPlexLibrary();
    console.log(librariesFromApi);

    librariesFromApi.forEach((library: LibraryRecord) => {
      const id = library.name.toLowerCase().split(' ').join('_');
      libraries.records[id] = { ...library, id };
    });

    return Object.keys(libraries.records)
      .map((key) => libraries.records[key])
      .sort(sortBy('name'));
  },

  async get(id: string): Promise<LibraryRecord | null> {
    const librariesFromApi = await getPlexLibrary();
    librariesFromApi.forEach((library: LibraryRecord) => {
      const id = library.name.toLowerCase().split(' ').join('_');
      libraries.records[id] = { ...library, id };
    });
    return libraries.records[id] || null;
  },
};

export async function getLibraries(query?: string | null) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  let libraryList = await libraries.getAll();
  if (query) {
    libraryList = matchSorter(libraryList, query, {
      keys: ['name'],
    });
  }
  return libraryList.sort(sortBy('name', 'createdAt'));
}

export async function getLibrary(id: string): Promise<LibraryRecord | null> {
  return libraries.get(id);
}
