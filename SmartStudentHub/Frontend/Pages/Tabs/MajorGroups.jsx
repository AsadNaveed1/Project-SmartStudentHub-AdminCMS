import React, { useState, useContext, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme, Menu } from 'react-native-paper';
import { GroupsContext } from '../../context/GroupsContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import GroupCard from '../../Components/GroupCard';
import CreateGroupModal from '../../Components/CreateGroupModal';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SectionList } from 'react-native';

export default function MajorGroups() {
  const theme = useTheme();
  const {
    groups,
    joinedGroups,
    isGroupJoined,
    joinGroup,
    leaveGroup,
    isLoading,
    error,
  } = useContext(GroupsContext);

  const [searchQuery, setSearchQuery] = useState('');

  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [commonCoreFilter, setCommonCoreFilter] = useState('All');
  const [otherFilter, setOtherFilter] = useState('All');

  const [departmentMenuVisible, setDepartmentMenuVisible] = useState(false);
  const [commonCoreMenuVisible, setCommonCoreMenuVisible] = useState(false);
  const [otherMenuVisible, setOtherMenuVisible] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const departments = [
    'Architecture',
    'Biomedical Engineering',
    'Computer Science',
    'Economics',
    'School of Business',
  ];

  const commonCores = [
    'Science, Technology and Big Data',
    'Arts and Humanities',
    'Global Issues',
    'China: Culture, State and Society',
  ];

  const others = ['General Study Group', 'Sports & Recreation', 'Cultural Exchange'];

  /**
   * Compute Available Groups (not joined)
   */
  const availableGroups = useMemo(() => {
    return groups.filter((group) => !isGroupJoined(group.groupId));
  }, [groups, isGroupJoined]);

  /**
   * Determine if any search or filter is active
   */
  const isSearching = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      departmentFilter !== 'All' ||
      commonCoreFilter !== 'All' ||
      otherFilter !== 'All'
    );
  }, [searchQuery, departmentFilter, commonCoreFilter, otherFilter]);

  /**
   * Compute Filtered Available Groups based on search and filters
   */
  const filteredAvailableGroups = useMemo(() => {
    let filtered = availableGroups;

    if (searchQuery.trim() !== '') {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (group) =>
          group.courseName.toLowerCase().includes(lowerCaseQuery) ||
          group.courseCode.toLowerCase().includes(lowerCaseQuery)
      );
    }

    if (departmentFilter !== 'All') {
      filtered = filtered.filter((group) => group.department === departmentFilter);
    }

    if (commonCoreFilter !== 'All') {
      filtered = filtered.filter((group) => group.commonCore === commonCoreFilter);
    }

    if (otherFilter !== 'All') {
      filtered = filtered.filter(
        (group) => !group.department && !group.commonCore
      );
    }

    return filtered;
  }, [availableGroups, searchQuery, departmentFilter, commonCoreFilter, otherFilter]);

  /**
   * Compute Filtered Joined Groups based on search and filters
   */
  const filteredJoinedGroups = useMemo(() => {
    let filtered = joinedGroups;

    if (searchQuery.trim() !== '') {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (group) =>
          group.courseName.toLowerCase().includes(lowerCaseQuery) ||
          group.courseCode.toLowerCase().includes(lowerCaseQuery)
      );
    }

    if (departmentFilter !== 'All') {
      filtered = filtered.filter((group) => group.department === departmentFilter);
    }

    if (commonCoreFilter !== 'All') {
      filtered = filtered.filter((group) => group.commonCore === commonCoreFilter);
    }

    if (otherFilter !== 'All') {
      filtered = filtered.filter(
        (group) => !group.department && !group.commonCore
      );
    }

    return filtered;
  }, [joinedGroups, searchQuery, departmentFilter, commonCoreFilter, otherFilter]);

  /**
   * Organize sections based on search/filter state
   */
  const sections = useMemo(() => {
    if (isSearching) {
      const sectionData = [];

      if (filteredJoinedGroups.length > 0) {
        sectionData.push({
          title: 'Joined Groups',
          data: filteredJoinedGroups,
        });
      }

      if (filteredAvailableGroups.length > 0) {
        sectionData.push({
          title: 'Available Groups',
          data: filteredAvailableGroups,
        });
      }

      return sectionData;
    } else {
      if (joinedGroups.length > 0) {
        return [
          {
            title: 'Joined Groups',
            data: joinedGroups,
          },
        ];
      } else {
        return [];
      }
    }
  }, [isSearching, filteredJoinedGroups, filteredAvailableGroups, joinedGroups]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleDepartmentFilter = (selectedFilter) => {
    setDepartmentFilter(selectedFilter);
  };

  const handleCommonCoreFilter = (selectedFilter) => {
    setCommonCoreFilter(selectedFilter);
  };

  const handleOtherFilter = (selectedFilter) => {
    setOtherFilter(selectedFilter);
  };

  const openCreateGroupModal = () => {
    setIsModalVisible(true);
  };

  const closeCreateGroupModal = () => {
    setIsModalVisible(false);
  };

  const renderGroup = ({ item }) => <GroupCard group={item} />;

  const renderSectionHeader = ({ section: { title } }) => (
    <Text style={[styles.sectionHeader, { color: theme.colors.onSurface }]}>
      {title}
    </Text>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={{ color: 'red', fontSize: 16 }}>{error}</Text>
        </View>
      );
    }

    if (sections.length === 0) {
      if (!isSearching && joinedGroups.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 16 }}>
              Not registered for any groups yet.
            </Text>
          </View>
        );
      } else {
        return (
          <View style={styles.emptyContainer}>
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 16 }}>
              No groups found.
            </Text>
          </View>
        );
      }
    }

    return (
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.groupId.toString()}
        renderItem={renderGroup}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.sectionListContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    );
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
      <View style={styles.searchCreateContainer}>
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
            placeholder="Search groups by name or code"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <Icon name="search" size={20} color={theme.colors.onSurfaceVariant} />
        </View>

        <TouchableOpacity style={styles.createButton} onPress={openCreateGroupModal}>
          <Icon name="plus-circle" size={35} color={theme.colors.primary} />
        </TouchableOpacity>
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
        contentContainerStyle={{ marginBottom: 8 }}
      >
        {/* Department Filter */}
        <Menu
          visible={departmentMenuVisible}
          onDismiss={() => setDepartmentMenuVisible(false)}
          anchor={
            <TouchableOpacity
              style={[
                styles.filterButton,
                departmentFilter !== 'All' && { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setDepartmentMenuVisible(true)}
            >
              <Text
                style={{
                  color: departmentFilter !== 'All' ? '#fff' : theme.colors.onSurface,
                  marginRight: 6,
                }}
              >
                {departmentFilter === 'All' ? 'Department' : departmentFilter}
              </Text>
              <Icon
                name="caret-down"
                size={16}
                color={departmentFilter !== 'All' ? '#fff' : theme.colors.onSurface}
              />
            </TouchableOpacity>
          }
        >
          <Menu.Item
            onPress={() => {
              handleDepartmentFilter('All');
              setDepartmentMenuVisible(false);
            }}
            title="All"
          />
          {departments.map((dept) => (
            <Menu.Item
              key={dept}
              onPress={() => {
                handleDepartmentFilter(dept);
                setDepartmentMenuVisible(false);
              }}
              title={dept}
            />
          ))}
        </Menu>

        {/* Common Core Filter */}
        <Menu
          visible={commonCoreMenuVisible}
          onDismiss={() => setCommonCoreMenuVisible(false)}
          anchor={
            <TouchableOpacity
              style={[
                styles.filterButton,
                commonCoreFilter !== 'All' && { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setCommonCoreMenuVisible(true)}
            >
              <Text
                style={{
                  color: commonCoreFilter !== 'All' ? '#fff' : theme.colors.onSurface,
                  marginRight: 6,
                }}
              >
                {commonCoreFilter === 'All' ? 'Common Cores' : commonCoreFilter}
              </Text>
              <Icon
                name="caret-down"
                size={16}
                color={commonCoreFilter !== 'All' ? '#fff' : theme.colors.onSurface}
              />
            </TouchableOpacity>
          }
        >
          <Menu.Item
            onPress={() => {
              handleCommonCoreFilter('All');
              setCommonCoreMenuVisible(false);
            }}
            title="All"
          />
          {commonCores.map((core) => (
            <Menu.Item
              key={core}
              onPress={() => {
                handleCommonCoreFilter(core);
                setCommonCoreMenuVisible(false);
              }}
              title={core}
            />
          ))}
        </Menu>

        {/* Other Filter */}
        <Menu
          visible={otherMenuVisible}
          onDismiss={() => setOtherMenuVisible(false)}
          anchor={
            <TouchableOpacity
              style={[
                styles.filterButton,
                otherFilter !== 'All' && { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setOtherMenuVisible(true)}
            >
              <Text
                style={{
                  color: otherFilter !== 'All' ? '#fff' : theme.colors.onSurface,
                  marginRight: 6,
                }}
              >
                {otherFilter === 'All' ? 'Others' : otherFilter}
              </Text>
              <Icon
                name="caret-down"
                size={16}
                color={otherFilter !== 'All' ? '#fff' : theme.colors.onSurface}
              />
            </TouchableOpacity>
          }
        >
          <Menu.Item
            onPress={() => {
              handleOtherFilter('All');
              setOtherMenuVisible(false);
            }}
            title="All"
          />
          {others.map((other) => (
            <Menu.Item
              key={other}
              onPress={() => {
                handleOtherFilter(other);
                setOtherMenuVisible(false);
              }}
              title={other}
            />
          ))}
        </Menu>
      </ScrollView>

      {renderContent()}

      <CreateGroupModal visible={isModalVisible} onDismiss={closeCreateGroupModal} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    padding: 16,
    marginBottom: -50,
  },
  searchCreateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    flexGrow: 0,
    marginBottom: 10,
  },
  filterButton: {
    height: 40,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
    flexDirection: 'row',
  },
  sectionListContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});