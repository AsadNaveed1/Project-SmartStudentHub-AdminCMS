import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
const getBaseUrl = () => {
  if (__DEV__) {
    const baseUrl = Platform.OS === 'ios' && !Platform.isDevice
      ? 'http://localhost:5002/api'
      : 'http://192.168.0.147:5002/api';
    console.log('Using API base URL:', baseUrl);
    return baseUrl;
  } else {
    return 'https://your-production-api.com/api';
  }
};
const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
});
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`Request to ${config.url} with auth token`);
    } else {
      console.log(`Request to ${config.url} without auth token`);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);
export default api;