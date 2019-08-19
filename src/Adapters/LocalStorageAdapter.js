import localStorage from 'localStorage';
import StorageInterface from './StorageInterface';

export default class LocalStorageAdapter extends StorageInterface {
    constructor() {
        super();
        this.storage = localStorage;
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
