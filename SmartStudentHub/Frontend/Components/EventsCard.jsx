import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from 'react-native-paper';
import { RegisteredEventsContext } from '../Context/RegisteredEventsContext'; 

export default function EventsCard({ event, onPress }) {
  const theme = useTheme();
  const { registerEvent, withdrawEvent, isRegistered } = useContext(RegisteredEventsContext); 

  const handleRegister = () => {
    registerEvent(event);
    Alert.alert('Registered', `You have registered for "${event.title}"`);
  };

  const handleWithdraw = () => {
    withdrawEvent(event.id);
    Alert.alert('Withdrawn', `You have withdrawn from "${event.title}"`);
  };

  const registered = isRegistered(event.id);

  const hasSubtype = event.subtype && event.type;
  const isSocietyEvent =
    hasSubtype &&
    event.type === 'University Event' &&
    event.subtype === 'Society Event';
  const isExternalEvent = hasSubtype && event.type === 'External Event';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.onSurface },
      ]}
    >
      {/* Pressable Area for Navigating to Details */}
      <TouchableOpacity
        style={styles.contentContainer}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Image source={{ uri: event.image }} style={styles.image} />
        <View style={styles.infoContainer}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {event.title}
          </Text>

          {/* Pills for Organization and Subtype/Society */}
          <View style={styles.pillsContainer}>
            {/* Organization Pill */}
            <View style={[styles.pill, styles.organizationPill]}>
              <Text style={styles.pillText}>{event.organization}</Text>
            </View>

            {/* Subtype or Society Pill */}
            {hasSubtype && (
              isSocietyEvent ? (
                <View style={[styles.pill, styles.societyPill]}>
                  <Text style={styles.pillText}>{event.name}</Text>
                </View>
              ) : isExternalEvent ? (
                <View style={[styles.pill, styles.externalPill]}>
                  <Text style={styles.pillText}>{event.subtype}</Text>
                </View>
              ) : null
            )}
          </View>

          {/* Date and Time */}
          <View style={styles.dateTimeContainer}>
            <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
              {event.date}
            </Text>

            {event.time && (
              <Text style={[styles.time, { color: theme.colors.onSurfaceVariant }]}>
                {event.time}
              </Text>
            )}
          </View>

          {/* Location */}
          {event.location && (
            <View style={styles.locationContainer}>
              <Text style={[styles.locationLabel, { color: theme.colors.onSurfaceVariant }]}>
                Location:
              </Text>
              <Text
                style={[styles.location, { color: theme.colors.onSurface }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {event.location}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Horizontal Line */}
      <View style={styles.horizontalLine} />

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        {/* Details Button */}
        <TouchableOpacity
          style={[styles.button, styles.detailsButton]}
          onPress={onPress}
        >
          <Text style={styles.buttonText}>Details</Text>
        </TouchableOpacity>

        {/* Register / Withdraw Button */}
        <TouchableOpacity
          style={[
            styles.button,
            registered ? styles.withdrawButton : styles.registerButton,
          ]}
          onPress={registered ? handleWithdraw : handleRegister}
        >
          <Text style={styles.buttonText}>{registered ? 'Withdraw' : 'Register'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const IMAGE_WIDTH = 110;
const IMAGE_MARGIN_RIGHT = 12;
const CONTENT_PADDING = 12;

const styles = StyleSheet.create({
  card: {
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
  contentContainer: {
    flexDirection: 'row',
    padding: CONTENT_PADDING,
  },
  image: {
    width: IMAGE_WIDTH,
    height: 120,
    borderRadius: 8,
    marginRight: IMAGE_MARGIN_RIGHT,
    backgroundColor: '#f0f0f0',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left', 
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginTop: 4,
  },
  organizationPill: {
    backgroundColor: '#d4edda', 
  },
  societyPill: {
    backgroundColor: '#d1ecf1', 
  },
  externalPill: {
    backgroundColor: '#ffeeba', 
  },
  pillText: {
    fontSize: 12,
    color: '#155724',
    textAlign: 'left', 
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    marginRight: 13,
    textAlign: 'left', 
  },
  time: {
    fontSize: 12,
    textAlign: 'left', 
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 13,
    flexWrap: 'nowrap', 
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  location: {
    fontSize: 12,
    flexShrink: 1, 
  },
  horizontalLine: {
    borderTopWidth: 1,
    borderColor: '#ccc',
    marginLeft: 0, 
    marginRight: 0,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start', 
    marginLeft: CONTENT_PADDING + IMAGE_WIDTH + IMAGE_MARGIN_RIGHT, 
    paddingVertical: 12, 
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12, 
  },
  detailsButton: {
    backgroundColor: '#007bff',
  },
  registerButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'left', 
  },
  withdrawButton: {
    backgroundColor: '#ffb84d', 
  },
});



  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
