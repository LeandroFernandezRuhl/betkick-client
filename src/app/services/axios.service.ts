import {Injectable} from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class AxiosService {

  constructor() {
    axios.defaults.baseURL = 'https://betkick-api.leandroruhl.com';
    axios.defaults.headers.post['Content-Type'] = 'application/json';
  }

  getAuthToken(): string | null {
    return window.localStorage.getItem('auth_token');
  }

  setAuthToken(token: string | null): void {
    if (token !== null) {
      window.localStorage.setItem("auth_token", token)
    } else {
      window.localStorage.removeItem("auth_token")
    }
  }

  request(method: string, url: string, data?: any, params?: any): Promise<any> {
    let headers = {};

    if (this.getAuthToken() !== null) {
      headers = {"Authorization": "Bearer " + this.getAuthToken()};
    }

    if (params) {
      return axios.request({
        method: method,
        url: url,
        data: data,
        params: params,
        headers: headers
      });
    } else {
      return axios.request({
        method: method,
        url: url,
        data: data,
        headers: headers
      });
    }
  }
}