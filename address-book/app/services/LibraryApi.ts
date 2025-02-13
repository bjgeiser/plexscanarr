import { getBaseUrl } from '../datalayer';

export type LibraryRecord = {
  id: string;
  name: string;
  key: string;
  type: string;
  scan_active: boolean;
  server_link: string;
  locations: string[];
};

export class LibraryApi {
  async getPlexLibrary(options?: { key?: string }): Promise<LibraryRecord[]> {
    // const REST_URL = 'http://127.0.0.1:5002/'; // Make sure to change this to your own REST API URL

    const url = `${getBaseUrl().plexUrl.toString()}plex/libraries`;
    // const url = options?.key
    //   ? `${getBaseUrl().plexUrl.toString()}plex/libraries?key=${options.key}`
    //   : `${getBaseUrl().plexUrl.toString()}plex/libraries`;
    const response = await fetch(url);
    if (!response.ok) {
      console.log(response);
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.map((item: LibraryRecord) => ({
      id: item.name.toLowerCase().split(' ').join('_'),
      name: item.name,
      key: item.key,
      type: item.type,
      scan_active: item.scan_active,
      server_link: item.server_link,
      locations: item.locations,
    }));
  }

  async getAll(): Promise<LibraryRecord[]> {
    // put this in a react query

    const librariesFromApi = await this.getPlexLibrary();
    console.log(librariesFromApi);
    return librariesFromApi;
  }

  async get(id: string): Promise<LibraryRecord | null> {
    const options = { key: id };
    const library = await this.getPlexLibrary(options);
    return library[0] || null;
  }
}
