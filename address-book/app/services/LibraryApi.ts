import { getBaseUrl } from '../datalayer';

export type LibraryDetails = {
  title: string;
  key: string;
  type: string;
  year: number;
};

export type LibraryRecord = {
  id: string;
  name: string;
  key: string;
  type: string;
  scan_active: boolean;
  server_link: string;
  locations: string[];
};

export type ServerInfo = {
  server: string;
  platform: string;
  version: string;
  scan_active: boolean;
  server_link: string;
};

export type ServiceInfo = {
  instanceName: string;
  serverRoot: string;
};

export class LibraryApi {
  async getPlexLibrary(options?: { key?: string }): Promise<LibraryRecord[]> {
    // const REST_URL = 'http://127.0.0.1:5002/'; // Make sure to change this to your own REST API URL

    const url = options?.key
      ? `${getBaseUrl().plexUrl.toString()}plex/libraries?key=${options.key}`
      : `${getBaseUrl().plexUrl.toString()}plex/libraries`;
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

  async getPlexLibraryDetails(key: string): Promise<LibraryRecord[]> {
    // const REST_URL = 'http://127.0.0.1:5002/'; // Make sure to change this to your own REST API URL

    // const url = `${getBaseUrl().plexUrl.toString()}plex/libraries`;
    let url = `${getBaseUrl().plexUrl.toString()}plex/libraries/${key}/details`;
    const response = await fetch(url);
    if (!response.ok) {
      console.log(response);
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.map((item: LibraryDetails) => ({
      title: item.title,
      key: item.key,
      type: item.type,
      year: item.year,
    }));
  }

  async getLibrariesAll(): Promise<LibraryRecord[]> {
    // put this in a react query

    const librariesFromApi = await this.getPlexLibrary();
    console.log(librariesFromApi);
    return librariesFromApi;
  }

  async getLibraryByKey(key: string, details: boolean): Promise<LibraryRecord | null> {
    const options = { key: key, details: details };
    const library = await this.getPlexLibrary(options);
    return library[0] || null;
  }

  async getLibraryByName(id: string): Promise<LibraryRecord | null> {
    const library = await this.getPlexLibrary();
    const foundLibrary = library.find((lib) => lib.id === id);
    if (foundLibrary) {
      return foundLibrary;
    }
    return null;
  }

  async getLibraryDetails(key: string): Promise<LibraryDetails | null> {
    const details = await this.getPlexLibraryDetails(key);
    return details;
  }

  async getServerInfo(): Promise<ServerInfo> {
    try {
      let url = `${getBaseUrl().plexUrl.toString()}plex/info`;
      const response = await fetch(url);
      if (!response.ok) {
        console.log(response);
        throw new Error('Network response was not ok');
      }
      const json: ServerInfo = await response.json();
      console.log(json);
      return json;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async getServiceInfo(): Promise<ServiceInfo[]> {
    try {
      let url = `${getBaseUrl().plexUrl.toString()}services`;
      const response = await fetch(url);
      if (!response.ok) {
        console.log(response);
        throw new Error('Network response was not ok');
      }
      const json = await response.json();
      console.log(json);
      return json;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
