import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: "http://192.168.1.47:3011",
  timeout: 1000,
});
