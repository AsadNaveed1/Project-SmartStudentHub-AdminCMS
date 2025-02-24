import React, { createContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { lightTheme, darkTheme } from '../Theme';


export const ThemeContext = createContext({
  theme: lightTheme,
});


export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);

  useEffect(() => {
    
    const setAppTheme = (colorScheme) => {
      if (colorScheme === 'dark') {
        setTheme(darkTheme);
        console.log('ThemeContext: Applied theme is Dark');
      } else {
        setTheme(lightTheme);
        console.log('ThemeContext: Applied theme is Light');
      }
    };

    
    const initialColorScheme = Appearance.getColorScheme();
    console.log(`ThemeContext: Initial color scheme is ${initialColorScheme}`);
    setAppTheme(initialColorScheme);

    
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      console.log(`ThemeContext: Detected color scheme change to ${colorScheme}`);
      setAppTheme(colorScheme);
    });

    
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