// Frontend/Components/EventsCard.jsx

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function EventsCard({ event, onPress }) {
  const theme = useTheme();

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: theme.colors.surface }]} onPress={onPress}>
      <Image source={{ uri: event.image }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>{event.title}</Text>
        <Text style={[styles.organization, { color: theme.colors.onSurfaceVariant }]}>
          {event.organization}
        </Text>
        <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
          {event.date}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    borderWidth: 1, // Add border width
  },
  image: {
    width: 100,
    height: 100,
  },
  infoContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  organization: {
    fontSize: 14,
  },
  date: {
    fontSize: 12,
  },
});