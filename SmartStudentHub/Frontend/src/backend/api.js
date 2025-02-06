// src/backend/api.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create an Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5002/api', // Update with your backend URL
});

// Request interceptor to add the auth token to headers
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can handle global errors here
    return Promise.reject(error);
  }
);

export default api;