import React, { useState, useContext } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Text as RNText,
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
  const [visibleUniversity, setVisibleUniversity] = useState(false);
  const openUniversityMenu = () => setVisibleUniversity(true);
  const closeUniversityMenu = () => setVisibleUniversity(false);
  const [visibleYear, setVisibleYear] = useState(false);
  const openYearMenu = () => setVisibleYear(true);
  const closeYearMenu = () => setVisibleYear(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const toggleSecureTextEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };
  const BIO_MAX_LENGTH = 150;
  const handleSignup = async () => {
    if (
      !fullName ||
      !username ||
      !email ||
      !password ||
      !university ||
      !universityYear ||
      !degree
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
      bio,
    };
    try {
      await signup(userData);
      navigation.navigate("Main");
    } catch (error) {
      console.error("Signup failed:", error);
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
              <Text style={styles.title}>Create an Account</Text>
              <Text style={styles.subtitle}>Join us today</Text>
             
              <View style={styles.fieldContainer}>
                <View style={styles.fieldTitleContainer}>
                  <Text style={styles.fieldTitle}>Full Name</Text>
                  <Text style={styles.asterisk}>*</Text>
                </View>
                <TextInput
                  placeholder="Enter your full name"
                  value={fullName}
                  onChangeText={setFullName}
                  mode="outlined"
                  style={styles.input}
                  autoCapitalize="words"
                  returnKeyType="next"
                  maxLength={50}
                  textAlignVertical="center"
                />
              </View>
             
              <View style={styles.fieldContainer}>
                <View style={styles.fieldTitleContainer}>
                  <Text style={styles.fieldTitle}>Username</Text>
                  <Text style={styles.asterisk}>*</Text>
                </View>
                <TextInput
                  placeholder="Choose a username"
                  value={username}
                  onChangeText={setUsername}
                  mode="outlined"
                  style={styles.input}
                  autoCapitalize="none"
                  returnKeyType="next"
                  maxLength={30}
                  textAlignVertical="center"
                />
              </View>
         
              <View style={styles.fieldContainer}>
                <View style={styles.fieldTitleContainer}>
                  <Text style={styles.fieldTitle}>Email</Text>
                  <Text style={styles.asterisk}>*</Text>
                </View>
                <TextInput
                  placeholder="Enter your email address"
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
                />
              </View>
        
              <View style={styles.fieldContainer}>
                <View style={styles.fieldTitleContainer}>
                  <Text style={styles.fieldTitle}>Password</Text>
                  <Text style={styles.asterisk}>*</Text>
                </View>
                <TextInput
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  style={styles.input}
                  secureTextEntry={secureTextEntry}
                  right={
                    <TextInput.Icon
                      name={secureTextEntry ? "eye-off" : "eye"}
                      onPress={toggleSecureTextEntry}
                    />
                  }
                  returnKeyType="next"
                  maxLength={30}
                  textAlignVertical="center"
                />
              </View>
         
              <View style={styles.fieldContainer}>
                <View style={styles.fieldTitleContainer}>
                  <Text style={styles.fieldTitle}>University</Text>
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
                          value={university}
                          mode="outlined"
                          style={styles.input}
                          editable={false}
                          right={<TextInput.Icon name="menu-down" />}
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
                  <Text style={styles.fieldTitle}>University Year</Text>
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
                          value={universityYear}
                          mode="outlined"
                          style={styles.input}
                          editable={false}
                          right={<TextInput.Icon name="menu-down" />}
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
                  <Text style={styles.fieldTitle}>Degree</Text>
                  <Text style={styles.asterisk}>*</Text>
                </View>
                <TextInput
                  placeholder="Enter your degree"
                  value={degree}
                  onChangeText={setDegree}
                  mode="outlined"
                  style={styles.input}
                  autoCapitalize="words"
                  returnKeyType="next"
                  maxLength={50}
                  textAlignVertical="center"
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <View style={styles.fieldTitleContainer}>
                  <Text style={styles.fieldTitle}>Bio</Text>
              
                  <Text style={styles.charCount}>
                    {bio.length}/{BIO_MAX_LENGTH}
                  </Text>
                </View>
                <TextInput
                  placeholder="Tell us about yourself (optional)"
                  value={bio}
                  onChangeText={setBio}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  maxLength={BIO_MAX_LENGTH}
                />
              </View>
              <Button
                mode="contained"
                onPress={handleSignup}
                style={styles.button}
              >
                Sign Up
              </Button>
            
              <View style={styles.loginContainer}>
                <Text>Already have an account?</Text>
                <TouchableRipple onPress={() => navigation.navigate("Login")}>
                  <Text style={styles.loginText}> Login</Text>
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
    backgroundColor: "#fff",
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
    color: "#666",
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
    color: "#333",
  },
  asterisk: {
    color: "red",
    marginLeft: 2,
  },
  input: {
    backgroundColor: "#fff",
    height: 60,
  },
  charCount: {
    alignSelf: "flex-end",
    marginBottom: 2,
    marginLeft: 8,
    fontSize: 12,
    color: "#666",
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
    color: (theme) => theme.colors.primary,
    fontWeight: "bold",
  },
});