export default class Storage {
    constructor() {
        this.storage = {};
    }

    setStorage(storage) {
        this.storage = storage;
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