import { LibraryApi } from './LibraryApi';
import {ConfigApi} from "./ConfigApi";

class DataLayerService {
  libraryApi: LibraryApi;
  configApi: ConfigApi;


  constructor() {
    this.libraryApi = new LibraryApi();
    this.configApi = new ConfigApi();
  }
}

export function createDataLayerService() {
  return new DataLayerService();
}
