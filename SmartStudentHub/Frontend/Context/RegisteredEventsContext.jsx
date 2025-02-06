// src/frontend/context/RegisteredEventsContext.jsx

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { Alert } from 'react-native';
import api from '../src/backend/api'; // Ensure the path is correct
import { AuthContext } from './AuthContext'; // To access authenticated user

export const RegisteredEventsContext = createContext();

export const RegisteredEventsProvider = ({ children }) => {
  const { authState } = useContext(AuthContext);
  const [events, setEvents] = useState([]); // All available events
  const [registeredEvents, setRegisteredEvents] = useState([]); // User's registered events
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all events from the backend
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/events'); // GET /api/events
      setEvents(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError(err.response?.data?.message || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Failed to fetch events.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch registered events for the authenticated user
  const fetchRegisteredEvents = async () => {
    if (!authState.token) {
      setRegisteredEvents([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get('/auth/me'); // GET /api/auth/me
      const user = response.data;
      setRegisteredEvents(user.registeredEvents);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch registered events:', err);
      setError(err.response?.data?.message || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Failed to fetch registered events.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchRegisteredEvents();
  }, [authState.token]);

  // Register for an event

  const registerEvent = async (eventId) => {
    console.log(`Attempting to register for event ID: ${eventId}`); // Debugging log
    try {
      const response = await api.post(`/events/${eventId}/register`); // POST /api/events/:id/register
      Alert.alert('Success', response.data.message);
      // Update local state by adding the event to registeredEvents
      const event = events.find((evt) => evt.eventId === eventId);
      if (event && !registeredEvents.find((regEvt) => regEvt.eventId === eventId)) {
        setRegisteredEvents((prev) => [...prev, event]);
      }
    } catch (err) {
      console.error('Failed to register for event:', err);
      setError(err.response?.data?.message || err.message);
      Alert.alert('Registration Failed', err.response?.data?.message || 'An error occurred during registration.');
    }
  };

  // Withdraw from an event
  const withdrawEvent = async (eventId) => {
    try {
      const response = await api.post(`/events/${eventId}/withdraw`); // POST /api/events/:id/withdraw
      Alert.alert('Success', response.data.message);
      // Update local state by removing the event from registeredEvents
      setRegisteredEvents((prev) => prev.filter((evt) => evt.eventId !== eventId));
    } catch (err) {
      console.error('Failed to withdraw from event:', err);
      setError(err.response?.data?.message || err.message);
      Alert.alert('Withdrawal Failed', err.response?.data?.message || 'An error occurred during withdrawal.');
    }
  };

  // Check if an event is registered
  const isRegistered = useCallback(
    (eventId) => {
      return registeredEvents.some((event) => event.eventId === eventId);
    },
    [registeredEvents]
  );

  // Optional: Add a new event (if your app allows creating events from frontend)
  const addEvent = async (newEventData) => {
    try {
      const response = await api.post('/events', newEventData); // POST /api/events
      setEvents((prev) => [...prev, response.data]);
      Alert.alert('Success', 'Event added successfully.');
    } catch (err) {
      console.error('Failed to add event:', err);
      setError(err.response?.data?.message || err.message);
      Alert.alert('Add Event Failed', err.response?.data?.message || 'An error occurred while adding the event.');
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
        addEvent, // Optional
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