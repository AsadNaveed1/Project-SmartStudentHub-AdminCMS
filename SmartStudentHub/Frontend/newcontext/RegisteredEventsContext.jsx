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
      throw err;
    }
  };
  const fetchRegisteredEvents = async () => {
    if (!authState.token) {
      setRegisteredEvents([]);
      return;
    }
    try {
      const response = await api.get('/auth/me');
      const user = response.data;
      if (!Array.isArray(user.registeredEvents)) {
        console.warn('No registered events found for the user.');
        setRegisteredEvents([]);
        return;
      }
      const fullRegisteredEvents = user.registeredEvents.map((regEvt) => {
        const fullEvent = events.find((evt) => evt.eventId === regEvt.eventId);
        if (fullEvent) {
          return { ...fullEvent };
        } else {
          console.warn(`Full event details not found for eventId: ${regEvt.eventId}`);
          return null;
        }
      }).filter(evt => evt !== null);
      setRegisteredEvents(fullRegisteredEvents);
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
    }
  };
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        await fetchEvents();
        await fetchRegisteredEvents();
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, [authState.token]);
  const registerEvent = async (eventId, registrationData) => {
    console.log(`Attempting to register for event ID: ${eventId}`);
    try {
      const response = await api.post(`/events/${eventId}/register`, registrationData);
      const registeredEvent = response.data;
      const fullEvent = events.find((evt) => evt.eventId === eventId);
      if (fullEvent && !registeredEvents.find((regEvt) => regEvt.eventId === eventId)) {
        setRegisteredEvents((prev) => [...prev, fullEvent]);
      }
      setError(null);
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
      setRegisteredEvents((prev) =>
        prev.filter((evt) => evt.eventId !== eventId)
      );
      setError(null);
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