import axios from 'axios';

export const axiosInstance = axios.create({
  // baseURL: "http://192.168.1.47:3011",
  baseURL: "http://192.168.0.147:3012",
  timeout: 10000,
});
