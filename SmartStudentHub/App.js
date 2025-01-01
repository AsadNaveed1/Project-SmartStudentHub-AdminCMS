// App.js

import 'react-native-gesture-handler'; // Must be at the very top
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import SecondaryNavigation from './Frontend/Pages/SecondaryNavigation';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, ThemeContext } from './Frontend/Context/ThemeContext'; // Correct import

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}> 
      <SafeAreaProvider>
        <ThemeProvider> 
          <ThemeConsumer /> 
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const ThemeConsumer = () => {
  const { theme } = React.useContext(ThemeContext); 

  if (!theme || !theme.colors) {
    console.error('Theme is undefined or missing colors.');
    return null;
  }

  return (
    <PaperProvider theme={theme}> 
      <StatusBar style={theme.dark ? "light" : "dark"} /> 
      <SecondaryNavigation /> 
    </PaperProvider>
  );
};