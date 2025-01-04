// Frontend/Context/RegisteredEventsContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the context
export const RegisteredEventsContext = createContext();

// Create the provider component
export const RegisteredEventsProvider = ({ children }) => {
  const [registeredEvents, setRegisteredEvents] = useState([]);

  // Load registered events from AsyncStorage on mount
  useEffect(() => {
    const loadRegisteredEvents = async () => {
      try {
        const storedEvents = await AsyncStorage.getItem('@registered_events');
        if (storedEvents !== null) {
          setRegisteredEvents(JSON.parse(storedEvents));
        }
      } catch (error) {
        console.error('Failed to load registered events:', error);
      }
    };

    loadRegisteredEvents();
  }, []);

  // Save registered events to AsyncStorage whenever it changes
  useEffect(() => {
    const saveRegisteredEvents = async () => {
      try {
        await AsyncStorage.setItem('@registered_events', JSON.stringify(registeredEvents));
      } catch (error) {
        console.error('Failed to save registered events:', error);
      }
    };

    saveRegisteredEvents();
  }, [registeredEvents]);

  // Function to register an event
  const registerEvent = (event) => {
    setRegisteredEvents((prevEvents) => [...prevEvents, event]);
  };

  // Function to withdraw an event
  const withdrawEvent = (eventId) => {
    setRegisteredEvents((prevEvents) => prevEvents.filter((e) => e.id !== eventId));
  };

  // Check if an event is registered
  const isRegistered = (eventId) => {
    return registeredEvents.some((e) => e.id === eventId);
  };

  return (
    <RegisteredEventsContext.Provider
      value={{ registeredEvents, registerEvent, withdrawEvent, isRegistered }}
    >
      {children}
    </RegisteredEventsContext.Provider>
  );
};