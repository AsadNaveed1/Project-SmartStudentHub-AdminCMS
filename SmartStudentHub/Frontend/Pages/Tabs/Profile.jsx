import React, { useContext, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard, 
  ScrollView 
} from 'react-native';
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
  Menu,
  TouchableRipple
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
  const [degreeClassification, setDegreeClassification] = useState(user?.degreeClassification || '');
  const [faculty, setFaculty] = useState(user?.faculty || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [visibleDegreeClassificationMenu, setVisibleDegreeClassificationMenu] = useState(false);
  const openDegreeClassificationMenu = () => setVisibleDegreeClassificationMenu(true);
  const closeDegreeClassificationMenu = () => setVisibleDegreeClassificationMenu(false);
  const [visibleFacultyMenu, setVisibleFacultyMenu] = useState(false);
  const openFacultyMenu = () => setVisibleFacultyMenu(true);
  const closeFacultyMenu = () => setVisibleFacultyMenu(false);
  const [visibleDepartmentMenu, setVisibleDepartmentMenu] = useState(false);
  const openDepartmentMenu = () => setVisibleDepartmentMenu(true);
  const closeDepartmentMenu = () => setVisibleDepartmentMenu(false);
  const facultiesData = {
    "Faculty of Architecture": [
      "Department of Architecture",
      "Department of Real Estate and Construction",
    ],
    "Faculty of Business and Economics": [
      "Department of Business Administration",
      "Department of Economics",
    ],
    "Faculty of Engineering": [
      "Department of Civil Engineering",
      "Department of Computer Science and Information Systems",
      "Department of Electrical and Electronic Engineering",
      "Department of Industrial and Manufacturing Systems Engineering",
      "Department of Mechanical Engineering",
    ],
    "Faculty of Medicine": [
      "Department of Anaesthesiology",
      "Department of Anatomy",
      "Department of Biochemistry",
      "Department of Clinical Oncology",
      "Department of Community Medicine",
      "Department of Diagnostic Radiology",
      "Department of Medicine",
      "Department of Microbiology",
      "Department of Nursing Studies",
      "Department of Obstetrics and Gynaecology",
      "Department of Orthopaedic Surgery",
      "Department of Paediatrics",
      "Department of Pathology",
      "Department of Pharmacology",
      "Department of Physiology",
      "Department of Psychiatry",
      "Department of Surgery",
    ],
    "Faculty of Science": [
      "Department of Chemistry",
      "Department of Earth Sciences",
      "Department of Ecology and Biodiversity",
      "Department of Mathematics",
      "Department of Physics",
      "Department of Statistics and Actuarial Science",
    ],
  };
  const handleUpdateProfile = async () => {
    if (
      !fullName ||
      !username ||
      !university ||
      !universityYear ||
      !degree ||
      !degreeClassification ||
      !faculty ||
      !department
    ) {
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
          degreeClassification,
          faculty,
          department,
          bio,
        },
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        }
      );
      updateUser({ user: response.data });
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
  const handleLogout = () => {
    logout();
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
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
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
          {/* <View style={styles.row}>
            <Text style={[styles.label, { color: theme.colors.onBackground }]}>Full Name:</Text>
            <Text style={[styles.info, { color: theme.colors.onBackground }]}>{user?.fullName || 'N/A'}</Text>
          </View> */}
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.colors.onBackground }]}>Username:</Text>
            <Text style={[styles.info, { color: theme.colors.onBackground }]}>{user?.username || 'N/A'}</Text>
          </View>
          {/* <View style={styles.row}>
            <Text style={[styles.label, { color: theme.colors.onBackground }]}>Email:</Text>
            <Text style={[styles.info, { color: theme.colors.onBackground }]}>{user?.email || 'N/A'}</Text>
          </View> */}
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.colors.onBackground }]}>University:</Text>
            <Text style={[styles.info, { color: theme.colors.onBackground }]}>{user?.university || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.colors.onBackground }]}>University Year:</Text>
            <Text style={[styles.info, { color: theme.colors.onBackground }]}>{user?.universityYear || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.colors.onBackground }]}>Degree:</Text>
            <Text style={[styles.info, { color: theme.colors.onBackground }]}>{user?.degree || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.colors.onBackground }]}>Degree Classification:</Text>
            <Text style={[styles.info, { color: theme.colors.onBackground }]}>
              {user?.degreeClassification
                ? user.degreeClassification.charAt(0).toUpperCase() + user.degreeClassification.slice(1)
                : 'N/A'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.colors.onBackground }]}>Faculty:</Text>
            <Text style={[styles.info, { color: theme.colors.onBackground }]}>{user?.faculty || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.colors.onBackground }]}>Department:</Text>
            <Text style={[styles.info, { color: theme.colors.onBackground }]}>{user?.department || 'N/A'}</Text>
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
      </ScrollView>
      <Portal>
        <Modal 
          visible={visible} 
          onDismiss={hideModal} 
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.background }]}
        >
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
                  label="Email"
                  value={user?.email || ''}
                  mode="outlined"
                  style={styles.modalInput}
                  editable={false}
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
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldTitle}>Degree Classification *</Text>
                  <Menu
                    visible={visibleDegreeClassificationMenu}
                    onDismiss={closeDegreeClassificationMenu}
                    anchor={
                      <TouchableRipple onPress={openDegreeClassificationMenu} style={styles.menuTouchable}>
                        <View pointerEvents="none">
                          <TextInput
                            placeholder="Select degree classification"
                            value={degreeClassification ? degreeClassification.charAt(0).toUpperCase() + degreeClassification.slice(1) : ''}
                            mode="outlined"
                            style={styles.modalInput}
                            editable={false}
                            right={<TextInput.Icon name="menu-down" />}
                          />
                        </View>
                      </TouchableRipple>
                    }
                  >
                    <Menu.Item 
                      onPress={() => { setDegreeClassification('undergraduate'); closeDegreeClassificationMenu(); }} 
                      title="Undergraduate" 
                    />
                    <Menu.Item 
                      onPress={() => { setDegreeClassification('postgraduate'); closeDegreeClassificationMenu(); }} 
                      title="Postgraduate" 
                    />
                    <Menu.Item 
                      onPress={() => { setDegreeClassification('staff'); closeDegreeClassificationMenu(); }} 
                      title="Staff" 
                    />
                  </Menu>
                </View>
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldTitle}>Faculty *</Text>
                  <Menu
                    visible={visibleFacultyMenu}
                    onDismiss={closeFacultyMenu}
                    anchor={
                      <TouchableRipple onPress={openFacultyMenu} style={styles.menuTouchable}>
                        <View pointerEvents="none">
                          <TextInput
                            placeholder="Select faculty"
                            value={faculty || ''}
                            mode="outlined"
                            style={styles.modalInput}
                            editable={false}
                            right={<TextInput.Icon name="menu-down" />}
                          />
                        </View>
                      </TouchableRipple>
                    }
                  >
                    {Object.keys(facultiesData).map((fac) => (
                      <Menu.Item 
                        key={fac} 
                        onPress={() => {
                          setFaculty(fac);
                          setDepartment('');
                          closeFacultyMenu();
                        }} 
                        title={fac} 
                      />
                    ))}
                  </Menu>
                </View>
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldTitle}>Department *</Text>
                  <Menu
                    visible={visibleDepartmentMenu}
                    onDismiss={closeDepartmentMenu}
                    anchor={
                      <TouchableRipple onPress={openDepartmentMenu} style={styles.menuTouchable} disabled={!faculty}>
                        <View pointerEvents="none">
                          <TextInput
                            placeholder="Select department"
                            value={department || ''}
                            mode="outlined"
                            style={styles.multilineInput}
                            multiline={true}
                            numberOfLines={department && department.length > 40 ? 2 : 1}
                            editable={false}
                            right={<TextInput.Icon name="menu-down" />}
                          />
                        </View>
                      </TouchableRipple>
                    }
                  >
                    {faculty 
                      ? facultiesData[faculty].map((dept) => (
                          <Menu.Item 
                            key={dept} 
                            onPress={() => { setDepartment(dept); closeDepartmentMenu(); }} 
                            title={dept} 
                          />
                        ))
                      : <Menu.Item disabled title="Select faculty first" />
                    }
                  </Menu>
                </View>
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
    height: "100%",
    marginBottom: -50,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 70,
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
    flex: 1.6,
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
  multilineInput: {
    marginBottom: 15,
    minHeight: 60,
    textAlignVertical: 'center',
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
  fieldContainer: {
    marginBottom: 15,
  },
  fieldTitle: {
    fontSize: 16,
    marginBottom: 5,
  },
  menuTouchable: {
    width: '100%',
  },
});