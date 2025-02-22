import { getBaseUrl } from '../datalayer';

export type LibraryDetails = {
  title: string;
  key: string;
  type: string;
  year: number;
  locations?: string[];
  size?: number;
};

export type LibraryRecord = {
  path: string;
  name: string;
  key: string;
  type: string;
  scan_active: boolean;
  server_link: string;
  locations?: string[];
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
  server_root: string;
};

export class LibraryApi {
  async getPlexLibrary(options?: { key?: string }): Promise<LibraryRecord[]> {
    // const REST_URL = 'http://127.0.0.1:5002/'; // Make sure to change this to your own REST API URL

    const url = options?.key
      ? `${getBaseUrl().plexUrl.toString()}plex/libraries?key=${options.key}`
      : `${getBaseUrl().plexUrl.toString()}plex/libraries`;
    console.log('url:', url);
    const response = await fetch(url);
    console.log('response', response);
    if (!response.ok) {
      console.log(response);
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  }

  async getPlexLibraryDetails(key: string): Promise<LibraryRecord[]> {
    // const REST_URL = 'http://127.0.0.1:5002/'; // Make sure to change this to your own REST API URL

    // const url = `${getBaseUrl().plexUrl.toString()}plex/libraries`;
    let url = `${getBaseUrl().plexUrl.toString()}plex/libraries/${key}/details`;
    console.log('url:', url);
    const response = await fetch(url);
    if (!response.ok) {
      console.log(response);
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
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

  async getLibraryByPath(path: string): Promise<LibraryRecord | null> {
    const library = await this.getPlexLibrary();
    const foundLibrary = library.find((lib) => lib.path === path);
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
      console.log('url:', url);
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
      console.log('url:', url);
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

  async startScan(library?: LibraryRecord): Promise<void> {
    try {
      let url = library
        ? `${getBaseUrl().plexUrl.toString()}plex/libraries/${library.key}/scan`
        : `${getBaseUrl().plexUrl.toString()}plex/libraries/scan`;
      console.log('url:', url);
      const response = await fetch(url, { method: 'POST' });
      if (!response.ok) {
        console.log(response);
        throw new Error('Network response was not ok');
      }
      console.log('Scan started:', library);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async cancelScan(library?: LibraryRecord): Promise<void> {
    try {
      let url = library
        ? `${getBaseUrl().plexUrl.toString()}plex/libraries/${library.key}/scan`
        : `${getBaseUrl().plexUrl.toString()}plex/libraries/scan`;
      console.log('url:', url);
      const response = await fetch(url, { method: 'DELETE' });
      if (!response.ok) {
        console.log(response);
        throw new Error('Network response was not ok');
      }
      console.log('Scan cancelled:', library);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
