'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var localStorage = _interopDefault(require('local-storage'));
var jwtDecode = _interopDefault(require('jwt-decode'));
var axios = _interopDefault(require('axios'));

class Token {
  constructor(refreshUrl, refreshTTL) {
    this.refreshUrl = refreshUrl;
    this.token = null;
    this.decodedToken = null;
    this.tokenExp = 0;
    this.refreshTTL = refreshTTL;
  }

  getToken() {
    const token = localStorage.get('Authorization');
    return token ? token : null;
  }

  setToken(token) {
    const normalizedToken = token.replace('Bearer ', '');
    localStorage.set('Authorization', normalizedToken);
    this.decodedToken = jwtDecode(normalizedToken);
    this.tokenExp = this.decodedToken.exp;
  }

  removeToken() {
    this.token = null;
    this.decodedToken = null;
    this.tokenExp = null;
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
    return this.token && this.tokenExp + this.refreshTTL > currentTimestamp;
  }

  shouldRefresh() {
    return this.isExpired() && this.canRefresh();
  }

  refreshToken(axiosInstance) {
    return new Promise((resolve, reject) => {
      axiosInstance.post(this.refreshUrl, { token: this.token })
        .then(response => {
          this.setToken(response.access_token);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    })
  }
}

class Api {
  constructor(token) {
    this.token = token;
    this.axiosInstance = axios.create(this.config);
    this._addAxiosTokenInterceptor();
    this.refreshingToken = Promise.resolve();
  }

  token() {
    return this.token;
  }

  axios() {
    return this.axiosInstance;
  }

  get(url, config = null) {
    return this._dispatch('get', url, config);
  }

  delete(url, config = null) {
    return this._dispatch('delete', url, config);
  }

  options(url, config = null) {
    return this._dispatch('options', url, config);
  }

  head(url, config = null) {
    return this._dispatch('head', url, config);
  }

  post(url, data = null, config = null) {
    return this._dispatch('post', url, config, data);
  }

  put(url, data = null, config = null) {
    return this._dispatch('put', url, config, data);
  }

  patch(url, data = null, config = null) {
    return this._dispatch('patch', url, config, data);
  }

  checkToken() {
    if (this.token.shouldRefresh()) {
      this.refreshingToken = this.token.refreshToken(this.axiosInstance);
    }
  }

  _dispatch(method, url, config, data = null) {
    this.checkToken();

    return new Promise((resolve, reject) => {
      this.refreshingToken
        .then(() => {
          this._requestResolve(method, url, config, data)
            .then(response => {
              resolve(response);
            })
            .catch(error => {
              reject(error);
            });
        });
    })
  }

  _requestResolve(method, url, config, data) {
    const dataMethods = ['post', 'put', 'patch'];
    const noDataMethods = ['get', 'delete', 'options', 'head'];

    if (dataMethods.includes(method)) {
      return this.axiosInstance[method](url, data, config)
    } else if (noDataMethods.includes(method)) {
      return this.axiosInstance[method](url, config);
    } else {
      throw new Exception('Invalid method');
    }
  }
  
  _addAxiosTokenInterceptor() {
    this.axiosInstance.interceptors.request
      .use(config => {
        const newConfig = config;
        const token = this.token.getToken();
        if (token && !this.token.isExpired()) {
          newConfig.headers.Authorization = token;
        }
        return newConfig;
      });
  }
}

var main = (refreshUrl, refreshTTL = 0) => {
  const token = new Token(refreshUrl, refreshTTL);
  return new Api(token);
};

module.exports = main;
