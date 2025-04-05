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
      const response = await api.get('/events/recommendations');
      console.log('Recommendations response:', response.data);
      const { contentBased: content = [], mlBased: ml = [], message } = response.data;
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
      console.error('Failed to fetch recommendations:', err);
      setError(err.response?.data?.message || err.message);
      if (err.response?.status !== 404) {
        Alert.alert('Error', err.response?.data?.message || 'Failed to fetch recommendations.');
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