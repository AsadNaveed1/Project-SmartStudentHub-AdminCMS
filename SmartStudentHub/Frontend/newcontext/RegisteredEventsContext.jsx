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
import BlockchainService from '../services/BlockchainService';

export const RegisteredEventsContext = createContext();

export const RegisteredEventsProvider = ({ children }) => {
  const { authState } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blockchainStatus, setBlockchainStatus] = useState({
    initialized: false,
    connected: false,
    processing: false,
    lastTransaction: null,
    networkInfo: null,
    walletAddress: null,
    error: null
  });

  // Initialize blockchain connection
  useEffect(() => {
    const initBlockchain = async () => {
      try {
        setBlockchainStatus(prev => ({ ...prev, processing: true }));
        const success = await BlockchainService.initialize();
        
        // Get wallet address
        const address = await BlockchainService.getUserAddress();
        
        // Get network info
        const networkInfo = await BlockchainService.getNetworkInfo();
        
        setBlockchainStatus(prev => ({
          ...prev,
          initialized: true,
          connected: success,
          processing: false,
          networkInfo,
          walletAddress: address,
          error: success ? null : 'Failed to connect to blockchain'
        }));
        
        if (success) {
          // Fetch blockchain events after successful connection
          fetchBlockchainEvents();
        }
      } catch (err) {
        console.error('Blockchain initialization error:', err);
        setBlockchainStatus(prev => ({
          ...prev,
          initialized: true,
          connected: false,
          processing: false,
          error: err.message
        }));
      }
    };

    initBlockchain();
  }, []);

  const fetchBlockchainEvents = async () => {
    try {
      const blockchainEvents = await BlockchainService.getAllEvents();
      console.log('Blockchain events:', blockchainEvents);
      
      // Cross-reference with registered events
      const userRegistrations = await BlockchainService.getUserRegistrations();
      console.log('User blockchain registrations:', userRegistrations);
      
      // We'll keep this separate from the backend events for now
      // In a full implementation, you might want to sync these
    } catch (err) {
      console.error('Failed to fetch blockchain events:', err);
    }
  };

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
      // Get backend registrations
      const response = await api.get('/auth/me');
      const user = response.data;
      if (!Array.isArray(user.registeredEvents)) {
        console.warn('No registered events found for the user in backend.');
        setRegisteredEvents([]);
        return;
      }
      
      // Get blockchain registrations for cross-validation
      const blockchainRegistrations = await BlockchainService.getUserRegistrations();
      const blockchainEventIds = blockchainRegistrations.map(event => event.eventId);
      
      const fullRegisteredEvents = user.registeredEvents.map((regEvt) => {
        const fullEvent = events.find((evt) => evt.eventId === regEvt.eventId);
        if (fullEvent) {
          // Add blockchain verification status
          return { 
            ...fullEvent,
            blockchainVerified: blockchainEventIds.includes(fullEvent.eventId)
          };
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
        // Error is already handled in the fetch functions
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, [authState.token]);

  const registerEvent = async (eventId, registrationData) => {
    console.log(`Attempting to register for event ID: ${eventId}`);
    setBlockchainStatus(prev => ({ ...prev, processing: true }));
    
    try {
      // 1. First register in the traditional backend
      const response = await api.post(`/events/${eventId}/register`, registrationData);
      const registeredEvent = response.data;
      
      // 2. Then register on the blockchain
      const blockchainResult = await BlockchainService.registerForEvent(eventId);
      
      if (!blockchainResult.success) {
        // If blockchain registration fails, we should roll back the backend registration
        // For simplicity, we'll just continue but show an error
        Alert.alert(
          'Blockchain Registration Warning',
          `Your registration was saved in the database but blockchain registration failed: ${blockchainResult.error}. The registration is not secured by blockchain.`
        );
        
        setBlockchainStatus(prev => ({
          ...prev,
          processing: false,
          error: blockchainResult.error,
        }));
      } else {
        // Successfully registered in both systems
        setBlockchainStatus(prev => ({
          ...prev,
          processing: false,
          lastTransaction: blockchainResult.transactionHash
        }));
        
        // Show success with blockchain transaction details
        Alert.alert(
          'Registration Successful',
          `You have been registered for the event. Transaction confirmed in block ${blockchainResult.blockNumber}.\n\nTransaction Hash: ${blockchainResult.transactionHash}`
        );
      }
      
      // Update UI state
      const fullEvent = events.find((evt) => evt.eventId === eventId);
      if (fullEvent && !registeredEvents.find((regEvt) => regEvt.eventId === eventId)) {
        setRegisteredEvents((prev) => [
          ...prev, 
          {
            ...fullEvent,
            blockchainVerified: blockchainResult.success
          }
        ]);
      }
      setError(null);
      
    } catch (err) {
      console.error('Failed to register for event:', err);
      setError(
        err.response?.data?.message || err.message || 'Registration failed.'
      );
      setBlockchainStatus(prev => ({
        ...prev,
        processing: false,
        error: err.message
      }));
      Alert.alert(
        'Registration Failed',
        err.response?.data?.message || 'An error occurred during registration.'
      );
    }
  };

  const withdrawEvent = async (eventId) => {
    try {
      // Currently, the blockchain contract doesn't have a withdraw function
      // So we'll just handle withdrawal through the API
      const response = await api.post(`/events/${eventId}/withdraw`);
      setRegisteredEvents((prev) =>
        prev.filter((evt) => evt.eventId !== eventId)
      );
      setError(null);
      
      Alert.alert(
        'Withdrawal Notice',
        'You have withdrawn from the event in our database. Note: The blockchain record of your registration still exists and cannot be removed.'
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
    setBlockchainStatus(prev => ({ ...prev, processing: true }));
    
    try {
      // 1. Add to backend
      const response = await api.post('/events', newEventData);
      setEvents((prev) => [...prev, response.data]);
      
      // 2. Create on blockchain
      const blockchainResult = await BlockchainService.createEvent(
        newEventData.eventId,
        newEventData.title,
        newEventData.description || "No description",
        newEventData.date,
        newEventData.location
      );
      
      if (!blockchainResult.success) {
        Alert.alert(
          'Blockchain Warning',
          `Event was created in database but blockchain creation failed: ${blockchainResult.error}. The event is not secured by blockchain.`
        );
        
        setBlockchainStatus(prev => ({
          ...prev,
          processing: false,
          error: blockchainResult.error,
        }));
      } else {
        setBlockchainStatus(prev => ({
          ...prev,
          processing: false,
          lastTransaction: blockchainResult.transactionHash
        }));
        
        Alert.alert(
          'Event Created Successfully',
          `Event has been added to both database and blockchain. Transaction confirmed in block ${blockchainResult.blockNumber}.\n\nTransaction Hash: ${blockchainResult.transactionHash}`
        );
      }
    } catch (err) {
      console.error('Failed to add event:', err);
      setError(
        err.response?.data?.message || err.message || 'Adding event failed.'
      );
      setBlockchainStatus(prev => ({
        ...prev,
        processing: false,
        error: err.message
      }));
      Alert.alert(
        'Add Event Failed',
        err.response?.data?.message || 'An error occurred while adding the event.'
      );
    }
  };

  // Function to export wallet information
  const exportWalletInfo = async () => {
    try {
      return await BlockchainService.exportWalletInfo();
    } catch (err) {
      console.error('Failed to export wallet info:', err);
      return null;
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
        blockchainStatus,
        exportWalletInfo
      }}
    >
      {children}
    </RegisteredEventsContext.Provider>
  );
};