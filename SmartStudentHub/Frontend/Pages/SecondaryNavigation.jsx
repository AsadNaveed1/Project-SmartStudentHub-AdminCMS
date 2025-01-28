// frontend/Pages/SecondaryNavigation.jsx

import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import MainNavigation from './Tabs/MainNavigation';
import EventDetails from './EventDetails';
import OrganizationProfile from './OrganizationProfile';
import ChatPage from './ChatPage';
import LoginScreen from './LoginScreen'; 
import SignupScreen from './SignupScreen';

import { AuthContext } from '../context/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

const Stack = createStackNavigator();

export default function SecondaryNavigation() {
  const { authState } = useContext(AuthContext);

  if (authState.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {authState.token == null ? (
          // No token found, user isn't signed in
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          // User is signed in
          <>
            <Stack.Screen
              name="Main"
              component={MainNavigation}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EventDetails"
              component={EventDetails}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="OrganizationProfile"
              component={OrganizationProfile}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ChatPage"
              component={ChatPage}
              options={({ route }) => ({
                title: route.params?.group?.courseName || 'Chat',
                headerShown: true,
                headerStyle: {
                  backgroundColor: '#1877F2',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});