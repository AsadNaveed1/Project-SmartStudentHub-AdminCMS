import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/backend/api';
import { AuthContext } from './AuthContext'; // Import AuthContext

export const GroupsContext = createContext();

export const GroupsProvider = ({ children }) => {
  const { authState } = useContext(AuthContext); // Consume AuthContext
  const [groups, setGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all groups from the backend
  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/groups');
      setGroups(response.data);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch joined groups for the authenticated user
  const fetchJoinedGroups = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/auth/me');
      const user = response.data;
      setJoinedGroups(user.joinedGroups);
    } catch (err) {
      console.error('Failed to fetch joined groups:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authState.isLoading && authState.token) {
      fetchGroups();
      fetchJoinedGroups();
    }
  }, [authState.isLoading, authState.token]);

  // Join a group
  const joinGroup = async (groupId) => {
    try {
      await api.post(`/groups/${groupId}/join`);
      // Update local state
      const updatedGroup = groups.find((group) => group.groupId === groupId);
      if (updatedGroup && !joinedGroups.find((g) => g.groupId === groupId)) {
        setJoinedGroups((prev) => [...prev, updatedGroup]);
      }
    } catch (err) {
      console.error('Failed to join group:', err);
      setError(err.response?.data?.message || err.message);
    }
  };

  // Leave a group
  const leaveGroup = async (groupId) => {
    try {
      await api.post(`/groups/${groupId}/leave`);
      // Update local state
      setJoinedGroups((prev) => prev.filter((group) => group.groupId !== groupId));
    } catch (err) {
      console.error('Failed to leave group:', err);
      setError(err.response?.data?.message || err.message);
    }
  };

  // Check if a group is joined
  const isGroupJoined = useCallback(
    (groupId) => {
      return joinedGroups.some((group) => group.groupId === groupId);
    },
    [joinedGroups]
  );

  // Add a new group (optional, if your app allows creating groups from frontend)
  const addGroup = async (newGroupData) => {
    try {
      const response = await api.post('/groups', newGroupData);
      setGroups((prev) => [...prev, response.data]);
    } catch (err) {
      console.error('Failed to add group:', err);
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <GroupsContext.Provider
      value={{
        groups,
        joinedGroups,
        isGroupJoined,
        joinGroup,
        leaveGroup,
        addGroup,
        isLoading,
        error,
        fetchGroups, // Expose if you need to refetch
        fetchJoinedGroups, // Expose if you need to refetch
      }}
    >
      {children}
    </GroupsContext.Provider>
  );
};