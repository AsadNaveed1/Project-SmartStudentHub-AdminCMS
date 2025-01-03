// Frontend/Pages/Tabs/EventManagement.jsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useTheme, Menu, Provider } from "react-native-paper";
import EventsCard from "../../Components/EventsCard";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome";

const sampleEvents = [
  // Existing Events
  {
    id: "1",
    title: "Career Talk by XYZ Corp",
    image: "https://example.com/event1.jpg",
    description: "Join us for an insightful career talk by XYZ Corp.",
    date: "15-11-2024", 
    time: "11:00 AM - 12:00 PM",
    organization: "HKU",
    type: "University Event",
  },
  {
    id: "2",
    title: "Volunteer Opportunity with ABC NGO",
    image: "https://example.com/event2.jpg",
    description: "Volunteer with ABC NGO to make a difference.",
    date: "05-12-2024",
    time: "02:00 PM - 04:00 PM",
    organization: "ABC NGO",
    type: "External Event",
    subtype: "Volunteer",
  },
  {
    id: "3",
    title: "Tech Workshop by DEF Inc",
    image: "https://example.com/event3.jpg",
    description: "Learn the latest in tech at our workshop.",
    date: "20-11-2024", 
    time: "01:00 PM - 02:00 PM",
    organization: "HKU",
    type: "University Event",
  },
  {
    id: "4",
    title: "Health and Wellness Fair",
    image: "https://example.com/event4.jpg",
    description: "Join us for a day of health and wellness activities.",
    date: "12-12-2024",
    time: "03:00 PM - 05:00 PM",
    organization: "Health Org",
    type: "External Event",
    subtype: "Community Events",
  },
  {
    id: "5",
    title: "Coding Bootcamp",
    image: "https://example.com/event5.jpg",
    description: "Intensive coding bootcamp for beginners.",
    date: "25-11-2024", 
    time: "11:00 AM - 12:00 PM",
    organization: "HKU",
    type: "University Event",
  },
  {
    id: "6",
    title: "Art Exhibition",
    image: "https://example.com/event6.jpg",
    description: "Explore the latest art from local artists.",
    date: "18-12-2024",
    time: "05:00 PM - 07:00 PM",
    organization: "Art Gallery",
    type: "External Event",
    subtype: "Community Events",
  },
  {
    id: "7",
    title: "Music Concert",
    image: "https://example.com/event7.jpg",
    description: "Live music concert featuring local bands.",
    date: "20-01-2025",
    time: "06:00 PM - 07:00 PM",
    organization: "Music Club",
    type: "External Event",
    subtype: "Community Events",
  },
  {
    id: "8",
    title: "Startup Pitch Night",
    image: "https://example.com/event8.jpg",
    description: "Watch startups pitch their ideas to investors.",
    date: "10-01-2025", 
    time: "12:00 PM - 01:00 PM",
    organization: "HKU",
    type: "University Event",
  },
  {
    id: "9",
    title: "Environmental Awareness Campaign",
    image: "https://example.com/event9.jpg",
    description: "Join us to raise awareness about environmental issues.",
    date: "25-12-2024",
    time: "04:00 PM - 06:00 PM",
    organization: "Green Earth",
    type: "External Event",
    subtype: "Volunteer",
  },
  {
    id: "10",
    title: "Business Networking Event",
    image: "https://example.com/event10.jpg",
    description: "Network with professionals in your industry.",
    date: "15-02-2025",
    time: "01:00 PM - 03:00 PM",
    organization: "Business Network",
    type: "External Event",
    subtype: "Networking",
  },
  {
    id: "11",
    title: "Science Fair",
    image: "https://example.com/event11.jpg",
    description: "Showcase your science projects and experiments.",
    date: "30-12-2024",
    time: "11:00 AM - 12:00 PM",
    organization: "HKU",
    type: "University Event",
  },
  {
    id: "12",
    title: "Cooking Class",
    image: "https://example.com/event12.jpg",
    description: "Learn to cook delicious meals with our chef.",
    date: "20-01-2025", 
    time: "02:00 PM - 04:00 PM",
    organization: "Culinary School",
    type: "External Event",
    subtype: "Volunteer",
  },

  // Additional Events to Cover All Societies and External Event Types

  // Artificial Intelligence Society Events
  {
    id: "13",
    title: "AI Workshop: Machine Learning Basics",
    image: "https://example.com/ai_workshop.jpg",
    description: "Dive into the basics of machine learning with hands-on projects.",
    date: "10-01-2024",
    time: "11:00 AM - 01:00 PM",
    location: "Tech Hall",
    organization: "HKU",
    type: "University Event",
    subtype: "Society Event",
    name: "Artificial Intelligence Society",
  },
  {
    id: "14",
    title: "AI Hackathon",
    image: "https://example.com/ai_hackathon.jpg",
    description: "Collaborate to build innovative AI solutions in a 24-hour hackathon.",
    date: "15-01-2024",
    time: "12:00 PM - 02:00 PM",
    location: "Innovation Lab",
    organization: "HKU",
    type: "University Event",
    subtype: "Society Event",
    name: "Artificial Intelligence Society",
  },

  // Arts Association Events
  {
    id: "15",
    title: "Canvas Painting Workshop",
    image: "https://example.com/canvas_painting.jpg",
    description: "Learn the art of canvas painting from experienced artists.",
    date: "20-01-2024",
    time: "02:00 PM - 04:00 PM",
    location: "Arts Center",
    organization: "HKU",
    type: "University Event",
    subtype: "Society Event",
    name: "Arts Association",
  },
  {
    id: "16",
    title: "Sculpture Exhibition",
    image: "https://example.com/sculpture_exhibition.jpg",
    description: "Explore stunning sculptures created by our talented members.",
    date: "10-02-2025", // Changed from 25-01-2024
    time: "11:00 AM - 01:00 PM",
    location: "Main Gallery",
    organization: "Art Collective",
    type: "External Event",
    subtype: "Community Events",
  },

  // Chess and Board Games Club Events
  {
    id: "17",
    title: "Monthly Chess Tournament",
    image: "https://example.com/chess_tournament.jpg",
    description: "Compete against fellow chess enthusiasts in our monthly tournament.",
    date: "18-01-2024",
    time: "03:00 PM - 05:00 PM",
    location: "Game Room",
    organization: "HKU",
    type: "University Event",
    subtype: "Society Event",
    name: "Chess and Board Games Club",
  },
  {
    id: "18",
    title: "Board Games Night",
    image: "https://example.com/board_games_night.jpg",
    description: "Join us for a fun evening of various board games and socializing.",
    date: "22-01-2024",
    time: "06:00 PM - 08:00 PM",
    location: "Community Hall",
    organization: "Board Game Enthusiasts",
    type: "External Event",
    subtype: "Community Events",
  },

  // Computer Science Association Events
  {
    id: "19",
    title: "Programming Contest",
    image: "https://example.com/programming_contest.jpg",
    description: "Test your coding skills in our annual programming contest.",
    date: "20-02-2025", // Changed from 28-01-2024
    time: "11:00 AM - 01:00 PM",
    location: "Computer Lab",
    organization: "HKU",
    type: "University Event",
    subtype: "Society Event",
    name: "Computer Science Association",
  },
  {
    id: "20",
    title: "Tech Talk: Emerging Technologies",
    image: "https://example.com/tech_talk.jpg",
    description: "Join industry experts as they discuss the latest trends in technology.",
    date: "30-01-2024",
    time: "01:00 PM - 03:00 PM",
    location: "Auditorium",
    organization: "Tech Innovators Inc.",
    type: "External Event",
    subtype: "Networking",
  },

  // English Debate Society Events
  {
    id: "21",
    title: "Debate Workshop",
    image: "https://example.com/debate_workshop.jpg",
    description: "Enhance your debating skills with our interactive workshop.",
    date: "05-02-2024",
    time: "11:00 AM - 12:00 PM",
    location: "Lecture Hall",
    organization: "HKU",
    type: "University Event",
    subtype: "Society Event",
    name: "English Debate Society",
  },
  {
    id: "22",
    title: "Intercollegiate Debate Competition",
    image: "https://example.com/debate_competition.jpg",
    description: "Compete in debates against teams from other colleges.",
    date: "15-02-2025", // Changed from 10-02-2024
    time: "11:00 AM - 01:00 PM",
    location: "Conference Center",
    organization: "Debate Masters LLC",
    type: "External Event",
    subtype: "Networking",
  },

  // Music Society Events
  {
    id: "23",
    title: "Open Mic Night",
    image: "https://example.com/open_mic.jpg",
    description: "Showcase your musical talents or enjoy performances by others.",
    date: "15-02-2024",
    time: "07:00 PM - 09:00 PM",
    location: "Music Hall",
    organization: "HKU",
    type: "University Event",
    subtype: "Society Event",
    name: "Music Society",
  },
  {
    id: "24",
    title: "Jazz Concert",
    image: "https://example.com/jazz_concert.jpg",
    description: "Experience an evening of smooth jazz performances.",
    date: "20-02-2024",
    time: "08:00 PM - 09:00 PM",
    location: "Concert Arena",
    organization: "Smooth Jazz Entertainment",
    type: "External Event",
    subtype: "Community Events",
  },
];

