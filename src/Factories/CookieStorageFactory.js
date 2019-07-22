import { CookieStorage } from 'cookie-storage';
import AbstractStorageFactory from './AbstractStorageFactory';

export default class CookieStorageFactory extends AbstractStorageFactory {
    constructor() {
        this.storage = CookieStorage;
    }
}