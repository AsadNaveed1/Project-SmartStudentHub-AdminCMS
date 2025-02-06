// src/frontend/screens/OrganizationProfile.jsx

import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "react-native-paper";
import MaterialIcon from "react-native-vector-icons/MaterialIcons"; 
import EventsCard from "../Components/EventsCard"; 
import { OrganizationsContext } from "../context/OrganizationsContext";
import { RegisteredEventsContext } from "../context/RegisteredEventsContext";

const OrganizationProfile = ({ route, navigation }) => {
  const { organizationName } = route.params; 
  const theme = useTheme();

  const { organizations, isLoading: orgLoading, error: orgError } = useContext(OrganizationsContext);
  const { events, isLoading: eventsLoading, error: eventsError } = useContext(RegisteredEventsContext);

  const [organization, setOrganization] = useState(null);
  const [organizationEvents, setOrganizationEvents] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!orgLoading && !orgError) {
      const foundOrg = organizations.find(
        (org) => org.name.toLowerCase() === organizationName.toLowerCase()
      );
      setOrganization(foundOrg || null);

      if (foundOrg) {
        // Assuming each event has a populated 'organization' field with 'name'
        const relatedEvents = events.filter(
          (event) =>
            event.organization &&
            event.organization.name.toLowerCase() === organizationName.toLowerCase()
        );
        setOrganizationEvents(relatedEvents);
      } else {
        setOrganizationEvents([]);
      }
    }
  }, [organizations, orgLoading, orgError, events, organizationName]);

  const handleBack = () => {
    navigation.goBack();
  };

  if (orgLoading || eventsLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (orgError) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.colors.error, fontSize: 16 }}>
          Failed to load organization data.
        </Text>
      </View>
    );
  }

  if (!organization) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 16 }}>
          Organization not found.
        </Text>
      </View>
    );
  }

  const details = [
    { icon: "location-on", label: "Location", value: organization.location || "N/A" },
    { icon: "category", label: "Type", value: organization.type || "N/A" },
    { icon: "label", label: "Subtype", value: organization.subtype || "N/A" },
    // Add more details if necessary
  ];

  // Split details into two columns
  const half = Math.ceil(details.length / 2);
  const firstColumnDetails = details.slice(0, half);
  const secondColumnDetails = details.slice(half);

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
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <MaterialIcon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Organization Image */}
        <Image
          source={{
            uri: organization.image || "https://via.placeholder.com/150",
          }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Organization Name */}
        <Text style={[styles.name, { color: theme.colors.onBackground }]}>
          {organization.name}
        </Text>

        {/* Description */}
        <Text
          style={[
            styles.description,
            { color: theme.colors.onBackground },
          ]}
        >
          {organization.description || "No description available."}
        </Text>

        {/* Organization Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailsRow}>
            {/* First Column */}
            <View style={styles.detailsColumn}>
              {firstColumnDetails.map((detail, index) => (
                <View key={index} style={styles.detailRow}>
                  <MaterialIcon
                    name={detail.icon}
                    size={20}
                    color={theme.colors.primary}
                    style={styles.detailIcon}
                  />
                  <View style={styles.detailTextContainer}>
                    <Text style={[styles.detailLabel, { color: theme.colors.onBackground }]}>{detail.label}:</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.onBackground }]}>
                      {detail.value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            {/* Second Column */}
            <View style={styles.detailsColumn}>
              {secondColumnDetails.map((detail, index) => (
                <View key={index} style={styles.detailRow}>
                  <MaterialIcon
                    name={detail.icon}
                    size={20}
                    color={theme.colors.primary}
                    style={styles.detailIcon}
                  />
                  <View style={styles.detailTextContainer}>
                    <Text style={[styles.detailLabel, { color: theme.colors.onBackground }]}>{detail.label}:</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.onBackground }]}>
                      {detail.value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Events Section */}
        <View style={styles.eventsContainer}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Events by {organization.name}
          </Text>
          {organizationEvents.length > 0 ? (
            <FlatList
              data={organizationEvents}
              renderItem={({ item }) => (
                <EventsCard
                  event={item}
                  onPress={() =>
                    navigation.navigate("EventDetails", { event: item })
                  }
                />
              )}
              keyExtractor={(item) => item.eventId.toString()} // Ensure eventId is unique and a string/number
              horizontal={false} 
              showsVerticalScrollIndicator={false}
              scrollEnabled={false} 
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          ) : (
            <Text
              style={{ color: theme.colors.onSurfaceVariant, fontSize: 16 }}
            >
              No events posted by this organization.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    alignItems: "center",
    paddingTop: 60, 
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 8,
    zIndex: 1, // Ensure the button is above other content
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 16,
    backgroundColor: "#ccc",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "justify",
    marginBottom: 16,
  },
  detailsContainer: {
    width: "100%",
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailsColumn: {
    flex: 1,
    paddingRight: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailTextContainer: {
    flexDirection: "column",
    flexShrink: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 14,
    marginTop: 2,
  },
  eventsContainer: {
    width: "100%",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "left",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default OrganizationProfile;