export default function EventManagement({ navigation }) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEvents, setFilteredEvents] = useState(sampleEvents);
  const [filter, setFilter] = useState("All");

  // State for Society Menu
  const [societyMenuVisible, setSocietyMenuVisible] = useState(false);
  // State for External Event Menu
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

  const handleSearch = (query) => {
    setSearchQuery(query);
    applyFilters(query, filter);
  };

  const handleFilter = (selectedFilter) => {
    // If the selected filter is already active and it's a subcategory, reset to main category
    if (
      (societies.includes(selectedFilter) || externalEvents.includes(selectedFilter)) &&
      filter === selectedFilter
    ) {
      // Reset to main category
      if (societies.includes(selectedFilter)) {
        setFilter("Society Event");
        applyFilters(searchQuery, "Society Event");
      } else if (externalEvents.includes(selectedFilter)) {
        setFilter("External Event");
        applyFilters(searchQuery, "External Event");
      }
    } else {
      // Set to the selected filter
      setFilter(selectedFilter);
      applyFilters(searchQuery, selectedFilter);
    }
  };

  const applyFilters = (query, selectedFilter) => {
    let filtered = sampleEvents;

    // Apply search filter
    if (query.trim() !== "") {
      const lowerCaseQuery = query.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(lowerCaseQuery) ||
          event.organization.toLowerCase().includes(lowerCaseQuery)
      );
    }

    // Apply type and subtype filters
    if (selectedFilter !== "All") {
      // Check if the filter matches any society
      if (societies.includes(selectedFilter)) {
        filtered = filtered.filter(
          (event) =>
            event.type === "University Event" &&
            event.subtype === "Society Event" &&
            event.name === selectedFilter
        );
      }
      // Check if the filter is "Society Event" without a specific subcategory
      else if (selectedFilter === "Society Event") {
        filtered = filtered.filter(
          (event) =>
            event.type === "University Event" && event.subtype === "Society Event"
        );
      }
      // Check if the filter matches any external event subtype
      else if (externalEvents.includes(selectedFilter)) {
        filtered = filtered.filter(
          (event) =>
            event.type === "External Event" && event.subtype === selectedFilter
        );
      }
      // Check for broader categories if any (e.g., "External Event" main category)
      else if (selectedFilter === "External Event") {
        filtered = filtered.filter((event) => event.type === "External Event");
      }
      // Handle "University Event" filter
      else if (selectedFilter === "University Event") {
        filtered = filtered.filter((event) => event.type === "University Event");
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
          style={[styles.searchIcon]}
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
        contentContainerStyle={{ marginBottom: 27 }}
      >
        {/* All Filter Button */}
        <TouchableOpacity
          key="All"
          style={[
            styles.filterButton,
            filter === "All" && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => handleFilter("All")}
        >
          <Text
            style={{
              color: filter === "All" ? "#fff" : theme.colors.Surface,
            }}
          >
            All
          </Text>
        </TouchableOpacity>

        {/* University Event Filter Button */}
        <TouchableOpacity
          key="University Event"
          style={[
            styles.filterButton,
            filter === "University Event" && {
              backgroundColor: theme.colors.primary,
            },
          ]}
          onPress={() => handleFilter("University Event")}
        >
          <Text
            style={{
              color:
                filter === "University Event" ? "#fff" : theme.colors.Surface,
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
                (societies.includes(filter) || filter === "Society Event") && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.filterLabel}
                onPress={() => {
                  // If a subcategory is selected, reset to "Society Event"
                  if (societies.includes(filter)) {
                    handleFilter("Society Event");
                  } else {
                    handleFilter("Society Event");
                  }
                }}
              >
                <Text
                  style={{
                    color:
                      societies.includes(filter) || filter === "Society Event"
                        ? "#fff"
                        : theme.colors.Surface,
                  }}
                >
                  {societies.includes(filter) ? filter : "Society Event"}
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
                    societies.includes(filter) || filter === "Society Event"
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
                handleFilter(society);
                setSocietyMenuVisible(false);
              }}
              title={society}
              titleStyle={{ color: theme.colors.onSurface }}
              style={{
                backgroundColor: theme.colors.surface,
                // Optional: Adjust padding or other styles here
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
                (externalEvents.includes(filter) || filter === "External Event") && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.filterLabel}
                onPress={() => {
                  // Reset to "External Event" when clicking the main button
                  handleFilter("External Event");
                }}
              >
                <Text
                  style={{
                    color:
                      externalEvents.includes(filter) || filter === "External Event"
                        ? "#fff"
                        : theme.colors.Surface,
                  }}
                >
                  {externalEvents.includes(filter) || filter === "External Event"
                    ? filter
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
                    externalEvents.includes(filter) || filter === "External Event"
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
                handleFilter(eventType);
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

      {/* Events List */}
      <FlatList
        showsVerticalScrollIndicator={false}
        data={filteredEvents}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        style={styles.flatListStyle}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    padding: 16,
    marginBottom: -43,
  },
  flatListStyle: {
    flex: 1,
    flexDirection: "column",
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
  filterLabel: {
    flex: 1,
    justifyContent: "center",
  },
  iconButton: {
    paddingLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    marginBottom: 0,
  },
});