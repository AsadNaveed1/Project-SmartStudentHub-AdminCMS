import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/backend/api';
import { AuthContext } from './AuthContext'; 

export const GroupsContext = createContext();
export const GroupsProvider = ({ children }) => {
  const { authState } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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
  const joinGroup = async (groupId) => {
    try {
      await api.post(`/groups/${groupId}/join`);
      const updatedGroup = groups.find((group) => group.groupId === groupId);
      if (updatedGroup && !joinedGroups.find((g) => g.groupId === groupId)) {
        setJoinedGroups((prev) => [...prev, updatedGroup]);
      }
    } catch (err) {
      console.error('Failed to join group:', err);
      setError(err.response?.data?.message || err.message);
    }
  };
  const leaveGroup = async (groupId) => {
    try {
      await api.post(`/groups/${groupId}/leave`);
      setJoinedGroups((prev) => prev.filter((group) => group.groupId !== groupId));
    } catch (err) {
      console.error('Failed to leave group:', err);
      setError(err.response?.data?.message || err.message);
    }
  };
  const isGroupJoined = useCallback(
    (groupId) => {
      return joinedGroups.some((group) => group.groupId === groupId);
    },
    [joinedGroups]
  );
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
        fetchGroups,
        fetchJoinedGroups,
      }}
    >
      {children}
    </GroupsContext.Provider>
  );
};