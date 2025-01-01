// Frontend/Pages/EventDetails.jsx

import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { useTheme, Button } from "react-native-paper";

export default function EventDetails({ route, navigation }) {
  const { event } = route.params;
  const theme = useTheme();

  const handleRegister = () => {
    // Implement registration logic here
    alert("Registered for the event!");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Image source={{ uri: event.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          {event.title}
        </Text>
        <Text
          style={[
            styles.organization,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Organized by: {event.organization}
        </Text>
        <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
          Date: {event.date}
        </Text>
        <Text style={[styles.description, { color: theme.colors.onSurface }]}>
          {event.description}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: 200,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  organization: {
    fontSize: 16,
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
});
