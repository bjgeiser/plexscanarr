import { LibraryApi } from './LibraryApi';

class DataLayerService {
  libraryApi: LibraryApi;

  constructor() {
    this.libraryApi = new LibraryApi();
  }
}

export function createDataLayerService() {
  return new DataLayerService();
}
