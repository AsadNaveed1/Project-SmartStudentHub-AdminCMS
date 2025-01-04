// Frontend/Pages/Tabs/Calendar.jsx

import React, { useContext, useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import EventsCard from '../../Components/EventsCard';
import { RegisteredEventsContext } from '../../Context/RegisteredEventsContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome';

// Configure locale settings for the Calendar
LocaleConfig.locales['en'] = {
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  monthNamesShort: [
    'Jan.',
    'Feb.',
    'Mar.',
    'Apr',
    'May',
    'Jun.',
    'Jul.',
    'Aug',
    'Sep.',
    'Oct.',
    'Nov.',
    'Dec.',
  ],
  dayNames: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
  dayNamesShort: ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'],
};
LocaleConfig.defaultLocale = 'en';

const CalendarTab = ({ navigation }) => {
  const theme = useTheme();
  const { registeredEvents } = useContext(RegisteredEventsContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    // Sort registered events by date (upcoming first)
    const sortedEvents = [...registeredEvents].sort((a, b) => {
      const dateA = moment(a.date, 'DD-MM-YYYY');
      const dateB = moment(b.date, 'DD-MM-YYYY');
      return dateA - dateB;
    });
    setFilteredEvents(sortedEvents);
  }, [registeredEvents]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredEvents(registeredEvents);
    } else {
      const lowerCaseQuery = query.toLowerCase();
      const filtered = registeredEvents.filter(
        (event) =>
          event.title.toLowerCase().includes(lowerCaseQuery) ||
          event.organization.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredEvents(filtered);
    }
  };

  // Generate marked dates for the calendar
  const markedDates = {};

  registeredEvents.forEach((event) => {
    const date = moment(event.date, 'DD-MM-YYYY').format('YYYY-MM-DD');
    if (markedDates[date]) {
      markedDates[date].dots.push({ key: event.id, color: theme.colors.primary });
    } else {
      markedDates[date] = {
        dots: [{ key: event.id, color: theme.colors.primary }],
        marked: true,
      };
    }
  });

  // Memoize the calendar theme to ensure it updates on theme change
  const calendarTheme = useMemo(
    () => ({
      backgroundColor: theme.colors.surface,
      calendarBackground: theme.colors.surface,
      textSectionTitleColor: theme.colors.onSurfaceVariant,
      selectedDayBackgroundColor: theme.colors.primary,
      selectedDayTextColor: theme.colors.onPrimary,
      todayTextColor: theme.colors.primary,
      dayTextColor: theme.colors.onSurface,
      textDisabledColor: theme.colors.onSurfaceVariant,
      dotColor: theme.colors.primary,
      selectedDotColor: theme.colors.onPrimary,
      arrowColor: theme.colors.primary,
      monthTextColor: theme.colors.onSurface,
      indicatorColor: theme.colors.primary,
      textDayFontFamily: theme.fonts.medium.fontFamily,
      textMonthFontFamily: theme.fonts.medium.fontFamily,
      textDayHeaderFontFamily: theme.fonts.medium.fontFamily,
      textDayFontWeight: theme.fonts.medium.fontWeight,
      textMonthFontWeight: theme.fonts.medium.fontWeight,
      textDayHeaderFontWeight: theme.fonts.medium.fontWeight,
      // Additional customization can be added here
    }),
    [theme]
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <View
          style={[
            styles.searchBarContainer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.onSurfaceVariant,
            },
          ]}
        >
          <TextInput
            style={[styles.searchBar, { color: theme.colors.onSurface }]}
            placeholder="Search registered events"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          <Icon
            name="search"
            size={20}
            color={theme.colors.onSurface}
            style={styles.searchIcon}
          />
        </View>

        {/* Conditional Rendering of Calendar */}
        {searchQuery.trim() === '' && (
          <Calendar
            key={theme.dark ? 'dark' : 'light'} // Force re-render on theme change
            markedDates={markedDates}
            markingType={'multi-dot'}
            theme={calendarTheme}
            enableSwipeMonths={true} // Enable swipe gestures for month navigation
            style={styles.calendar}
            // Additional Calendar Props as Needed
          />
        )}

        {/* Registered Events List */}
        <View style={styles.eventsList}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((item) => (
              <EventsCard
                key={item.id}
                event={item}
                onPress={() => navigation.navigate('EventDetails', { event: item })}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                {searchQuery.trim() !== ''
                  ? 'No registered events match your search.'
                  : 'You have not registered for any events yet.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CalendarTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    padding: 16,
    marginBottom: -45,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderRadius: 16,
    padding: 12,
    marginBottom: 17,
    marginLeft: 0,
    marginRight: 0,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
  },
  searchIcon: {
    marginLeft: 8,
  },
  calendar: {
    borderRadius: 8,
    marginBottom: 16,
    // Optional: Add elevation or shadow if desired
  },
  eventsList: {
    // No specific styles needed as we're using ScrollView
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
});