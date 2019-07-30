import { CookieStorage } from 'cookie-storage';
import StorageInterface from './StorageInterface';

export default class CookieStorageFactory extends StorageInterface {
    constructor() {
        this.storage = CookieStorage;
    }

    getItem(key) {
        this.storage.getItem(key);
    }

    removeItem(key) {
        this.storage.removeItem(key);
    }

    setItem(key, value) {
        this.storage.setItem(key, value);
    }
}
