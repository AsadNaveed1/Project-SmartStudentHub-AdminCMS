// RegisteredEventsContext.jsx

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from 'react';
import { Alert } from 'react-native';
import api from '../src/backend/api';
import { AuthContext } from './AuthContext';

export const RegisteredEventsContext = createContext();

export const RegisteredEventsProvider = ({ children }) => {
  const { authState } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/events');
      setEvents(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError(
        err.response?.data?.message || err.message || 'Failed to fetch events.'
      );
      Alert.alert('Error', err.response?.data?.message || 'Failed to fetch events.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRegisteredEvents = async () => {
    if (!authState.token) {
      setRegisteredEvents([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.get('/auth/me');
      const user = response.data;
      setRegisteredEvents(user.registeredEvents);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch registered events:', err);
      setError(
        err.response?.data?.message || err.message || 'Failed to fetch registered events.'
      );
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to fetch registered events.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchRegisteredEvents();
  }, [authState.token]);

  const registerEvent = async (eventId, registrationData) => {
    console.log(`Attempting to register for event ID: ${eventId}`);
    try {
      const response = await api.post(`/events/${eventId}/register`, registrationData);
      // Alert.alert('Success', response.data.message);
      const event = events.find((evt) => evt.eventId === eventId);
      if (event && !registeredEvents.find((regEvt) => regEvt.eventId === eventId)) {
        setRegisteredEvents((prev) => [...prev, event]);
      }
    } catch (err) {
      console.error('Failed to register for event:', err);
      setError(
        err.response?.data?.message || err.message || 'Registration failed.'
      );
      Alert.alert(
        'Registration Failed',
        err.response?.data?.message || 'An error occurred during registration.'
      );
    }
  };

  const withdrawEvent = async (eventId) => {
    try {
      const response = await api.post(`/events/${eventId}/withdraw`);
      // Alert.alert('Success', response.data.message);
      setRegisteredEvents((prev) =>
        prev.filter((evt) => evt.eventId !== eventId)
      );
    } catch (err) {
      console.error('Failed to withdraw from event:', err);
      setError(
        err.response?.data?.message || err.message || 'Withdrawal failed.'
      );
      Alert.alert(
        'Withdrawal Failed',
        err.response?.data?.message || 'An error occurred during withdrawal.'
      );
    }
  };

  const isRegistered = useCallback(
    (eventId) => {
      return registeredEvents.some((event) => event.eventId === eventId);
    },
    [registeredEvents]
  );

  const addEvent = async (newEventData) => {
    try {
      const response = await api.post('/events', newEventData);
      setEvents((prev) => [...prev, response.data]);
      Alert.alert('Success', 'Event added successfully.');
    } catch (err) {
      console.error('Failed to add event:', err);
      setError(
        err.response?.data?.message || err.message || 'Adding event failed.'
      );
      Alert.alert(
        'Add Event Failed',
        err.response?.data?.message || 'An error occurred while adding the event.'
      );
    }
  };

  return (
    <RegisteredEventsContext.Provider
      value={{
        events,
        registeredEvents,
        isRegistered,
        registerEvent,
        withdrawEvent,
        addEvent,
        isLoading,
        error,
        fetchEvents,
        fetchRegisteredEvents,
      }}
    >
      {children}
    </RegisteredEventsContext.Provider>
  );
};