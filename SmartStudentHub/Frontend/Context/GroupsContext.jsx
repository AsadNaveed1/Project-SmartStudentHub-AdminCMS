import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import sampleGroups from '../Pages/Tabs/data/sampleGroups'; 

export const GroupsContext = createContext();

export const GroupsProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);

  
  useEffect(() => {
    setGroups(sampleGroups);
  }, []);

  
  useEffect(() => {
    const loadJoinedGroups = async () => {
      try {
        const storedGroups = await AsyncStorage.getItem('@joined_groups');
        if (storedGroups !== null) {
          setJoinedGroups(JSON.parse(storedGroups));
        }
      } catch (error) {
        console.error('Failed to load joined groups:', error);
      }
    };

    loadJoinedGroups();
  }, []);

  
  useEffect(() => {
    const saveJoinedGroups = async () => {
      try {
        await AsyncStorage.setItem('@joined_groups', JSON.stringify(joinedGroups));
      } catch (error) {
        console.error('Failed to save joined groups:', error);
      }
    };

    saveJoinedGroups();
  }, [joinedGroups]);

  const joinGroup = (groupId) => {
    const groupToJoin = groups.find((group) => group.id === groupId);
    if (groupToJoin && !isGroupJoined(groupId)) {
      setJoinedGroups((prev) => [...prev, groupToJoin]);
    }
  };

  const leaveGroup = (groupId) => {
    setJoinedGroups((prev) => prev.filter((group) => group.id !== groupId));
  };

  const isGroupJoined = useCallback((groupId) => {
    return joinedGroups.some((group) => group.id === groupId);
  }, [joinedGroups]);

  const addGroup = (newGroup) => {
    setGroups((prev) => [...prev, newGroup]);
  };

  return (
    <GroupsContext.Provider
      value={{
        groups,
        joinedGroups,
        joinGroup,
        leaveGroup,
        isGroupJoined,
        addGroup,
      }}
    >
      {children}
    </GroupsContext.Provider>
  );
};