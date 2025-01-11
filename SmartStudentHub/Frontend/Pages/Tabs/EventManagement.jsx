// Frontend/Pages/Tabs/EventManagement.jsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useTheme, Menu } from "react-native-paper";
import EventsCard from "../../Components/EventsCard";
import OrganizationCard from "../../Components/OrganizationCard"; 
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome";
import moment from "moment";
import sampleOrganisations from "./data/sampleOrganizations"; 
import sampleEvents from "./data/sampleEvents"; 

export default function EventManagement({ navigation }) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEvents, setFilteredEvents] = useState(sampleEvents);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All");

  // State for Menus
  const [allMenuVisible, setAllMenuVisible] = useState(false);
  const [societyMenuVisible, setSocietyMenuVisible] = useState(false);
  const [externalMenuVisible, setExternalMenuVisible] = useState(false);

  // Define the societies and external event types
  const societies = [
    "Artificial Intelligence Society",
    "Arts Association",
    "Chess and Board Games Club",
    "Computer Science Association",
    "English Debate Society",
    "Music Society",
  ];

  const externalEvents = ["Volunteer", "Community Events", "Networking"];


  const timeFilterOptions = ["All", "This Week", "Next Week", "This Month", "Next Month"];


  const uniqueOrganizations = sampleOrganisations;

  const [filteredOrganizations, setFilteredOrganizations] = useState([]);

  useEffect(() => {
    if (searchQuery.trim() !== "") {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const matchedOrgs = uniqueOrganizations.filter(org =>
        org.name.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredOrganizations(matchedOrgs);
    } else {
      setFilteredOrganizations([]);
    }
  }, [searchQuery, uniqueOrganizations]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    applyFilters(query, categoryFilter, timeFilter);
  };

  const handleCategoryFilter = (selectedFilter) => {
    if (
      (societies.includes(selectedFilter) || externalEvents.includes(selectedFilter)) &&
      categoryFilter === selectedFilter
    ) {
      // Reset to main category
      if (societies.includes(selectedFilter)) {
        setCategoryFilter("Society Event");
        applyFilters(searchQuery, "Society Event", timeFilter);
      } else if (externalEvents.includes(selectedFilter)) {
        setCategoryFilter("External Event");
        applyFilters(searchQuery, "External Event", timeFilter);
      }
    } else {
      setCategoryFilter(selectedFilter);
      applyFilters(searchQuery, selectedFilter, timeFilter);
    }
  };

  const handleTimeFilter = (selectedTime) => {
    setTimeFilter(selectedTime);
    applyFilters(searchQuery, categoryFilter, selectedTime);
  };

  const applyFilters = (query, selectedCategory, selectedTime) => {
    let filtered = sampleEvents;

    if (query.trim() !== "") {
      const lowerCaseQuery = query.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(lowerCaseQuery) ||
          event.organization.toLowerCase().includes(lowerCaseQuery)
      );
    }

    if (selectedCategory !== "All") {
      if (societies.includes(selectedCategory)) {
        filtered = filtered.filter(
          (event) =>
            event.type === "University Event" &&
            event.subtype === "Society Event" &&
            event.name === selectedCategory
        );
      } else if (selectedCategory === "Society Event") {
        filtered = filtered.filter(
          (event) =>
            event.type === "University Event" && event.subtype === "Society Event"
        );
      } else if (externalEvents.includes(selectedCategory)) {
        filtered = filtered.filter(
          (event) =>
            event.type === "External Event" && event.subtype === selectedCategory
        );
      } else if (selectedCategory === "External Event") {
        filtered = filtered.filter((event) => event.type === "External Event");
      }

      else if (selectedCategory === "University Event") {
        filtered = filtered.filter((event) => event.type === "University Event");
      }
    }

    if (selectedTime !== "All") {
      const now = moment();
      if (selectedTime === "This Week") {
        const startOfWeek = moment().startOf("isoWeek");
        const endOfWeek = moment().endOf("isoWeek");
        filtered = filtered.filter((event) => {
          const eventDate = moment(event.date, "DD-MM-YYYY");
          return eventDate.isBetween(startOfWeek, endOfWeek, null, "[]");
        });
      } else if (selectedTime === "Next Week") {
        const startOfNextWeek = moment().add(1, "weeks").startOf("isoWeek");
        const endOfNextWeek = moment().add(1, "weeks").endOf("isoWeek");
        filtered = filtered.filter((event) => {
          const eventDate = moment(event.date, "DD-MM-YYYY");
          return eventDate.isBetween(startOfNextWeek, endOfNextWeek, null, "[]");
        });
      } else if (selectedTime === "This Month") {
        const startOfMonth = moment().startOf("month");
        const endOfMonth = moment().endOf("month");
        filtered = filtered.filter((event) => {
          const eventDate = moment(event.date, "DD-MM-YYYY");
          return eventDate.isBetween(startOfMonth, endOfMonth, null, "[]");
        });
      } else if (selectedTime === "Next Month") {
        const startOfNextMonth = moment().add(1, "months").startOf("month");
        const endOfNextMonth = moment().add(1, "months").endOf("month");
        filtered = filtered.filter((event) => {
          const eventDate = moment(event.date, "DD-MM-YYYY");
          return eventDate.isBetween(startOfNextMonth, endOfNextMonth, null, "[]");
        });
      }
    }

    setFilteredEvents(filtered);
  };

  const renderEvent = ({ item }) => (
    <EventsCard
      event={item}
      onPress={() => navigation.navigate("EventDetails", { event: item })}
    />
  );

  const renderOrganization = ({ item }) => (
    <OrganizationCard
      organization={item}
      onPress={(org) =>
        navigation.navigate("OrganizationProfile", { organizationName: org.name })
      }
    />
  );

  // Function to generate sections for SectionList
  const getSections = () => {
    const sections = [];

    if (filteredOrganizations.length > 0) {
      sections.push({
        title: "Organizations",
        data: filteredOrganizations,
        type: "organization",
      });
    }

    if (filteredEvents.length > 0) {
      sections.push({
        title: "Events",
        data: filteredEvents,
        type: "event",
      });
    }

    return sections;
  };

  const sections = getSections();

  const renderSectionHeader = ({ section }) => (
    <Text style={[styles.sectionHeader, { color: theme.colors.onSurface }]}>
      {section.title}
    </Text>
  );

  const renderItem = ({ item, section }) => {
    if (section.type === "organization") {
      return renderOrganization({ item });
    } else if (section.type === "event") {
      return renderEvent({ item });
    }
    return null;
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
      {/* Search Bar */}
      <View
        style={[
          styles.searchBarContainer,
          {
            backgroundColor: theme.colors.surface,
            color: theme.colors.onSurface,
            borderColor: theme.colors.onSurface,
          },
        ]}
      >
        <TextInput
          style={[styles.searchBar, { color: theme.colors.onSurface }]}
          placeholder="Search"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <Icon
          name="search"
          size={20}
          color={theme.colors.onSurface}
          style={styles.searchIcon}
        />
      </View>

      {/* Filter Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[
          styles.filterContainer,
          {
            backgroundColor: theme.colors.surface,
            color: theme.colors.onSurface,
          },
        ]}
        contentContainerStyle={{ marginBottom: 15 }}
      >
          {/* Time Filter Button with Dropdown */}
          <Menu
            visible={allMenuVisible}
            onDismiss={() => setAllMenuVisible(false)}
            anchor={
              <View
                style={[
                  styles.filterButton,
                  (timeFilterOptions.includes(timeFilter)) && { backgroundColor: theme.colors.primary },
                ]}
              >
                <TouchableOpacity
                  style={styles.filterLabel}
                  onPress={() => {
                    handleTimeFilter("All");
                  }}
                >
                  <Text
                    style={{
                      color:
                        timeFilterOptions.includes(timeFilter)
                          ? "#fff"
                          : theme.colors.onSurface,
                    }}
                  >
                    {timeFilter}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setAllMenuVisible(true)}
                  style={styles.iconButton}
                >
                  <Icon
                    name="caret-down"
                    size={16}
                    color={
                      timeFilterOptions.includes(timeFilter)
                        ? "#fff"
                        : theme.colors.onSurface
                    }
                  />
                </TouchableOpacity>
              </View>
            }
            contentStyle={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.onSurfaceVariant,
              borderWidth: 0.5,
              borderRadius: 8,
            }}
          >
            {timeFilterOptions.map(
              (timeOption) => (
                <Menu.Item
                  key={timeOption}
                  onPress={() => {
                    handleTimeFilter(timeOption);
                    setAllMenuVisible(false);
                  }}
                  title={timeOption}
                  titleStyle={{ color: theme.colors.onSurface }}
                  style={{
                    backgroundColor: theme.colors.surface,
                  }}
                />
              )
            )}
          </Menu>

        {/* Category Filter Buttons */}

        {/* All Category Filter Button */}
        <TouchableOpacity
          key="AllCategory"
          style={[
            styles.filterButton,
            categoryFilter === "All" && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => handleCategoryFilter("All")}
        >
          <Text
            style={{
              color:
                categoryFilter === "All" ? "#fff" : theme.colors.onSurface,
            }}
          >
            All Categories
          </Text>
        </TouchableOpacity>

        {/* University Event Filter Button */}
        <TouchableOpacity
          key="University Event"
          style={[
            styles.filterButton,
            categoryFilter === "University Event" && {
              backgroundColor: theme.colors.primary,
            },
          ]}
          onPress={() => handleCategoryFilter("University Event")}
        >
          <Text
            style={{
              color:
                categoryFilter === "University Event"
                  ? "#fff"
                  : theme.colors.onSurface,
            }}
          >
            University Event
          </Text>
        </TouchableOpacity>

          {/* Society Event with Dropdown */}
          <Menu
            visible={societyMenuVisible}
            onDismiss={() => setSocietyMenuVisible(false)}
            anchor={
              <View
                style={[
                  styles.filterButton,
                  (societies.includes(categoryFilter) ||
                    categoryFilter === "Society Event") && {
                      backgroundColor: theme.colors.primary,
                    },
                ]}
              >
                <TouchableOpacity
                  style={styles.filterLabel}
                  onPress={() => {
                    if (societies.includes(categoryFilter)) {
                      handleCategoryFilter("Society Event");
                    } else {
                      handleCategoryFilter("Society Event");
                    }
                  }}
                >
                  <Text
                    style={{
                      color:
                        societies.includes(categoryFilter) ||
                        categoryFilter === "Society Event"
                          ? "#fff"
                          : theme.colors.Surface,
                    }}
                  >
                    {societies.includes(categoryFilter)
                      ? categoryFilter
                      : "Society Event"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSocietyMenuVisible(true)}
                  style={styles.iconButton}
                >
                  <Icon
                    name="caret-down"
                    size={16}
                    color={
                      societies.includes(categoryFilter) ||
                      categoryFilter === "Society Event"
                        ? "#fff"
                        : theme.colors.Surface
                    }
                  />
                </TouchableOpacity>
              </View>
            }
            contentStyle={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.onSurfaceVariant,
              borderWidth: 0.5,
              borderRadius: 8,
            }}
          >
            {societies.map((society) => (
              <Menu.Item
                key={society}
                onPress={() => {
                  handleCategoryFilter(society);
                  setSocietyMenuVisible(false);
                }}
                title={society}
                titleStyle={{ color: theme.colors.onSurface }}
                style={{
                  backgroundColor: theme.colors.surface,
                }}
              />
            ))}
          </Menu>

          {/* External Event with Dropdown */}
          <Menu
            visible={externalMenuVisible}
            onDismiss={() => setExternalMenuVisible(false)}
            anchor={
              <View
                style={[
                  styles.filterButton,
                  (externalEvents.includes(categoryFilter) ||
                    categoryFilter === "External Event") && {
                      backgroundColor: theme.colors.primary,
                    },
                ]}
              >
                <TouchableOpacity
                  style={styles.filterLabel}
                  onPress={() => {
                    handleCategoryFilter("External Event");
                  }}
                >
                  <Text
                    style={{
                      color:
                        externalEvents.includes(categoryFilter) ||
                        categoryFilter === "External Event"
                          ? "#fff"
                          : theme.colors.Surface,
                    }}
                  >
                    {externalEvents.includes(categoryFilter) ||
                    categoryFilter === "External Event"
                      ? categoryFilter
                      : "External Event"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setExternalMenuVisible(true)}
                  style={styles.iconButton}
                >
                  <Icon
                    name="caret-down"
                    size={16}
                    color={
                      externalEvents.includes(categoryFilter) ||
                      categoryFilter === "External Event"
                        ? "#fff"
                        : theme.colors.Surface
                    }
                  />
                </TouchableOpacity>
              </View>
            }
            contentStyle={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.onSurfaceVariant,
              borderWidth: 0.5,
              borderRadius: 8,
            }}
          >
            {externalEvents.map((eventType) => (
              <Menu.Item
                key={eventType}
                onPress={() => {
                  handleCategoryFilter(eventType);
                  setExternalMenuVisible(false);
                }}
                title={eventType}
                titleStyle={{ color: theme.colors.onSurface }}
                style={{
                  backgroundColor: theme.colors.surface,
                }}
              />
            ))}
          </Menu>
      </ScrollView>

      {/* SectionList for Organizations and Events */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => (item.id ? item.id.toString() : item.name)}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.sectionListContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 16 }}>
              No results found.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    padding: 16,
    marginBottom: -50,
  },
  sectionListContent: {
    paddingBottom: 50, // To ensure content is not hidden behind any fixed footer
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.5,
    borderRadius: 16,
    padding: 12,
    marginBottom: 17,
    marginLeft: 0,
    marginRight: 0,
  },
  searchBar: {
    flex: 1,
    fontSize: 17,
  },
  searchIcon: {
    marginLeft: 10,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 5,
    flexGrow: 0,
    marginBottom: 16,
  },
  filterButton: {
    height: 40,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 8,
    paddingHorizontal: 12,
  },
  iconButton: {
    paddingLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
});