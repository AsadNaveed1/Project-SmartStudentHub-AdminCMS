// Frontend/Theme.js

import { MD3DarkTheme as PaperDarkTheme, MD3LightTheme as PaperDefaultTheme } from 'react-native-paper';
import { Platform } from 'react-native';
console.log('PaperDarkTheme:', PaperDarkTheme);
console.log('PaperDarkTheme.colors:', PaperDarkTheme?.colors);


// Extend react-native-paper's DefaultTheme for Light Theme
export const lightTheme = {
  ...PaperDefaultTheme,
  dark: false,
  colors: {
    ...PaperDefaultTheme.colors,
    primary: "#1877F2", // Facebook Blue
    onPrimary: "#FFFFFF",
    primaryContainer: "#E7F0FD",
    onPrimaryContainer: "#0A58CA",
    secondary: "#8B9DC3",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#DFE3EE",
    onSecondaryContainer: "#2D365E",
    tertiary: "#4B69FF",
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#D0DBFF",
    onTertiaryContainer: "#002C70",
    error: "#D32F2F",
    onError: "#FFFFFF",
    errorContainer: "#FFCDD2",
    onErrorContainer: "#B71C1C",
    background: "#FFFFFF",
    onBackground: "#1C1C1E",
    surface: "#FFFFFF",
    onSurface: "#1C1C1E",
    surfaceVariant: "#F0F2F5",
    onSurfaceVariant: "#3C4043",
    outline: "#C0C4CC",
    outlineVariant: "#DADCE0",
    shadow: "#000000",
    scrim: "rgba(0, 0, 0, 0.5)",
    inverseSurface: "#1C1C1E",
    inverseOnSurface: "#F0F2F5",
    inversePrimary: "#A7C0FF",
    elevation: {
      level0: "transparent",
      level1: "#F0F2F5",
      level2: "#E7F0FD",
      level3: "#D0DBFF",
      level4: "#C0C8FF",
      level5: "#B0BFFF",
    },
    surfaceDisabled: "rgba(28, 28, 30, 0.12)",
    onSurfaceDisabled: "rgba(28, 28, 30, 0.38)",
    backdrop: "rgba(49, 47, 56, 0.4)",
  },
  fonts: {
    ...PaperDefaultTheme.fonts,
    regular: {
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto-Light',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto-Thin',
      fontWeight: 'normal',
    },
  },
};

// Extend react-native-paper's DarkTheme for Dark Theme
export const darkTheme = {
  ...PaperDarkTheme,
  dark: true,
  colors: {
    ...PaperDarkTheme.colors,
    primary: "#1877F2", // Facebook Blue remains consistent
    onPrimary: "#FFFFFF",
    primaryContainer: "#145DBF",
    onPrimaryContainer: "#E7F0FD",
    secondary: "#5470AA",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#3E5788",
    onSecondaryContainer: "#DFE3EE",
    tertiary: "#5A7FFF",
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#3A52E0",
    onTertiaryContainer: "#D0DBFF",
    error: "#FFB4AB",
    onError: "#690005",
    errorContainer: "#93000A",
    onErrorContainer: "#FFB4AB",
    background: "#121212",
    onBackground: "#E0E0E0",
    surface: "#1E1E1E",
    onSurface: "#E0E0E0",
    surfaceVariant: "#2C2C2C",
    onSurfaceVariant: "#CCCCCC",
    outline: "#484848",
    outlineVariant: "#606060",
    shadow: "#000000",
    scrim: "rgba(0, 0, 0, 0.5)",
    inverseSurface: "#E0E0E0",
    inverseOnSurface: "#1E1E1E",
    inversePrimary: "#A7C0FF",
    elevation: {
      level0: "transparent",
      level1: "#2C2C2C",
      level2: "#3E3E3E",
      level3: "#4F4F4F",
      level4: "#5F5F5F",
      level5: "#6F6F6F",
    },
    surfaceDisabled: "rgba(224, 224, 224, 0.12)",
    onSurfaceDisabled: "rgba(224, 224, 224, 0.38)",
    backdrop: "rgba(49, 47, 56, 0.4)",
  },
  fonts: {
    ...PaperDefaultTheme.fonts,
    regular: {
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto-Light',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto-Thin',
      fontWeight: 'normal',
    },
  },
};