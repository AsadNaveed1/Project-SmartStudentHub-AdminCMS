import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Modal, Portal, Text, Button, TextInput, useTheme, HelperText } from 'react-native-paper';
import { AuthContext } from '../newcontext/AuthContext';
const RegisterEventModal = ({ visible, onClose, onSubmit, event }) => {
  const theme = useTheme();
  const { authState } = useContext(AuthContext);
  const user = authState.user;
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [extraData, setExtraData] = useState({});
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (event.extraFields && Array.isArray(event.extraFields)) {
      const initialExtraData = {};
      event.extraFields.forEach(field => {
        initialExtraData[field.name] = '';
      });
      setExtraData(initialExtraData);
    }
  }, [event.extraFields]);
  const handleChange = (name, value) => {
    setExtraData(prev => ({ ...prev, [name]: value }));
  };
  const validate = () => {
    const newErrors = {};
    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }
    if (event.extraFields && Array.isArray(event.extraFields)) {
      event.extraFields.forEach(field => {
        if (field.required && !extraData[field.name].trim()) {
          newErrors[field.name] = `${field.label} is required.`;
        }
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleConfirm = () => {
    if (validate()) {
      const registrationData = {
        fullName,
        extraData,
      };
      onSubmit(registrationData);
    }
  };
  return (
    <Portal>
      <Modal visible={visible} onDismiss={onClose} contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView>
              <Text style={[styles.title, { color: theme.colors.onBackground }]}>Register for {event.title}</Text>
              {}
              <TextInput
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                mode="outlined"
                style={styles.input}
                error={!!errors.fullName}
              />
              {errors.fullName && <HelperText type="error">{errors.fullName}</HelperText>}
              {}
              <TextInput
                label="Email"
                value={user?.email || ''}
                mode="outlined"
                style={styles.input}
                disabled
              />
              {}
              <TextInput
                label="Degree"
                value={user?.degree || ''}
                mode="outlined"
                style={styles.input}
                disabled
              />
              {}
              <TextInput
                label="University Year"
                value={user?.universityYear || ''}
                mode="outlined"
                style={styles.input}
                disabled
              />
              {}
              {event.extraFields && event.extraFields.map(field => (
                <View key={field.name} style={styles.extraFieldContainer}>
                  {field.type === 'text' && (
                    <>
                      <TextInput
                        label={field.label}
                        value={extraData[field.name]}
                        onChangeText={(text) => handleChange(field.name, text)}
                        mode="outlined"
                        style={styles.input}
                        error={!!errors[field.name]}
                      />
                      {errors[field.name] && <HelperText type="error">{errors[field.name]}</HelperText>}
                    </>
                  )}
                  {field.type === 'dropdown' && (
                    <>
                      <Text style={[styles.label, { color: theme.colors.onBackground }]}>{field.label}</Text>
                      <Button
                        mode="outlined"
                        onPress={() => {
                        }}
                        style={styles.dropdownButton}
                      >
                        {extraData[field.name] || `Select ${field.label}`}
                      </Button>
                      {errors[field.name] && <HelperText type="error">{errors[field.name]}</HelperText>}
                      {}
                      {}
                    </>
                  )}
                  {}
                </View>
              ))}
              <View style={styles.buttonContainer}>
                <Button mode="contained" onPress={handleConfirm} style={styles.confirmButton}>
                  Confirm Registration
                </Button>
                <Button mode="text" onPress={onClose} style={styles.cancelButton}>
                  Cancel
                </Button>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </Portal>
  );
};
const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
    maxHeight: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    marginBottom: 10,
  },
  extraFieldContainer: {
    marginBottom: 10,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
  },
  dropdownButton: {
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 20,
  },
  confirmButton: {
    marginBottom: 10,
  },
  cancelButton: {},
});
export default RegisterEventModal;