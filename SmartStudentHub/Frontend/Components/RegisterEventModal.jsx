import React, { useState, useContext, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import {
  Modal,
  Portal,
  Text,
  Button,
  TextInput,
  useTheme,
  HelperText,
  TouchableRipple,
  Menu,
} from "react-native-paper";
import { AuthContext } from "../newcontext/AuthContext";
const CustomRadioButton = ({ options, selectedValue, onSelect }) => {
  return (
    <View style={styles.customRadioContainer}>
      {options.map((option) => (
        <TouchableRipple
          key={option.value}
          onPress={() => onSelect(option.value)}
          rippleColor="rgba(0, 0, 0, .32)"
          style={styles.customRadioButtonTouchable}
        >
          <View style={styles.customRadioButton}>
            <View style={styles.customRadioOuter}>
              {selectedValue === option.value && (
                <View style={styles.customRadioDot} />
              )}
            </View>
            <Text style={styles.customRadioLabel}>{option.label}</Text>
          </View>
        </TouchableRipple>
      ))}
    </View>
  );
};
const RegisterEventModal = ({ visible, onClose, onSubmit, event }) => {
  const theme = useTheme();
  const { authState } = useContext(AuthContext);
  const user = authState.user;
  const [salutation, setSalutation] = useState("");
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [extraData, setExtraData] = useState({});
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (event.extraFields && Array.isArray(event.extraFields)) {
      const initialExtraData = {};
      event.extraFields.forEach((field) => {
        initialExtraData[field.name] = "";
      });
      setExtraData(initialExtraData);
    }
  }, [event.extraFields]);
  const handleChange = (name, value) => {
    setExtraData((prev) => ({ ...prev, [name]: value }));
  };
  const validate = () => {
    const newErrors = {};
    if (!salutation) {
      newErrors.salutation = "Salutation is required.";
    }
    if (!fullName.trim()) {
      newErrors.fullName = "Full Name is required.";
    }
    if (event.extraFields && Array.isArray(event.extraFields)) {
      event.extraFields.forEach((field) => {
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
        salutation,
        fullName,
        extraData,
      };
      onSubmit(registrationData);
    }
  };
  const salutationOptions = [
    { label: "Mr.", value: "Mr." },
    { label: "Mrs.", value: "Mrs." },
    { label: "Others", value: "Others" },
  ];
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text
                style={[styles.title, { color: theme.colors.onBackground }]}
              >
                Register for {event.title}
              </Text>
      
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldTitle}>Salutation *</Text>
                <CustomRadioButton
                  options={salutationOptions}
                  selectedValue={salutation}
                  onSelect={setSalutation}
                />
                {errors.salutation && (
                  <HelperText type="error">{errors.salutation}</HelperText>
                )}
              </View>
            
              <TextInput
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                mode="outlined"
                style={styles.input}
                error={!!errors.fullName}
              />
              {errors.fullName && (
                <HelperText type="error">{errors.fullName}</HelperText>
              )}
          
              <TextInput
                label="Email"
                value={user?.email || ""}
                mode="outlined"
                style={styles.input}
                disabled
              />
        
              <TextInput
                label="Degree"
                value={user?.degree || ""}
                mode="outlined"
                style={styles.input}
                disabled
              />
       
              <TextInput
                label="University Year"
                value={user?.universityYear || ""}
                mode="outlined"
                style={styles.input}
                disabled
              />
             
              <TextInput
                label="Username"
                value={user?.username || ""}
                mode="outlined"
                style={styles.input}
                disabled
              />
          
              <TextInput
                label="Faculty"
                value={user?.faculty || ""}
                mode="outlined"
                style={styles.input}
                disabled
              />
          
              {/* <TextInput
                label="Department"
                placeholder="Select department"
                value={user?.department || ""}
                mode="outlined"
                style={styles.input}
                multiline={true}
                numberOfLines={
                  user?.department && user?.department.length > 40 ? 2 : 1
                }
                editable={false}
                right={<TextInput.Icon name="menu-down" />}
                disabled
              /> */}
         
            
              {event.extraFields &&
                event.extraFields.map((field) => (
                  <View key={field.name} style={styles.extraFieldContainer}>
                    {field.type === "text" && (
                      <>
                        <TextInput
                          label={field.label}
                          value={extraData[field.name]}
                          onChangeText={(text) =>
                            handleChange(field.name, text)
                          }
                          mode="outlined"
                          style={styles.input}
                          error={!!errors[field.name]}
                        />
                        {errors[field.name] && (
                          <HelperText type="error">
                            {errors[field.name]}
                          </HelperText>
                        )}
                      </>
                    )}
                    {field.type === "dropdown" && (
                      <>
                        <Text
                          style={[
                            styles.label,
                            { color: theme.colors.onBackground },
                          ]}
                        >
                          {field.label} *
                        </Text>
                        <Menu
                          visible={
                            extraData[`${field.name}MenuVisibility`] || false
                          }
                          onDismiss={() =>
                            handleChange(`${field.name}MenuVisibility`, false)
                          }
                          anchor={
                            <TouchableRipple
                              onPress={() =>
                                handleChange(
                                  `${field.name}MenuVisibility`,
                                  true
                                )
                              }
                              style={styles.menuTouchable}
                            >
                              <View pointerEvents="none">
                                <TextInput
                                  placeholder={`Select ${field.label}`}
                                  value={extraData[field.name] || ""}
                                  mode="outlined"
                                  style={styles.modalInput}
                                  editable={false}
                                  error={!!errors[field.name]}
                                  right={<TextInput.Icon name="menu-down" />}
                                />
                              </View>
                            </TouchableRipple>
                          }
                        >
                          {field.options &&
                            field.options.map((option) => (
                              <Menu.Item
                                key={option}
                                onPress={() => {
                                  handleChange(field.name, option);
                                  handleChange(
                                    `${field.name}MenuVisibility`,
                                    false
                                  );
                                }}
                                title={option}
                              />
                            ))}
                        </Menu>
                        {errors[field.name] && (
                          <HelperText type="error">
                            {errors[field.name]}
                          </HelperText>
                        )}
                      </>
                    )}
                  </View>
                ))}
      
              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={handleConfirm}
                  style={styles.confirmButton}
                >
                  Confirm Registration
                </Button>
                <Button
                  mode="text"
                  onPress={onClose}
                  style={styles.cancelButton}
                >
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
    maxHeight: "100%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
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
  modalInput: {
    marginBottom: 10,
  },
  menuTouchable: {
    width: "100%",
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldTitle: {
    fontSize: 16,
    marginBottom: 5,
  },
  customRadioContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  customRadioButtonTouchable: {
    flexDirection: "row",
    alignItems: "center",
  },
  customRadioButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  customRadioOuter: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "grey",
    justifyContent: "center",
    alignItems: "center",
  },
  customRadioDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "black",
  },
  customRadioLabel: {
    marginLeft: 5,
    fontSize: 16,
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
