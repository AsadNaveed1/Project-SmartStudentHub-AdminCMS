// App.js

import React, { useState, useEffect } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import MainNavigation from './Frontend/Pages/Tabs/MainNavigation';
import { lightTheme, darkTheme } from './Frontend/Theme';
import { StatusBar } from 'expo-status-bar';
import { Appearance, useColorScheme } from 'react-native';

export default function App() {
  const colorScheme = useColorScheme();
  const [isDarkTheme, setIsDarkTheme] = useState(colorScheme === 'dark');

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDarkTheme(colorScheme === 'dark');
    });

    return () => subscription.remove();
  }, []);

  return (
    <PaperProvider theme={isDarkTheme ? darkTheme : lightTheme}>
      <StatusBar style={isDarkTheme ? "light" : "dark"} />
      <MainNavigation />
    </PaperProvider>
  );
}