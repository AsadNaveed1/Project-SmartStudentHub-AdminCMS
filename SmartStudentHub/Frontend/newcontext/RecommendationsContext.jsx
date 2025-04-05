import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import api from '../src/backend/api';
import { AuthContext } from './AuthContext';
export const RecommendationsContext = createContext();
export const RecommendationsProvider = ({ children }) => {
  const { authState } = useContext(AuthContext);
  const [contentBased, setContentBased] = useState([]);
  const [mlBased, setMlBased] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchRecommendations = async () => {
    if (!authState.token) {
      setContentBased([]);
      setMlBased([]);
      return;
    }
    setIsLoading(true);
    try {
      console.log('Fetching recommendations with token:', authState.token ? 'Token exists' : 'No token');
      const response = await api.get('/events/recommendations');
      console.log('Recommendations response received');
      try {
        console.log('Recommendations data:', JSON.stringify(response.data).substring(0, 500) + '...');
      } catch (logError) {
        console.log('Could not stringify response data:', logError.message);
      }
      const content = response.data?.contentBased || [];
      const ml = response.data?.mlBased || [];
      const message = response.data?.message || '';
      setContentBased(content);
      setMlBased(ml);
      if (message) {
        console.log('Recommendations message:', message);
        if (message !== 'No registered events to base recommendations on.') {
          Alert.alert('Info', message);
        }
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch recommendations');
      try {
        console.error('Error type:', err.name);
        console.error('Error message:', err.message);
        if (err.response) {
          console.error('Error status:', err.response.status);
          try {
            if (err.response.data) {
              console.error('Error data:', JSON.stringify(err.response.data));
            } else {
              console.error('Error response had no data');
            }
          } catch (dataLogError) {
            console.error('Could not stringify error response data');
          }
        } else {
          console.error('No response object in error');
        }
        if (err.isAxiosError && !err.response) {
          console.error('Network error - no response received');
        }
        if (err.code === 'ECONNABORTED') {
          console.error('Request timed out');
        }
      } catch (logError) {
        console.error('Error while logging error details:', logError.message);
      }
      const errorMessage = err.response?.data?.message || err.message || 'An unknown error occurred';
      setError(errorMessage);
      if (!err.response || err.response.status !== 404) {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (authState.token) {
      fetchRecommendations();
    } else {
      setContentBased([]);
      setMlBased([]);
    }
  }, [authState.token]);
  return (
    <RecommendationsContext.Provider
      value={{
        contentBased,
        mlBased,
        isLoading,
        error,
        fetchRecommendations,
      }}
    >
      {children}
    </RecommendationsContext.Provider>
  );
};