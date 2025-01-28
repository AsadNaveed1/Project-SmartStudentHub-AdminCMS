// frontend/Pages/Auth/LoginScreen.jsx

import React, { useState, useContext } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Text as RNText } from 'react-native';
import { TextInput, Button, Text, useTheme, TouchableRipple } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

const LoginScreen = () => {
  const theme = useTheme();
  const { login } = useContext(AuthContext);
  const navigation = useNavigation(); // Initialize navigation

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const handleLogin = () => {
    // Basic validation
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }
    login(email, password);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Please login to continue</Text>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCompleteType="email"
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry={secureTextEntry}
            right={
              <TextInput.Icon 
                name={secureTextEntry ? "eye-off" : "eye"} 
                onPress={() => setSecureTextEntry(!secureTextEntry)} 
              />
            }
          />

          <Button 
            mode="contained" 
            onPress={handleLogin} 
            style={styles.button}
          >
            Login
          </Button>

          {/* Sign Up Text/Button */}
          <View style={styles.signupContainer}>
            <RNText>Don't have an account?</RNText>
            <TouchableRipple onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupText}> Sign Up</Text>
            </TouchableRipple>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    alignSelf: 'center',
    marginBottom: 24,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    padding: 8,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signupText: {
    color: theme => theme.colors.primary,
    fontWeight: 'bold',
  },
});