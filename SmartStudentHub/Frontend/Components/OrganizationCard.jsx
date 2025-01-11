// Frontend/Components/OrganizationCard.jsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from 'react-native-paper';

const OrganizationCard = ({ organization, onPress }) => {
  const theme = useTheme();

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.onSurface }]} onPress={() => onPress(organization)}>
      {/* You can replace the placeholder image with actual organization images if available */}
      <Image
        source={{ uri: organization.image || 'https://via.placeholder.com/100' }}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.colors.onSurface }]}>{organization.name}</Text>
        <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
          {organization.description || 'No description available.'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 0.5,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    backgroundColor: '#ccc',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default OrganizationCard;