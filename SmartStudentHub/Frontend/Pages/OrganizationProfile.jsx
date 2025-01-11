import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "react-native-paper";
import MaterialIcon from "react-native-vector-icons/MaterialIcons"; 
import EventsCard from "../Components/EventsCard"; 
import sampleOrganisations from "./Tabs/data/sampleOrganizations"; 
import sampleEvents from "./Tabs/data/sampleEvents"; 

const OrganizationProfile = ({ route, navigation }) => {
  const { organizationName } = route.params; 
  const theme = useTheme();

  
  const organization = sampleOrganisations.find(
    (org) => org.name.toLowerCase() === organizationName.toLowerCase()
  );

  
  const organizationEvents = sampleEvents.filter(
    (event) =>
      event.organization.toLowerCase() === organizationName.toLowerCase()
  );

  if (!organization) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 16 }}>
          Organization not found.
        </Text>
      </View>
    );
  }

  const handleBack = () => {
    navigation.goBack();
  };

  
  const details = [
    { icon: "location-on", label: "Location", value: organization.location || "N/A" },
    { icon: "category", label: "Type", value: organization.type || "N/A" },
    { icon: "label", label: "Subtype", value: organization.subtype || "N/A" },
    
  ];

  
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
        />

        {/* Organization Name */}
        <Text style={[styles.name, { color: theme.colors.onBackground }]}>
          {organization.name}
        </Text>

        {/* Organization Description */}
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

        {/* Events Posted by the Organization */}
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
              keyExtractor={(item) => item.id}
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
    zIndex: 1, 
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