import { LibraryApi } from './LibraryApi';
import {ConfigApi} from "./ConfigApi";

class DataLayerService {
  libraryApi: LibraryApi;
  configApi: ConfigApi;

  constructor() {
    this.libraryApi = new LibraryApi();
    this.configApi = new ConfigApi();

    this.configApi
        .getConfig()
        .then((data) => {console.log("config loaded")})
        .catch((error) => {
          console.error(error);
        });


  }
}

export function createDataLayerService() {
  return new DataLayerService();
}
