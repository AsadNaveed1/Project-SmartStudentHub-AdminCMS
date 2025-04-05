import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from 'react-native-paper';
import { RegisteredEventsContext } from '../newcontext/RegisteredEventsContext'; 
import hkuLogo from '../assets/hku_logo.jpg'; 
import externalEventLogo from '../assets/external_event_logo.png';
import RegisterEventModal from './RegisterEventModal';
export default function EventsCard({ event, onPress }) {
  const theme = useTheme();
  const { registerEvent, withdrawEvent, isRegistered } = useContext(RegisteredEventsContext); 
  const [modalVisible, setModalVisible] = useState(false);
  const handleRegister = () => {
    setModalVisible(true);
  };
  const handleWithdraw = () => {
    withdrawEvent(event.eventId);
    Alert.alert('Withdrawn', `You have withdrawn from "${event.title}"`);
  };
  const registered = isRegistered(event.eventId);
  const getOrganizationLogo = () => {
    if (event.organization && 
        event.organization.image && 
        event.organization.image !== 'https://via.placeholder.com/150' &&
        !event.organization.image.includes('placeholder')) {
      return { uri: event.organization.image };
    }
    else if (event.organization && event.organization.name === 'HKU') {
      return hkuLogo;
    }
    return externalEventLogo;
  };
  const hasSubtype = event.subtype && event.type;
  const isSocietyEvent =
    hasSubtype &&
    event.type === 'University Event' &&
    event.subtype === 'Society Event';
  const isExternalEvent = hasSubtype && event.type === 'External Event';
  const handleModalClose = () => {
    setModalVisible(false);
  };
  const handleModalSubmit = async (registrationData) => {
    await registerEvent(event.eventId, registrationData);
    Alert.alert('Registered', `You have registered for "${event.title}"`);
    setModalVisible(false);
  };
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.onSurface },
      ]}
    >
      <TouchableOpacity
        style={styles.contentContainer}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Image
          source={getOrganizationLogo()}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.infoContainer}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {event.title}
          </Text>
          <View style={styles.pillsContainer}>
            <View style={[styles.pill, styles.organizationPill]}>
              <Text style={styles.pillText}>
                {event.organization && event.organization.name
                  ? event.organization.name
                  : 'N/A'}
              </Text>
            </View>
            {hasSubtype && (
              isSocietyEvent ? (
                <View style={[styles.pill, styles.societyPill]}>
                  <Text style={styles.pillText}>{event.name || 'N/A'}</Text>
                </View>
              ) : isExternalEvent ? (
                <View style={[styles.pill, styles.externalPill]}>
                  <Text style={styles.pillText}>{event.subtype || 'N/A'}</Text>
                </View>
              ) : null
            )}
          </View>
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
      <View style={styles.horizontalLine} />
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.detailsButton]}
          onPress={onPress}
        >
          <Text style={styles.buttonText}>Details</Text>
        </TouchableOpacity>
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
      <RegisterEventModal
        visible={modalVisible}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        event={event}
      />
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
    borderWidth: 0.8,
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
    justifyContent: 'space-between',
    paddingVertical: 12, 
    paddingHorizontal: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  detailsButton: {
    backgroundColor: '#007bff',
  },
  registerButton: {
    backgroundColor: '#28a745',
  },
  withdrawButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});