import React, { useContext, useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, Menu } from 'react-native-paper';
import { GroupsContext } from '../Context/GroupsContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome'; 

const GroupCard = ({ group }) => {
  const theme = useTheme();
  const { isGroupJoined, joinGroup, leaveGroup } = useContext(GroupsContext);
  const navigation = useNavigation();

  const [visible, setVisible] = useState(false); 

  const joined = isGroupJoined(group.id);

  
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);


  const handlePress = useCallback(() => {
    if (joined) {
      navigation.navigate('ChatPage', { group });
    }
    
  }, [joined, navigation, group]);


  const handleButtonPress = useCallback(() => {
    if (joined) {
      leaveGroup(group.id);
      
    } else {
      joinGroup(group.id);
      
    }
    
    closeMenu();
  }, [joined, leaveGroup, joinGroup, group.id]);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.onSurface },
      ]}
    >
      <TouchableOpacity
        style={styles.infoContainer}
        onPress={handlePress}
        disabled={!joined} 
      >
        <Text
          style={[
            styles.courseName,
            { color: theme.colors.onSurface, opacity: joined ? 1 : 0.6 },
          ]}
        >
          {group.courseName}
        </Text>
        <Text
          style={[
            styles.courseCode,
            { color: theme.colors.onSurfaceVariant, opacity: joined ? 1 : 0.6 },
          ]}
        >
          Code: {group.courseCode}
        </Text>
        <Text
          style={[
            styles.department,
            { color: theme.colors.onSurfaceVariant, opacity: joined ? 1 : 0.6 },
          ]}
        >
          Department: {group.department || 'N/A'}
        </Text>
      </TouchableOpacity>

      {joined ? (
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={
            <TouchableOpacity
              onPress={openMenu}
              style={styles.menuIcon}
              accessibilityLabel="Open group options menu"
              accessible={true}
            >
              <Icon name="ellipsis-v" size={22} color={theme.colors.onSurface} /> 
            </TouchableOpacity>
          }
          contentStyle={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.onSurfaceVariant,
            borderWidth: 0.5,
            borderRadius: 8,
          }}
        >
          <Menu.Item
            onPress={() => {
              handleButtonPress(); 
            }}
            
            title="Leave Group"
            leadingIcon={({ size, color }) => (
              <Icon
                name="times"
                size={size}
                color={color}
                style={styles.menuItemIcon}
              />
            )}
            titleStyle={[{ color: theme.colors.onSurface }, styles.leaveGroupText]}
          />

        </Menu>
      ) : (
        <TouchableOpacity
          style={[styles.button, styles.joinButton, { borderColor: theme.colors.primary }]}
          onPress={handleButtonPress}
        >
          <Text style={[styles.buttonText, styles.joinButtonText]}>Join</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};


export default React.memo(GroupCard);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    borderWidth: 0.5,
  },
  infoContainer: {
    flex: 1,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  courseCode: {
    fontSize: 14,
    marginBottom: 2,
  },
  department: {
    fontSize: 14,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  joinButton: {
    backgroundColor: 'transparent',
  },
  leaveButton: {
    backgroundColor: '#FFCDD2', 
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  joinButtonText: {
    color: '#1877F2', 
  },
  leaveButtonText: {
    color: '#D32F2F', 
  },
  menuIcon: {
    padding: 8,
    fontWeight: '2',
  },
  menuItemIcon: {
    padding: -10,
    
  },
  leaveGroupText: {  
    fontSize: 16, 
    marginLeft: -5, 
  },
});