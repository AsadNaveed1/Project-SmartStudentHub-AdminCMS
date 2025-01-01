// Frontend/Context/ThemeContext.js

import React, { createContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { lightTheme, darkTheme } from '../Theme';

// Create the ThemeContext with default values
export const ThemeContext = createContext({
  theme: lightTheme,
});

// ThemeProvider component to wrap around the app
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);

  useEffect(() => {
    // Function to set the theme based on color scheme
    const setAppTheme = (colorScheme) => {
      if (colorScheme === 'dark') {
        setTheme(darkTheme);
        console.log('ThemeContext: Applied theme is Dark');
      } else {
        setTheme(lightTheme);
        console.log('ThemeContext: Applied theme is Light');
      }
    };

    // Initial theme setting
    const initialColorScheme = Appearance.getColorScheme();
    console.log(`ThemeContext: Initial color scheme is ${initialColorScheme}`);
    setAppTheme(initialColorScheme);

    // Listener for theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      console.log(`ThemeContext: Detected color scheme change to ${colorScheme}`);
      setAppTheme(colorScheme);
    });

    // Clean up the listener on unmount
    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};