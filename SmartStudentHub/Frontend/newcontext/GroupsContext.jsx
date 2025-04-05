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
      console.log('Auth/me response:', response.data);
      const userData = response.data.user;
      if (userData && Array.isArray(userData.joinedGroups)) {
        setJoinedGroups(userData.joinedGroups);
      } else {
        console.warn('User joinedGroups is not an array:', userData?.joinedGroups);
        setJoinedGroups([]);
      }
    } catch (err) {
      console.error('Failed to fetch joined groups:', err);
      setError(err.response?.data?.message || err.message);
      setJoinedGroups([]);
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
  useEffect(() => {
    console.log('joinedGroups updated:', joinedGroups);
  }, [joinedGroups]);
  const joinGroup = async (groupId) => {
    try {
      await api.post(`/groups/${groupId}/join`);
      const updatedGroup = groups.find((group) => group.groupId === groupId);
      if (updatedGroup && !joinedGroups.find((g) => g.groupId === groupId)) {
        setJoinedGroups((prev) => [...prev, updatedGroup]);
      }
      await fetchJoinedGroups();
    } catch (err) {
      console.error('Failed to join group:', err);
      setError(err.response?.data?.message || err.message);
    }
  };
  const leaveGroup = async (groupId) => {
    try {
      await api.post(`/groups/${groupId}/leave`);
      setJoinedGroups((prev) => prev.filter((group) => group.groupId !== groupId));
      await fetchJoinedGroups();
    } catch (err) {
      console.error('Failed to leave group:', err);
      setError(err.response?.data?.message || err.message);
    }
  };
  const isGroupJoined = useCallback(
    (groupId) => {
      return Array.isArray(joinedGroups) && joinedGroups.some((group) => {
        return group.groupId === groupId || 
               (group._id && group.groupId && group.groupId === groupId);
      });
    },
    [joinedGroups]
  );
  const addGroup = async (newGroupData) => {
    try {
      const response = await api.post('/groups', newGroupData);
      setGroups((prev) => [...prev, response.data]);
      await fetchGroups();
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