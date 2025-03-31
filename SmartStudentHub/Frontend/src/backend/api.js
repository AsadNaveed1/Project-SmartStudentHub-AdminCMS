import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Determine the baseURL based on environment
const getBaseUrl = () => {
  if (__DEV__) {
    // In development
    return Platform.OS === 'ios' && !Platform.isDevice
      ? 'http://localhost:5002/api'  // iOS Simulator
      : 'http://192.168.0.147:5002/api';  // Physical device or Android emulator
  } else {
    // In production
    return 'https://your-production-api.com/api';
  }
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

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

export default api;