import localStorage from 'localStorage';
import jwtDecode from 'jwt-decode';

function makeStorageKey(key, ns) {
  return ns ? `${ns}_${key}` : key;
}

export default class Token {
  constructor(refreshUrl, refreshTTL, storageNamespace) {
    this.refreshUrl = refreshUrl;
    this.decodedToken = null
    this.tokenExp = 0;
    this.tokenIat = 0;
    this.refreshTTL = refreshTTL;
    this.storageNamespace = storageNamespace;
    this.init();
  }

  init() {
    if (this.getToken()) {
      this.setToken(this.getToken());
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