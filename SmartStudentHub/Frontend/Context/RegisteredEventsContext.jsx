import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const RegisteredEventsContext = createContext();


export const RegisteredEventsProvider = ({ children }) => {
  const [registeredEvents, setRegisteredEvents] = useState([]);

  
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

  
  const registerEvent = (event) => {
    setRegisteredEvents((prevEvents) => [...prevEvents, event]);
  };

  
  const withdrawEvent = (eventId) => {
    setRegisteredEvents((prevEvents) => prevEvents.filter((e) => e.id !== eventId));
  };

  
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