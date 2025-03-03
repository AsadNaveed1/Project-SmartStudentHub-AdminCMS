import React, { useState, useContext } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  useTheme,
  TouchableRipple,
  Menu,
} from "react-native-paper";
import { AuthContext } from "../newcontext/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
const SignupScreen = () => {
  const theme = useTheme();
  const { signup } = useContext(AuthContext);
  const navigation = useNavigation();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [university, setUniversity] = useState("");
  const [universityYear, setUniversityYear] = useState("");
  const [degree, setDegree] = useState("");
  const [bio, setBio] = useState("");
  const [degreeClassification, setDegreeClassification] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [visibleUniversity, setVisibleUniversity] = useState(false);
  const openUniversityMenu = () => setVisibleUniversity(true);
  const closeUniversityMenu = () => setVisibleUniversity(false);
  const [visibleYear, setVisibleYear] = useState(false);
  const openYearMenu = () => setVisibleYear(true);
  const closeYearMenu = () => setVisibleYear(false);
  const [visibleDegreeClassification, setVisibleDegreeClassification] = useState(false);
  const openDegreeClassificationMenu = () => setVisibleDegreeClassification(true);
  const closeDegreeClassificationMenu = () => setVisibleDegreeClassification(false);
  const [visibleFaculty, setVisibleFaculty] = useState(false);
  const openFacultyMenu = () => setVisibleFaculty(true);
  const closeFacultyMenu = () => setVisibleFaculty(false);
  const [visibleDepartment, setVisibleDepartment] = useState(false);
  const openDepartmentMenu = () => setVisibleDepartment(true);
  const closeDepartmentMenu = () => setVisibleDepartment(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const toggleSecureTextEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };
  const BIO_MAX_LENGTH = 150;
  const faculties = {
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
  const handleSignup = async () => {
    if (
      !fullName ||
      !username ||
      !email ||
      !password ||
      !university ||
      !universityYear ||
      !degree ||
      !degreeClassification ||
      !faculty ||
      !department
    ) {
      alert("Please fill in all required fields.");
      return;
    }
    const userData = {
      fullName,
      username,
      email,
      password,
      university,
      universityYear,
      degree,
      degreeClassification,
      faculty,
      department,
      bio,
    };
    try {
      await signup(userData);
      navigation.navigate("Main");
    } catch (error) {
      console.error("Signup failed:", error);
      alert("Signup failed. Please try again.");
    }
  };
  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
        },
      ]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.innerContainer}>
              <Text
                style={[
                  styles.title,
                  { color: theme.colors.onSurface },
                ]}
              >
                Create an Account
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: theme.colors.onSurface },
                ]}
              >
                Join us today
              </Text>
              
              <View style={styles.fieldContainer}>
                <View style={styles.fieldTitleContainer}>
                  <Text
                    style={[
                      styles.fieldTitle,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    Full Name
                  </Text>
                  <Text style={styles.asterisk}>*</Text>
                </View>
                <TextInput
                  placeholder="Enter your full name"
                  placeholderTextColor={theme.colors.placeholder}
                  value={fullName}
                  onChangeText={setFullName}
                  mode="outlined"
                  style={styles.input}
                  autoCapitalize="words"
                  returnKeyType="next"
                  maxLength={50}
                  textAlignVertical="center"
                  theme={{ colors: { primary: theme.colors.primary } }}
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <View style={styles.fieldTitleContainer}>
                  <Text
                    style={[
                      styles.fieldTitle,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    Username
                  </Text>
                  <Text style={styles.asterisk}>*</Text>
                </View>
                <TextInput
                  placeholder="Choose a username"
                  placeholderTextColor={theme.colors.placeholder}
                  value={username}
                  onChangeText={setUsername}
                  mode="outlined"
                  style={styles.input}
                  autoCapitalize="none"
                  returnKeyType="next"
                  maxLength={30}
                  textAlignVertical="center"
                  theme={{ colors: { primary: theme.colors.primary } }}
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <View style={styles.fieldTitleContainer}>
                  <Text
                    style={[
                      styles.fieldTitle,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    Email
                  </Text>
                  <Text style={styles.asterisk}>*</Text>
                </View>
                <TextInput
                  placeholder="Enter your email address"
                  placeholderTextColor={theme.colors.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCompleteType="email"
                  returnKeyType="next"
                  maxLength={50}
                  textAlignVertical="center"
                  theme={{ colors: { primary: theme.colors.primary } }}
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <View style={styles.fieldTitleContainer}>
                  <Text
                    style={[
                      styles.fieldTitle,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    Password
                  </Text>
                  <Text style={styles.asterisk}>*</Text>
                </View>
                <TextInput
                  placeholder="Create a password"
                  placeholderTextColor={theme.colors.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  style={styles.input}
                  secureTextEntry={secureTextEntry}
                  right={
                    <TextInput.Icon
                      name={secureTextEntry ? "eye-off" : "eye"}
                      onPress={toggleSecureTextEntry}
                      color={theme.colors.onSurface}
                    />
                  }
                  returnKeyType="next"
                  maxLength={30}
                  textAlignVertical="center"
                  theme={{ colors: { primary: theme.colors.primary } }}
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <View style={styles.fieldTitleContainer}>
                  <Text
                    style={[
                      styles.fieldTitle,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    University
                  </Text>
                  <Text style={styles.asterisk}>*</Text>
                </View>
                <Menu
                  visible={visibleUniversity}
                  onDismiss={closeUniversityMenu}
                  anchor={
                    <TouchableOpacity
                      onPress={openUniversityMenu}
                      activeOpacity={1}
                      style={styles.menuTouchable}
                    >
                      <View pointerEvents="none">
                        <TextInput
                          placeholder="Select your university"
                          placeholderTextColor={theme.colors.placeholder}
                          value={university}
                          mode="outlined"
                          style={styles.input}
                          editable={false}
                          right={<TextInput.Icon name="menu-down" />}
                          theme={{ colors: { primary: theme.colors.primary } }}
                        />
                      </View>
                    </TouchableOpacity>
                  }
                >
                  <Menu.Item
                    onPress={() => {
                      setUniversity("The University of Hong Kong");
                      closeUniversityMenu();
                    }}
                    title="The University of Hong Kong"
                  />
                  <Menu.Item
                    onPress={() => {
                      setUniversity(
                        "Hong Kong University of Science and Technology"
                      );
                      closeUniversityMenu();
                    }}
                    title="Hong Kong University of Science and Technology"
                  />
                  <Menu.Item
                    onPress={() => {
                      setUniversity("City University of Hong Kong");
                      closeUniversityMenu();
                    }}
                    title="City University of Hong Kong"
                  />
                  
                </Menu>
              </View>
              
              <View style={styles.fieldContainer}>
                <View style={styles.fieldTitleContainer}>
                  <Text
                    style={[
                      styles.fieldTitle,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    University Year
                  </Text>
                  <Text style={styles.asterisk}>*</Text>
                </View>
                <Menu
                  visible={visibleYear}
                  onDismiss={closeYearMenu}
                  anchor={
                    <TouchableOpacity
                      onPress={openYearMenu}
                      activeOpacity={1}
                      style={styles.menuTouchable}
                    >
                      <View pointerEvents="none">
                        <TextInput
                          placeholder="Select your university year"
                          placeholderTextColor={theme.colors.placeholder}
                          value={universityYear}
                          mode="outlined"
                          style={styles.input}
                          editable={false}
                          right={<TextInput.Icon name="menu-down" />}
                          theme={{ colors: { primary: theme.colors.primary } }}
                        />
                      </View>
                    </TouchableOpacity>
                  }
                >
                  <Menu.Item
                    onPress={() => {
                      setUniversityYear("1st Year");
                      closeYearMenu();
                    }}
                    title="1st Year"
                  />
                  <Menu.Item
                    onPress={() => {
                      setUniversityYear("2nd Year");
                      closeYearMenu();
                    }}
                    title="2nd Year"
                  />
                  <Menu.Item
                    onPress={() => {
                      setUniversityYear("3rd Year");
                      closeYearMenu();
                    }}
                    title="3rd Year"
                  />
                  <Menu.Item
                    onPress={() => {
                      setUniversityYear("4th Year");
                      closeYearMenu();
                    }}
                    title="4th Year"
                  />
                  <Menu.Item
                    onPress={() => {
                      setUniversityYear("5th Year");
                      closeYearMenu();
                    }}
                    title="5th Year"
                  />
                </Menu>
              </View>
              
              <View style={styles.fieldContainer}>
                <View style={styles.fieldTitleContainer}>
                  <Text
                    style={[
                      styles.fieldTitle,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    Degree
                  </Text>
                  <Text style={styles.asterisk}>*</Text>
                  <Text
                    style={[
                      styles.fieldTitlesub,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    e.g Computer Engineering
                  </Text>
                </View>
                <TextInput
                  placeholder="Enter your degree"
                  placeholderTextColor={theme.colors.placeholder}
                  value={degree}
                  onChangeText={setDegree}
                  mode="outlined"
                  style={styles.input}
                  autoCapitalize="words"
                  returnKeyType="next"
                  maxLength={50}
                  textAlignVertical="center"
                  theme={{ colors: { primary: theme.colors.primary } }}
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <View style={styles.fieldTitleContainer}>
                  <Text
                    style={[
                      styles.fieldTitle,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    Degree Classification
                  </Text>
                  <Text style={styles.asterisk}>*</Text>
                </View>
                <Menu
                  visible={visibleDegreeClassification}
                  onDismiss={closeDegreeClassificationMenu}
                  anchor={
                    <TouchableOpacity
                      onPress={openDegreeClassificationMenu}
                      activeOpacity={1}
                      style={styles.menuTouchable}
                    >
                      <View pointerEvents="none">
                        <TextInput
                          placeholder="Select degree classification"
                          placeholderTextColor={theme.colors.placeholder}
                          value={
                            degreeClassification
                              ? degreeClassification.charAt(0).toUpperCase() +
                                degreeClassification.slice(1)
                              : ""
                          }
                          mode="outlined"
                          style={styles.input}
                          editable={false}
                          right={<TextInput.Icon name="menu-down" />}
                          theme={{ colors: { primary: theme.colors.primary } }}
                        />
                      </View>
                    </TouchableOpacity>
                  }
                >
                  <Menu.Item
                    onPress={() => {
                      setDegreeClassification("undergraduate");
                      closeDegreeClassificationMenu();
                    }}
                    title="Undergraduate"
                  />
                  <Menu.Item
                    onPress={() => {
                      setDegreeClassification("postgraduate");
                      closeDegreeClassificationMenu();
                    }}
                    title="Postgraduate"
                  />
                  <Menu.Item
                    onPress={() => {
                      setDegreeClassification("staff");
                      closeDegreeClassificationMenu();
                    }}
                    title="Staff"
                  />
                </Menu>
              </View>
              
              <View style={styles.fieldContainer}>
                <View style={styles.fieldTitleContainer}>
                  <Text
                    style={[
                      styles.fieldTitle,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    Faculty
                  </Text>
                  <Text style={styles.asterisk}>*</Text>
                </View>
                <Menu
                  visible={visibleFaculty}
                  onDismiss={closeFacultyMenu}
                  anchor={
                    <TouchableOpacity
                      onPress={openFacultyMenu}
                      activeOpacity={1}
                      style={styles.menuTouchable}
                    >
                      <View pointerEvents="none">
                        <TextInput
                          placeholder="Select your faculty"
                          placeholderTextColor={theme.colors.placeholder}
                          value={faculty}
                          mode="outlined"
                          style={styles.input}
                          editable={false}
                          right={<TextInput.Icon name="menu-down" />}
                          theme={{ colors: { primary: theme.colors.primary } }}
                        />
                      </View>
                    </TouchableOpacity>
                  }
                >
                  {Object.keys(faculties).map((fac) => (
                    <Menu.Item
                      key={fac}
                      onPress={() => {
                        setFaculty(fac);
                        setDepartment("");
                        closeFacultyMenu();
                      }}
                      title={fac}
                    />
                  ))}
                </Menu>
              </View>
              
              <View style={styles.fieldContainer}>
                <View style={styles.fieldTitleContainer}>
                  <Text
                    style={[
                      styles.fieldTitle,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    Department
                  </Text>
                  <Text style={styles.asterisk}>*</Text>
                </View>
                <Menu
                  visible={visibleDepartment}
                  onDismiss={closeDepartmentMenu}
                  anchor={
                    <TouchableOpacity
                      onPress={openDepartmentMenu}
                      activeOpacity={1}
                      style={styles.menuTouchable}
                      disabled={!faculty}
                    >
                      <View pointerEvents="none">
                        <TextInput
                          placeholder="Select your department"
                          placeholderTextColor={theme.colors.placeholder}
                          value={department}
                          mode="outlined"
                          style={styles.multilineInput}
                          multiline={true}
                          numberOfLines={department && department.length > 40 ? 2 : 1}
                          editable={false}
                          right={<TextInput.Icon name="menu-down" />}
                          theme={{ colors: { primary: theme.colors.primary } }}
                        />
                      </View>
                    </TouchableOpacity>
                  }
                >
                  {faculty
                    ? faculties[faculty].map((dept) => (
                        <Menu.Item
                          key={dept}
                          onPress={() => {
                            setDepartment(dept);
                            closeDepartmentMenu();
                          }}
                          title={dept}
                        />
                      ))
                    : <Menu.Item disabled title="Select faculty first" />}
                </Menu>
              </View>
              
              <View style={styles.fieldContainer}>
                <View style={styles.fieldTitleContainer}>
                  <Text
                    style={[
                      styles.fieldTitle,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    Bio
                  </Text>
                  <Text style={styles.charCount}>
                    {bio.length}/{BIO_MAX_LENGTH}
                  </Text>
                </View>
                <TextInput
                  placeholder="Tell us about yourself (optional)"
                  placeholderTextColor={theme.colors.placeholder}
                  value={bio}
                  onChangeText={setBio}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  maxLength={BIO_MAX_LENGTH}
                  theme={{ colors: { primary: theme.colors.primary } }}
                />
              </View>
              
              <Button
                mode="contained"
                onPress={handleSignup}
                style={[
                  styles.button,
                  { backgroundColor: theme.colors.primary },
                ]}
                labelStyle={{ color: theme.colors.onPrimary }}
              >
                Sign Up
              </Button>
              
              <View style={styles.loginContainer}>
                <Text style={{ color: theme.colors.onSurface }}>
                  Already have an account?
                </Text>
                <TouchableRipple onPress={() => navigation.navigate("Login")}>
                  <Text
                    style={[
                      styles.loginText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {" "}
                    Login
                  </Text>
                </TouchableRipple>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};
export default SignupScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    alignSelf: "center",
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  fieldTitle: {
    fontSize: 16,
  },
  fieldTitlesub: {
    fontSize: 14,
    marginLeft: 8,
  },
  asterisk: {
    color: "red",
    marginLeft: 2,
  },
  input: {
    backgroundColor: "transparent",
    height: 60,
  },
  multilineInput: {
    backgroundColor: "transparent",
    minHeight: 30,
    textAlignVertical: "center",
  },
  charCount: {
    alignSelf: "flex-end",
    marginBottom: 2,
    marginLeft: 8,
    fontSize: 12,
  },
  button: {
    marginTop: 8,
    padding: 8,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  loginText: {
    fontWeight: "bold",
  },
  menuTouchable: {
    width: "100%",
  },
});