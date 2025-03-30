import React, { useState, useEffect, useContext } from "react";
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
import { RegisteredEventsContext } from "../../newcontext/RegisteredEventsContext";
import { OrganizationsContext } from "../../newcontext/OrganizationsContext";
import { GroupsContext } from "../../newcontext/GroupsContext";
import { RecommendationsContext } from "../../newcontext/RecommendationsContext";
export default function EventManagement({ navigation }) {
  const theme = useTheme();
  const { events } = useContext(RegisteredEventsContext);
  const { organizations, isLoading: orgLoading } = useContext(OrganizationsContext);
  const { groups } = useContext(GroupsContext);
  const { 
    contentBased, 
    mlBased, 
    isLoading: recLoading, 
    error, 
    fetchRecommendations 
  } = useContext(RecommendationsContext); 
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [filteredOrganizations, setFilteredOrganizations] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All");
  const [eventCategoryFilter, setEventCategoryFilter] = useState("All");
  const [allMenuVisible, setAllMenuVisible] = useState(false);
  const [societyMenuVisible, setSocietyMenuVisible] = useState(false);
  const [externalMenuVisible, setExternalMenuVisible] = useState(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const societies = [
    "Artificial Intelligence Society",
    "Arts Association",
    "Chess and Board Games Club",
    "Computer Science Association",
    "English Debate Society",
    "Music Society",
  ];
  const externalEvents = ["Volunteer", "Community Events", "Networking"];
  const eventCategories = [
    "Architecture & Engineering",
    "Business & Economics",
    "Culture and Arts",
    "Education",
    "Law and Politics",
    "Medical & Health Care",
    "Science & Technology",
    "Social Development & Welfare",
    "Sports and Recreation",
    "Others"
  ];
  const timeFilterOptions = ["All", "This Week", "Next Week", "This Month", "Next Month"];
  useEffect(() => {
    if (showRecommendations) {
      return;
    }
    applyFilters(searchQuery, categoryFilter, timeFilter, eventCategoryFilter);
  }, [events, organizations, searchQuery, categoryFilter, timeFilter, eventCategoryFilter, showRecommendations]);
  useEffect(() => {
    if (searchQuery.trim() !== "") {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const matchedOrgs = organizations.filter(org =>
        org.name.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredOrganizations(matchedOrgs);
    } else {
      setFilteredOrganizations([]);
    }
  }, [searchQuery, organizations]);
  const handleSearch = (query) => {
    setSearchQuery(query);
    setShowRecommendations(false);
  };
  const handleCategoryFilter = (selectedFilter) => {
    if (
      (societies.includes(selectedFilter) || externalEvents.includes(selectedFilter)) &&
      categoryFilter === selectedFilter
    ) {
      if (societies.includes(selectedFilter)) {
        setCategoryFilter("Society Event");
        applyFilters(searchQuery, "Society Event", timeFilter, eventCategoryFilter);
      } else if (externalEvents.includes(selectedFilter)) {
        setCategoryFilter("External Event");
        applyFilters(searchQuery, "External Event", timeFilter, eventCategoryFilter);
      }
    } else {
      setCategoryFilter(selectedFilter);
      applyFilters(searchQuery, selectedFilter, timeFilter, eventCategoryFilter);
    }
    setShowRecommendations(false);
    if (selectedFilter !== "By Category") {
      setEventCategoryFilter("All");
    }
  };
  const handleTimeFilter = (selectedTime) => {
    setTimeFilter(selectedTime);
    applyFilters(searchQuery, categoryFilter, selectedTime, eventCategoryFilter);
    setShowRecommendations(false);
  };
  const handleEventCategoryFilter = (selectedCategory) => {
    setEventCategoryFilter(selectedCategory);
    applyFilters(searchQuery, categoryFilter, timeFilter, selectedCategory);
    setShowRecommendations(false);
    if (selectedCategory !== "All") {
      setCategoryFilter("By Category");
    }
  };
  const handleByCategoryClick = () => {
    setCategoryFilter("By Category");
    setEventCategoryFilter("All");
    setShowRecommendations(false);
    applyFiltersByEventCategories();
  };
  const applyFiltersByEventCategories = () => {
    let filtered = events.filter(event => 
      eventCategories.includes(event.subtype)
    );
    if (timeFilter !== "All") {
      filtered = applyTimeFilter(filtered, timeFilter);
    }
    setFilteredEvents(filtered);
  };
  const applyTimeFilter = (events, selectedTime) => {
    if (selectedTime === "All") return events;
    const now = moment();
    if (selectedTime === "This Week") {
      const startOfWeek = moment().startOf("isoWeek");
      const endOfWeek = moment().endOf("isoWeek");
      return events.filter((event) => {
        const eventDate = moment(event.date, "DD-MM-YYYY");
        return eventDate.isBetween(startOfWeek, endOfWeek, null, "[]");
      });
    } else if (selectedTime === "Next Week") {
      const startOfNextWeek = moment().add(1, "weeks").startOf("isoWeek");
      const endOfNextWeek = moment().add(1, "weeks").endOf("isoWeek");
      return events.filter((event) => {
        const eventDate = moment(event.date, "DD-MM-YYYY");
        return eventDate.isBetween(startOfNextWeek, endOfNextWeek, null, "[]");
      });
    } else if (selectedTime === "This Month") {
      const startOfMonth = moment().startOf("month");
      const endOfMonth = moment().endOf("month");
      return events.filter((event) => {
        const eventDate = moment(event.date, "DD-MM-YYYY");
        return eventDate.isBetween(startOfMonth, endOfMonth, null, "[]");
      });
    } else if (selectedTime === "Next Month") {
      const startOfNextMonth = moment().add(1, "months").startOf("month");
      const endOfNextMonth = moment().add(1, "months").endOf("month");
      return events.filter((event) => {
        const eventDate = moment(event.date, "DD-MM-YYYY");
        return eventDate.isBetween(startOfNextMonth, endOfNextMonth, null, "[]");
      });
    }
    return events;
  };
  const applyFilters = (query, selectedCategory, selectedTime, selectedEventCategory) => {
    let filtered = events;
    if (query.trim() !== "") {
      const lowerCaseQuery = query.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(lowerCaseQuery) ||
          (event.organization && event.organization.name.toLowerCase().includes(lowerCaseQuery))
      );
    }
    if (selectedCategory === "By Category") {
      filtered = filtered.filter(event => 
        eventCategories.includes(event.subtype)
      );
      if (selectedEventCategory !== "All") {
        filtered = filtered.filter((event) => event.subtype === selectedEventCategory);
      }
    } else if (selectedCategory !== "All") {
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
      } else if (selectedCategory === "University Event") {
        filtered = filtered.filter((event) => event.type === "University Event");
      }
    } else if (selectedEventCategory !== "All") {
      filtered = filtered.filter((event) => event.subtype === selectedEventCategory);
    }
    if (selectedTime !== "All") {
      filtered = applyTimeFilter(filtered, selectedTime);
    }
    setFilteredEvents(filtered);
  };
  const handleShowRecommendations = () => {
    fetchRecommendations();
    setCategoryFilter("All");
    setTimeFilter("All");
    setEventCategoryFilter("All");
    setShowRecommendations(true);
  };
  const renderEvent = ({ item }) => (
    <EventsCard
      event={item}
      onPress={() => navigation.navigate("EventDetails", { event: item })}
      isRecommended={item.isRecommended}
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
  const getSections = () => {
    const sections = [];
    if (showRecommendations) {
      if (contentBased.length > 0) {
        sections.push({
          title: "Recommendations",
          data: contentBased,
          type: "event",
        });
      }
      if (mlBased.length > 0) {
        sections.push({
          title: "Others also joined these events",
          data: mlBased,
          type: "event",
        });
      }
    } else {
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
      <View
        style={[
          styles.searchBarContainer,
          {
            backgroundColor: theme.colors.surface,
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
        <Menu
          visible={allMenuVisible}
          onDismiss={() => setAllMenuVisible(false)}
          anchor={
            <View
              style={[
                styles.filterButton,
                timeFilter !== "All" && { backgroundColor: theme.colors.primary },
              ]}
            >
              <TouchableOpacity
                style={styles.filterLabel}
                onPress={() => {
                  handleTimeFilter("All");
                  setAllMenuVisible(false);
                }}
              >
                <Text
                  style={{
                    color:
                      timeFilter !== "All"
                        ? "#fff"
                        : theme.colors.Surface,
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
                    timeFilter !== "All"
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
                categoryFilter === "All"
                  ? "#fff"
                  : theme.colors.Surface,
            }}
          >
            All Categories
          </Text>
        </TouchableOpacity>
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
                  : theme.colors.Surface,
            }}
          >
            University Event
          </Text>
        </TouchableOpacity>
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
                  setSocietyMenuVisible(false);
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
                  setExternalMenuVisible(false);
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
                  {externalEvents.includes(categoryFilter)
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
        {}
        <Menu
          visible={categoryMenuVisible}
          onDismiss={() => setCategoryMenuVisible(false)}
          anchor={
            <View
              style={[
                styles.filterButton,
                (categoryFilter === "By Category" || eventCategoryFilter !== "All") && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.filterLabel}
                onPress={handleByCategoryClick}
              >
                <Text
                  style={{
                    color:
                      (categoryFilter === "By Category" || eventCategoryFilter !== "All")
                        ? "#fff"
                        : theme.colors.Surface,
                  }}
                >
                  {eventCategoryFilter !== "All" ? eventCategoryFilter : "By Category"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setCategoryMenuVisible(true)}
                style={styles.iconButton}
              >
                <Icon
                  name="caret-down"
                  size={16}
                  color={
                    (categoryFilter === "By Category" || eventCategoryFilter !== "All")
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
          <Menu.Item
            key="AllEventCategories"
            onPress={() => {
              handleEventCategoryFilter("All");
              setCategoryFilter("By Category");
              setCategoryMenuVisible(false);
            }}
            title="All Categories"
            titleStyle={{ color: theme.colors.onSurface }}
            style={{
              backgroundColor: theme.colors.surface,
            }}
          />
          {eventCategories.map((category) => (
            <Menu.Item
              key={category}
              onPress={() => {
                handleEventCategoryFilter(category);
                setCategoryMenuVisible(false);
              }}
              title={category}
              titleStyle={{ color: theme.colors.onSurface }}
              style={{
                backgroundColor: theme.colors.surface,
              }}
            />
          ))}
        </Menu>
        <TouchableOpacity
          key="Recommendations"
          style={[
            styles.filterButton,
            showRecommendations && { backgroundColor: theme.colors.primary },
          ]}
          onPress={handleShowRecommendations}
        >
          <Text
            style={{
              color:
                showRecommendations
                  ? "#fff"
                  : theme.colors.Surface,
            }}
          >
            Recommendations
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <SectionList
        sections={sections}
        keyExtractor={(item) => (item.eventId ? item.eventId.toString() : item.organizationId)}
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
    paddingBottom: 50, 
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
  filterLabel: {
    flex: 1,
  },
  iconButton: {
    paddingLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 8,
    paddingHorizontal: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
});