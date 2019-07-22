import CookieStorageFactory from '../Factories/CookieStorageFactory';
import LocalStorageFactory from '../Factories/LocalStorageFactory';
import Storage from '../Utils/Storage';
import jwtDecode from 'jwt-decode';

function makeStorageKey(key, ns) {
  return ns ? `${ns}_${key}` : key;
}

export default class Token {
  constructor(refreshUrl, refreshTTL, storageType, storageNamespace) {
    this.refreshUrl = refreshUrl;
    this.decodedToken = null
    this.tokenExp = 0;
    this.tokenIat = 0;
    this.refreshTTL = refreshTTL;
    this.storageNamespace = storageNamespace;
    this.storage = new Storage();
    this.resolveStorage(storageType);
    this.init();
  }

  init() {
    if (this.getToken()) {
      this.setToken(this.getToken());
    }
  }

  resolveStorage(storageType) {
    switch (storageType) {
      case "cookies": {
        this.storage.setStorage(new CookieStorageFactory);
        break;
      }
      case "local-storage": {
        this.storage.setStorage(new LocalStorageFactory);
        break;
      }
      default: {
        console.error('Storage type option is invalid');
      }
    }
  }

  getToken() {
    return localStorage.getItem(makeStorageKey('Authorization', this.storageNamespace));
  }

  setToken(token) {
    if (typeof token !== 'string') {
      this.removeToken();
      console.error('Wrong token');
      return;
    }
    const normalizedToken = token.replace('Bearer ', '');
    localStorage.setItem(makeStorageKey('Authorization', this.storageNamespace), normalizedToken);
    this.decodedToken = jwtDecode(normalizedToken);
    this.tokenExp = this.decodedToken.exp;
    this.tokenIat = this.decodedToken.iat;
  }

  removeToken() {
    localStorage.removeItem(makeStorageKey('Authorization', this.storageNamespace));
    this.decodedToken = null;
    this.tokenExp = null;
    this.tokenIat = null;
  }

  getDecodedToken() {
    return this.decodedToken;
  }

  isExpired() {
    const currentTimestamp = Date.now() / 1000;
    return this.tokenExp < currentTimestamp;
  }

  canRefresh() {
    const currentTimestamp = Date.now() / 1000;
    return this.getToken() && this.tokenIat + this.refreshTTL > currentTimestamp;
  }

  shouldRefresh() {
    return this.isExpired() && this.canRefresh();
  }

  refreshToken(axiosInstance) {
    return new Promise((resolve, reject) => {
      axiosInstance.post(this.refreshUrl, { token: this.getToken() })
        .then(response => {
          const token = response.data.data.access_token;
          this.setToken(token);
          resolve(token);
        })
        .catch(error => {
          this.removeToken();
          reject(error);
        });
    })
  }
}