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
      console.log('Auth/me response for events:', response.data);
      const userData = response.data.user;
      if (userData && Array.isArray(userData.registeredEvents)) {
        console.log('Found registered events:', userData.registeredEvents.length);
        const fullRegisteredEvents = userData.registeredEvents.map((regEvt) => {
          const fullEvent = events.find((evt) =>
            (regEvt._id && evt._id === regEvt._id) ||
            (regEvt.eventId && evt.eventId === regEvt.eventId) ||
            (typeof regEvt === 'string' && evt._id === regEvt)
          );
          if (fullEvent) {
            return { ...fullEvent };
          } else {
            console.warn(`Full event details not found for event:`, regEvt);
            return regEvt;
          }
        }).filter(evt => evt !== null);
        setRegisteredEvents(fullRegisteredEvents);
        setError(null);
      } else {
        console.warn('No registered events found for the user.');
        setRegisteredEvents([]);
      }
    } catch (err) {
      console.error('Failed to fetch registered events:', err);
      setError(
        err.response?.data?.message || err.message || 'Failed to fetch registered events.'
      );
      setRegisteredEvents([]);
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
    if (authState.token) {
      initialize();
    } else {
      setRegisteredEvents([]);
    }
  }, [authState.token]);
  useEffect(() => {
    if (events.length > 0 && authState.token) {
      fetchRegisteredEvents();
    }
  }, [events, authState.token]);
  const registerEvent = async (eventId, registrationData) => {
    console.log(`Attempting to register for event ID: ${eventId}`);
    try {
      const response = await api.post(`/events/${eventId}/register`, registrationData);
      await fetchRegisteredEvents();
      setError(null);
      return true;
    } catch (err) {
      console.error('Failed to register for event:', err);
      setError(
        err.response?.data?.message || err.message || 'Registration failed.'
      );
      Alert.alert(
        'Registration Failed',
        err.response?.data?.message || 'An error occurred during registration.'
      );
      return false;
    }
  };
  const withdrawEvent = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/withdraw`);
      setRegisteredEvents((prev) =>
        prev.filter((evt) => evt.eventId !== eventId)
      );
      await fetchRegisteredEvents();
      setError(null);
      return true;
    } catch (err) {
      console.error('Failed to withdraw from event:', err);
      setError(
        err.response?.data?.message || err.message || 'Withdrawal failed.'
      );
      Alert.alert(
        'Withdrawal Failed',
        err.response?.data?.message || 'An error occurred during withdrawal.'
      );
      return false;
    }
  };
  const isRegistered = useCallback(
    (eventId) => {
      return Array.isArray(registeredEvents) && registeredEvents.some((event) => 
        event.eventId === eventId || 
        (event._id && eventId === event._id)
      );
    },
    [registeredEvents]
  );
  const addEvent = async (newEventData) => {
    try {
      const response = await api.post('/events', newEventData);
      setEvents((prev) => [...prev, response.data]);
      await fetchEvents();
      Alert.alert('Success', 'Event added successfully.');
      return true;
    } catch (err) {
      console.error('Failed to add event:', err);
      setError(
        err.response?.data?.message || err.message || 'Adding event failed.'
      );
      Alert.alert(
        'Add Event Failed',
        err.response?.data?.message || 'An error occurred while adding the event.'
      );
      return false;
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