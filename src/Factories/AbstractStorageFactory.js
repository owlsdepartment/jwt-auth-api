export default class StorageFactoryAbstract {
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