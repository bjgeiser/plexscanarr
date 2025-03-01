import { getBaseUrl } from '../datalayer';
import { type ServiceInfo } from './LibraryApi'
import * as events from "node:events";

export type PathConverters = {
  download_path: string;
  plex_path: string;
};


export type Config = {
  plex_server: string;
  plex_token: string;
  path_converters: PathConverters[];
  port: number;
  listen_address: string;
  preempt_active_scan: boolean;
  arr_paths: ServiceInfo[];
  verbose: boolean;
  cache_plex_notifications: boolean;
  calculate_library_sizes: boolean;
  calculate_item_sizes: boolean;
  include_item_locations: boolean;
};



export class ConfigApi {
  config: Config

  async getConfig(): Promise<Config> {

    const url = `${getBaseUrl().plexUrl.toString()}settings/`
    console.log('url:', url);
    const response = await fetch(url);
    console.log('response', response);
    if (!response.ok) {
      console.log(response);
      throw new Error('Network response was not ok');
    }

    this.config = await response.json();
    return this.config;
  }

  async setCachePlexNotifications(enable: boolean): Promise<void> {
    //http://127.0.0.1:5000/settings/enable_plex_notification_cache?enable=true
    let url = `${getBaseUrl().plexUrl.toString()}settings/enable_plex_notification_cache?enable=${enable}`
    console.log('url:', url);
    const response = await fetch(url, { method: 'POST' });
    if (!response.ok) {
      console.log(response);
      throw new Error('Network response was not ok');
    }
    else {
      await this.getConfig();
    }
  }

  async setEnableLibrarySizes(enable: boolean): Promise<void> {
    let url = `${getBaseUrl().plexUrl.toString()}settings/enable_library_sizes?enable=${enable}`
    console.log('url:', url);
    const response = await fetch(url, { method: 'POST' });
    if (!response.ok) {
      console.log(response);
      throw new Error('Network response was not ok');
    }
    else {
      await this.getConfig();
    }
  }

  async setEnableItemSizes(enable: boolean): Promise<void> {
    let url = `${getBaseUrl().plexUrl.toString()}settings/enable_item_sizes?enable=${enable}`
    console.log('url:', url);
    const response = await fetch(url, { method: 'POST' });
    if (!response.ok) {
      console.log(response);
      throw new Error('Network response was not ok');
    }
    else {
      await this.getConfig();
    }
  }

  async setIncludeItemLocations(enable: boolean): Promise<void> {
    let url = `${getBaseUrl().plexUrl.toString()}settings/enable_include_item_locations?enable=${enable}`
    console.log('url:', url);
    const response = await fetch(url, { method: 'POST' });
    if (!response.ok) {
      console.log(response);
      throw new Error('Network response was not ok');
    }
    else {
      await this.getConfig();
    }
  }

}
