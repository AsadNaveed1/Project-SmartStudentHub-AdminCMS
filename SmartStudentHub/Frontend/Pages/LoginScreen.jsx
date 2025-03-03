import React, { useState, useContext } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { TextInput, Button, Text, useTheme, TouchableRipple } from 'react-native-paper';
import { AuthContext } from '../newcontext/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
const LoginScreen = () => {
  const theme = useTheme();
  const { login } = useContext(AuthContext);
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const handleLogin = () => {
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }
    login(email, password);
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
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.innerContainer}>
            <Text
              style={[
                styles.title,
                { color: theme.colors.onSurface },
              ]}
            >
              Welcome Back!
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: theme.colors.onSurface },
              ]}
            >
              Please login to continue
            </Text>
            <TextInput
              label="Email"
              placeholder="Enter your email"
              placeholderTextColor={theme.colors.placeholder}
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCompleteType="email"
              theme={{ colors: { primary: theme.colors.primary } }}
            />
            <TextInput
              label="Password"
              placeholder="Enter your password"
              placeholderTextColor={theme.colors.placeholder}
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry={secureTextEntry}
              right={
                <TextInput.Icon 
                  name={secureTextEntry ? "eye-off" : "eye"} 
                  onPress={() => setSecureTextEntry(!secureTextEntry)} 
                  color={theme.colors.onSurface}
                />
              }
              theme={{ colors: { primary: theme.colors.primary } }}
            />
            <Button 
              mode="contained" 
              onPress={handleLogin} 
              style={[
                styles.button,
                { backgroundColor: theme.colors.primary },
              ]}
              labelStyle={{ color: theme.colors.onPrimary }}
            >
              Login
            </Button>
            {}
            <View style={styles.signupContainer}>
              <Text style={{ color: theme.colors.onSurface }}>Don't have an account?</Text>
              <TouchableRipple onPress={() => navigation.navigate('Signup')}>
                <Text
                  style={[
                    styles.signupText,
                    { color: theme.colors.primary },
                  ]}
                >
                  {" "}Sign Up
                </Text>
              </TouchableRipple>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};
export default LoginScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
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
    fontWeight: 'bold',
  },
});