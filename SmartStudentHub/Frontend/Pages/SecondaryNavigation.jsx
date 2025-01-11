import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainNavigation from './Tabs/MainNavigation';
import EventDetails from './EventDetails';
import OrganizationProfile from './OrganizationProfile'; 

const Stack = createStackNavigator();

export default function SecondaryNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
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
          options={{ headerShown: false}} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}