import LocalStorageAdapter from '../Adapters/LocalStorageAdapter';
import CookieStorageAdapter from '../Adapters/CookieStorageAdapter';

export default class StorageFactory {
  getStorage(storageType) {
    switch (storageType) {
      case "cookies": {
        return new CookieStorageAdapter();
      }
      case "local-storage": {
        return new LocalStorageAdapter();
      }
      default: {
        console.error('Storage type option is invalid');
      }
    }
  }
}