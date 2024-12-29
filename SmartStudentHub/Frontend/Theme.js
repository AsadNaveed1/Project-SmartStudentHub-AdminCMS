// Frontend/Theme.js

import { Platform } from 'react-native';

export const lightTheme = {
  dark: false,
  colors: {
    primary: "#1877F2", // Facebook Blue
    onPrimary: "#FFFFFF", // White text on primary
    primaryContainer: "#E7F0FD", // Light blue background for containers
    onPrimaryContainer: "#0A58CA", // Darker blue text on primary container
    secondary: "#8B9DC3", // Soft gray-blue for secondary elements
    onSecondary: "#FFFFFF", // White text on secondary
    secondaryContainer: "#DFE3EE", // Light gray-blue background
    onSecondaryContainer: "#2D365E", // Dark gray-blue text
    tertiary: "#4B69FF", // Slightly lighter blue for tertiary actions
    onTertiary: "#FFFFFF", // White text on tertiary
    tertiaryContainer: "#D0DBFF", // Light blue background for tertiary elements
    onTertiaryContainer: "#002C70", // Dark blue text on tertiary container
    error: "#D32F2F", // Standard red for errors
    onError: "#FFFFFF", // White text on error
    errorContainer: "#FFCDD2", // Light red background for errors
    onErrorContainer: "#B71C1C", // Dark red text on error container
    background: "#FFFFFF", // White background
    onBackground: "#1C1C1E", // Near black text for readability
    surface: "#FFFFFF", // White surface (cards, etc.)
    onSurface: "#1C1C1E", // Near black text on surfaces
    surfaceVariant: "#F0F2F5", // Light gray for surface variants
    onSurfaceVariant: "#3C4043", // Darker gray text on surface variants
    outline: "#C0C4CC", // Light gray outlines
    outlineVariant: "#DADCE0", // Slightly darker gray outlines
    shadow: "#000000", // Standard black shadow
    scrim: "rgba(0, 0, 0, 0.5)", // Semi-transparent black for overlays
    inverseSurface: "#1C1C1E",
    inverseOnSurface: "#F0F2F5",
    inversePrimary: "#A7C0FF", // Light blue as inverse primary
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

export const darkTheme = {
  dark: true,
  colors: {
    primary: "#1877F2", // Facebook Blue remains consistent
    onPrimary: "#FFFFFF", // White text on primary
    primaryContainer: "#145DBF", // Darker blue for primary container in dark mode
    onPrimaryContainer: "#E7F0FD", // Light blue text on primary container
    secondary: "#5470AA", // Muted gray-blue for secondary elements
    onSecondary: "#FFFFFF", // White text on secondary
    secondaryContainer: "#3E5788", // Dark gray-blue background
    onSecondaryContainer: "#DFE3EE", // Light gray-blue text
    tertiary: "#5A7FFF", // Lighter blue for tertiary actions
    onTertiary: "#FFFFFF", // White text on tertiary
    tertiaryContainer: "#3A52E0", // Dark blue background for tertiary elements
    onTertiaryContainer: "#D0DBFF", // Light blue text on tertiary container
    error: "#FFB4AB", // Light red for errors
    onError: "#690005", // Dark red text on error
    errorContainer: "#93000A", // Dark red background for errors
    onErrorContainer: "#FFB4AB", // Light red text on error container
    background: "#121212", // Dark background
    onBackground: "#E0E0E0", // Light gray text for readability
    surface: "#1E1E1E", // Dark surface (cards, etc.)
    onSurface: "#E0E0E0", // Light gray text on surfaces
    surfaceVariant: "#2C2C2C", // Dark gray for surface variants
    onSurfaceVariant: "#CCCCCC", // Lighter gray text on surface variants
    outline: "#484848", // Dark gray outlines
    outlineVariant: "#606060", // Slightly lighter gray outlines
    shadow: "#000000", // Standard black shadow
    scrim: "rgba(0, 0, 0, 0.5)", // Semi-transparent black for overlays
    inverseSurface: "#E0E0E0",
    inverseOnSurface: "#1E1E1E",
    inversePrimary: "#A7C0FF", // Light blue as inverse primary
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