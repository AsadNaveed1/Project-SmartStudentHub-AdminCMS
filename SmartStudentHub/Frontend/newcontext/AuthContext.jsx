import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/backend/api';
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    user: null,
    isLoading: true,
  });
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setAuthState({
        token: null,
        user: null,
        isLoading: false,
      });
      Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', 'An error occurred during logout.');
    }
  };
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const user = await AsyncStorage.getItem('user');
        if (token && user) {
          setAuthState({
            token,
            user: JSON.parse(user),
            isLoading: false,
          });
        } else {
          setAuthState({
            token: null,
            user: null,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Failed to load auth state:', error);
        setAuthState({
          token: null,
          user: null,
          isLoading: false,
        });
      }
    };
    loadAuthState();
  }, []);
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response) {
          const { status, data } = error.response;
          if (status === 401) {
            if (data.message === 'Token expired, please login again') {
              await logout();
            } else {
              Alert.alert('Authentication Error', data.message || 'An error occurred.');
            }
          }
        }
        return Promise.reject(error);
      }
    );
    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      const { token, user } = response.data;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      setAuthState({
        token,
        user,
        isLoading: false,
      });
    } catch (error) {
      console.error('Login error:', error.response?.data?.message || error.message);
      Alert.alert('Login Failed', error.response?.data?.message || 'An error occurred during login.');
    }
  };
  const signup = async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      const { token, user } = response.data;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      setAuthState({
        token,
        user,
        isLoading: false,
      });
    } catch (error) {
      console.error('Signup error:', error.response?.data?.message || error.message);
      Alert.alert('Signup Failed', error.response?.data?.message || 'An error occurred during signup.');
      throw error;
    }
  };
  const updateUser = async (data) => {
    try {
      const { token, user } = data;
      if (token) {
        await AsyncStorage.setItem('token', token);
        setAuthState((prevState) => ({
          ...prevState,
          token,
        }));
      }
      if (user) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
        setAuthState((prevState) => ({
          ...prevState,
          user,
        }));
      }
    } catch (error) {
      console.error('Update user error:', error);
      Alert.alert('Update Failed', 'An error occurred while updating your profile.');
    }
  };
  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};