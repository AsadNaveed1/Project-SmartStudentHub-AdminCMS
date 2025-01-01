// Frontend/Pages/Tabs/MainNavigation.jsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';

// Importing the tab screens
import EventManagement from './EventManagement';
import Calendar from './Calendar';
import Chatbot from './Chatbot';
import MajorGroups from './MajorGroups';
import Profile from './Profile';

// Importing icons from react-native-vector-icons
import { MaterialCommunityIcons, Entypo, FontAwesome6, Ionicons, FontAwesome5 } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function MainNavigation() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home" 
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0, // Remove the top border
          elevation: 5,
          shadowColor: '#000', // Add shadow color
          shadowOffset: { width: 0, height: 2 }, // Add shadow offset
          shadowOpacity: 0.25, // Add shadow opacity
          shadowRadius: 3.84, // Add shadow radius
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') {
            return <Entypo name="home" size={29} color={color} />;
          }
          if (route.name === 'Calendar') {
            return <Entypo name="calendar" size={size} color={color} />;
          }
          if (route.name === 'Groups') {
            return <FontAwesome6 name="user-group" size={22} color={color} />;
          }
          if (route.name === 'Chatbot') {
            return <Ionicons name="chatbox" size={size} color={color} />;
          }
          if (route.name === 'Profile') {
            return <FontAwesome5 name="user-alt" size={size} color={color} />;
          }
          return null;
        },
      })}
    >
      <Tab.Screen name="Home" component={EventManagement} />
      <Tab.Screen name="Calendar" component={Calendar} />
      <Tab.Screen name="Groups" component={MajorGroups} />
      <Tab.Screen name="Chatbot" component={Chatbot} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
