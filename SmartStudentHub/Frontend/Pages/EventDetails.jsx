import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useTheme, Button, IconButton } from "react-native-paper";
import moment from "moment";
import * as Sharing from "expo-sharing";
import * as Calendar from "expo-calendar";
import MaterialIcon from "react-native-vector-icons/MaterialIcons"; 
import { SafeAreaView } from "react-native-safe-area-context";
import { RegisteredEventsContext } from '../context/RegisteredEventsContext'; 

export default function EventDetails({ route, navigation }) {
  const { event } = route.params;
  const theme = useTheme();
  const { registerEvent, withdrawEvent, isRegistered } = useContext(RegisteredEventsContext); 

  const registered = isRegistered(event.id);

  const handleRegister = () => {
    if (!registered) {
      registerEvent(event);
      Alert.alert('Registered', `You have registered for "${event.title}"`);
    } else {
      withdrawEvent(event.id);
      Alert.alert('Withdrawn', `You have withdrawn from "${event.title}"`);
    }
  };


  const handleAddToCalendar = async () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Unsupported Platform",
        "Adding to calendar is not supported on web."
      );
      return;
    }

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissions Required",
          "Calendar permissions are needed to add events."
        );
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT
      );
      const defaultCalendar =
        calendars.find((cal) => cal.source.isLocalAccount) || calendars[0];

      const [startTimeStr, endTimeStr] = event.time.split(" - ");
      const startTime = moment(
        `${event.date} ${startTimeStr}`,
        "DD-MM-YYYY hh:mm A"
      ).toDate();
      const endTime = moment(
        `${event.date} ${endTimeStr}`,
        "DD-MM-YYYY hh:mm A"
      ).toDate();

      await Calendar.createEventAsync(defaultCalendar.id, {
        title: event.title,
        startDate: startTime,
        endDate: endTime,
        location: event.location,
        notes: event.description,
        timeZone: "GMT",
      });

      Alert.alert("Success", "Event added to your calendar.");
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error",
        "An error occurred while adding the event to your calendar."
      );
    }
  };

  
  const handleShare = async () => {
    try {
      if (Platform.OS === "web") {
        Alert.alert("Unsupported Platform", "Sharing is not supported on web.");
        return;
      }

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(
          "Sharing Not Available",
          "Your device does not support sharing."
        );
        return;
      }

      const message = `Check out this event: ${event.title}\n\n${event.description}\n\nDate: ${event.date} at ${event.time}\nLocation: ${event.location}`;
      await Sharing.shareAsync(null, {
        dialogTitle: `Share ${event.title}`,
        message: message,
      });
    } catch (error) {
      Alert.alert(
        "Error",
        "An error occurred while trying to share the event."
      );
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          color: theme.colors.onSurface,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Container for Image and Back Button */}
        <View style={styles.imageContainer}>
          {/* Event Image */}
          <Image source={event.image} style={styles.image} />

          {/* Custom Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <MaterialIcon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Event Information */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            {event.title}
          </Text>

          {/* Two-Column Information Layout */}
          <View style={styles.infoColumns}>
            {/* Left Column */}
            <View style={styles.column}>
              {/* Organizer */}
              <View style={styles.infoRow}>
                <IconButton
                  icon="account-circle"
                  size={16}
                  style={styles.infoIcon}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.infoText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {event.organization}
                </Text>
              </View>

              {/* Date */}
              <View style={styles.infoRow}>
                <IconButton
                  icon="calendar"
                  size={16}
                  style={styles.infoIcon}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.infoText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {moment(event.date, 'DD-MM-YYYY').format('MMM Do, YYYY')}
                </Text>
              </View>
            </View>

            {/* Right Column */}
            <View style={styles.column}>
              {/* Event Type */}
              <View style={styles.infoRow}>
                <IconButton
                  icon="tag"
                  size={16}
                  style={styles.infoIcon}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.infoText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {event.type}
                  {event.subtype ? ` - ${event.subtype}` : ''}
                </Text>
              </View>

              {/* Time */}
              <View style={styles.infoRow}>
                <IconButton
                  icon="clock-outline"
                  size={16}
                  style={styles.infoIcon}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.infoText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {event.time}
                </Text>
              </View>
            </View>
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <IconButton
              icon="map-marker"
              size={16}
              style={styles.infoIcon}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.infoText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {event.location}
            </Text>
          </View>

          {/* Description */}
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
          >
            Description
          </Text>
          <Text style={[styles.description, { color: theme.colors.onSurface }]}>
            {event.description}
          </Text>

          {/* Additional Details (if any) */}
          {event.otherDetails && (
            <>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.onBackground },
                ]}
              >
                Additional Details
              </Text>
              <Text
                style={[styles.description, { color: theme.colors.onSurface }]}
              >
                {event.otherDetails}
              </Text>
            </>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            {/* Register / Withdraw Button */}
            <Button
              mode="contained"
              onPress={handleRegister}
              style={[
                styles.registerButton,
                registered ? styles.withdrawButton : styles.registerButtonStyle,
              ]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.registerButtonLabel}
            >
              {registered ? 'Withdraw' : 'Register'}
            </Button>

            {/* Add to Calendar Icon Button */}
            <IconButton
              icon="calendar-plus"
              size={20}
              onPress={handleAddToCalendar}
              iconColor="#5a5a5a"
              style={styles.iconButton}
              padding={12}
              accessibilityLabel="Add to Calendar"
            />

            {/* Share Icon Button */}
            <IconButton
              icon="share-variant"
              size={20}
              onPress={handleShare}
              iconColor="#5a5a5a"
              style={styles.iconButton}
              padding={12}
              accessibilityLabel="Share Event"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 250,
    backgroundColor: "#ccc",
  },
  backButton: {
    position: "absolute",
    top: 40, 
    left: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoColumns: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  column: {
    flex: 1,
  },
  registerButtonLabel: {
    fontSize: 16, 
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0, 
  },
  infoIcon: {
    marginRight: 4,
  },
  infoText: {
    fontSize: 14,
    flexShrink: 1,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16, 
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 5, 
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  buttonsContainer: {
    marginTop: 15,
    flexDirection: "row", 
    alignItems: "center",
  },
  registerButton: {
    marginRight: 7, 
    flex: 1, 
    height: 50, 
  },
  iconButton: {
    width: 50, 
    height: 50, 
    backgroundColor: "#f0f0f0", 
    borderRadius: 25, 
    justifyContent: "center", 
    alignItems: "center", 
  },
  buttonContent: {
    height: 50,
    justifyContent: "center",
  },
  withdrawButton: {
    backgroundColor: '#ffb84d', 
  },

});