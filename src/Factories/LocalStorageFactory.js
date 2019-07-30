import localStorage from 'localStorage';
import AbstractStorageFactory from './AbstractStorageFactory';

export default class LocalStorageFactory extends AbstractStorageFactory {
    constructor() {
        this.storage = localStorage;
    }
}
