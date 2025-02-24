import React, { useContext, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { 
  Avatar, 
  Title, 
  Caption, 
  Text, 
  Button, 
  useTheme, 
  Modal, 
  Portal, 
  TextInput, 
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import { SafeAreaView } from "react-native-safe-area-context";
import { RegisteredEventsContext } from '../../newcontext/RegisteredEventsContext';
import { GroupsContext } from '../../newcontext/GroupsContext';
import { AuthContext } from '../../newcontext/AuthContext';
import axios from 'axios';
const Profile = () => {
  const theme = useTheme();
  const { registeredEvents } = useContext(RegisteredEventsContext);
  const { joinedGroups } = useContext(GroupsContext);
  const { logout, authState, updateUser } = useContext(AuthContext);
  const user = authState.user;
  const [visible, setVisible] = useState(false);
  const hideModal = () => setVisible(false);
  const showModal = () => setVisible(true);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [university, setUniversity] = useState(user?.university || '');
  const [universityYear, setUniversityYear] = useState(user?.universityYear || '');
  const [degree, setDegree] = useState(user?.degree || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const handleLogout = () => {
    logout();
  };
  const handleUpdateProfile = async () => {
    if (!fullName || !username || !university || !universityYear || !degree) {
      setSnackbarMsg('Please fill in all required fields.');
      setSnackbarVisible(true);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.put(
        'http://localhost:5002/api/auth/profile',
        {
          fullName,
          username,
          university,
          universityYear,
          degree,
          bio,
        },
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        }
      );
      updateUser(response.data);
      setSnackbarMsg('Profile updated successfully!');
      setSnackbarVisible(true);
      hideModal();
    } catch (error) {
      console.error('Update profile error:', error.response?.data?.message || error.message);
      setSnackbarMsg(error.response?.data?.message || 'Failed to update profile.');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
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
          <View style={styles.userInfoSection}>
            <Avatar.Image 
              source={{
                uri: user?.profilePic || 'https://via.placeholder.com/150',
              }}
              size={100}
            />
            <Title style={styles.title}>{user?.fullName}</Title>
            <Caption style={styles.caption}>{user?.email}</Caption>
          </View>
          <View style={styles.infoSection}>
            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.colors.onBackground }]}>University:</Text>
              <Text style={[styles.info, { color: theme.colors.onBackground }]}>{user?.university || 'N/A'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.colors.onBackground }]}>University Year:</Text>
              <Text style={[styles.info, { color: theme.colors.onBackground }]}>{user?.universityYear}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.colors.onBackground }]}>Degree:</Text>
              <Text style={[styles.info, { color: theme.colors.onBackground }]}>{user?.degree}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.colors.onBackground }]}>Bio:</Text>
              <Text style={[styles.info, { color: theme.colors.onBackground }]}>{user?.bio || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.statsSection}>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                {registeredEvents.length}
              </Text>
              <Caption style={[styles.statLabel, { color: theme.colors.onBackground }]}>Events Joined</Caption>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                {joinedGroups.length}
              </Text>
              <Caption style={[styles.statLabel, { color: theme.colors.onBackground }]}>Groups Joined</Caption>
            </View>
          </View>
          <View style={styles.buttonSection}>
            <Button mode="contained" onPress={showModal} style={styles.button}>
              Edit Profile
            </Button>
            <Button mode="outlined" onPress={handleLogout} style={styles.button}>
              Logout
            </Button>
          </View>
          {}
          <Portal>
            <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                  <ScrollView>
                    <Text style={styles.modalTitle}>Edit Profile</Text>
                    <TextInput
                      label="Full Name"
                      value={fullName}
                      onChangeText={setFullName}
                      mode="outlined"
                      style={styles.modalInput}
                    />
                    <TextInput
                      label="Username"
                      value={username}
                      onChangeText={setUsername}
                      mode="outlined"
                      style={styles.modalInput}
                    />
                    <TextInput
                      label="University"
                      value={university}
                      onChangeText={setUniversity}
                      mode="outlined"
                      style={styles.modalInput}
                    />
                    <TextInput
                      label="University Year"
                      value={universityYear}
                      onChangeText={setUniversityYear}
                      mode="outlined"
                      style={styles.modalInput}
                    />
                    <TextInput
                      label="Degree"
                      value={degree}
                      onChangeText={setDegree}
                      mode="outlined"
                      style={styles.modalInput}
                    />
                    <TextInput
                      label="Bio"
                      value={bio}
                      onChangeText={setBio}
                      mode="outlined"
                      style={[styles.modalInput, { height: 100 }]}
                      multiline
                      numberOfLines={4}
                    />
                    {loading ? (
                      <ActivityIndicator animating={true} size="large" style={styles.loadingIndicator} />
                    ) : (
                      <Button mode="contained" onPress={handleUpdateProfile} style={styles.updateButton}>
                        Save Changes
                      </Button>
                    )}
                    <Button mode="text" onPress={hideModal} style={styles.cancelButton}>
                      Cancel
                    </Button>
                  </ScrollView>
                </KeyboardAvoidingView>
              </TouchableWithoutFeedback>
            </Modal>
          </Portal>
          {}
          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={3000}
            action={{
              label: 'Close',
              onPress: () => {
                setSnackbarVisible(false);
              },
            }}
          >
            {snackbarMsg}
          </Snackbar>
      </SafeAreaView>
    );
};
export default Profile;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  userInfoSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    marginTop: 10,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
    color: '#777777',
  },
  infoSection: {
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    flex: 1,
    fontSize: 16,
  },
  info: {
    flex: 2,
    fontSize: 16,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    width: '40%',
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  modalInput: {
    marginBottom: 15,
  },
  updateButton: {
    marginTop: 10,
    padding: 8,
  },
  cancelButton: {
    marginTop: 10,
    padding: 8,
  },
  loadingIndicator: {
    marginTop: 10,
    alignSelf: 'center',
  },
});