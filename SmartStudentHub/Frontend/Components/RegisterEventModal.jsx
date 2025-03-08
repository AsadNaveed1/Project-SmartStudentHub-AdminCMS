import React, { useState, useContext, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Linking
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
  Chip,
  Divider
} from "react-native-paper";
import { AuthContext } from "../newcontext/AuthContext";
import { RegisteredEventsContext } from "../newcontext/RegisteredEventsContext";
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
  const { blockchainStatus, exportWalletInfo } = useContext(RegisteredEventsContext);
  const user = authState.user;
  const [salutation, setSalutation] = useState("");
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [extraData, setExtraData] = useState({});
  const [errors, setErrors] = useState({});
  const [showWalletInfo, setShowWalletInfo] = useState(false);
  const [walletInfo, setWalletInfo] = useState(null);
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
        if (field.required && !extraData[field.name]?.trim()) {
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
  const handleViewWalletInfo = async () => {
    const info = await exportWalletInfo();
    setWalletInfo(info);
    setShowWalletInfo(true);
  };
  const handleViewTransaction = (txHash) => {
    const explorerUrl = `https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com/tx/${txHash}`;
    Linking.openURL(explorerUrl);
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
              {}
              <View style={styles.blockchainStatusContainer}>
                <Chip 
                  icon={blockchainStatus.connected ? "check-circle" : "alert-circle"} 
                  style={{
                    backgroundColor: blockchainStatus.connected ? '#d4edda' : '#f8d7da'
                  }}
                >
                  {blockchainStatus.connected ? 'Blockchain Connected' : 'Blockchain Not Connected'}
                </Chip>
                {blockchainStatus.networkInfo && (
                  <Text style={styles.networkInfo}>
                    Network: {blockchainStatus.networkInfo.name || 'SKALE'} 
                    {blockchainStatus.networkInfo.isSkale ? ' (Gas-Free)' : ''}
                  </Text>
                )}
                {blockchainStatus.walletAddress && (
                  <Text style={styles.walletAddress} numberOfLines={1} ellipsizeMode="middle">
                    Wallet: {blockchainStatus.walletAddress}
                  </Text>
                )}
                <Text style={styles.blockchainNote}>
                  Your registration will be secured on the blockchain for immutability and transparency.
                </Text>
                <Button 
                  mode="text" 
                  onPress={handleViewWalletInfo}
                  style={styles.walletButton}
                >
                  View Wallet Details
                </Button>
              </View>
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
                  disabled={blockchainStatus.processing || !blockchainStatus.connected}
                  loading={blockchainStatus.processing}
                >
                  {blockchainStatus.processing ? 'Processing on Blockchain...' : 'Confirm Registration'}
                </Button>
                <Button
                  mode="text"
                  onPress={onClose}
                  style={styles.cancelButton}
                  disabled={blockchainStatus.processing}
                >
                  Cancel
                </Button>
              </View>
              {blockchainStatus.lastTransaction && (
                <View style={styles.transactionContainer}>
                  <Text style={styles.transactionTitle}>Last Transaction:</Text>
                  <Text style={styles.transactionHash} numberOfLines={1} ellipsizeMode="middle">
                    {blockchainStatus.lastTransaction}
                  </Text>
                  <Button 
                    mode="text" 
                    onPress={() => handleViewTransaction(blockchainStatus.lastTransaction)}
                    style={styles.viewTransactionButton}
                  >
                    View on Explorer
                  </Button>
                </View>
              )}
              {}
              {showWalletInfo && walletInfo && (
                <View style={styles.walletInfoContainer}>
                  <Text style={styles.walletInfoTitle}>Your Blockchain Wallet</Text>
                  <Divider style={styles.divider} />
                  <Text style={styles.walletInfoLabel}>Public Address:</Text>
                  <Text style={styles.walletInfoValue} selectable>{walletInfo.address}</Text>
                  <Text style={styles.walletInfoLabel}>Private Key (Keep Secret!):</Text>
                  <Text style={styles.walletInfoValue} selectable>{walletInfo.privateKey}</Text>
                  <Text style={styles.walletInfoWarning}>
                    Warning: Never share your private key with anyone. This key controls 
                    your blockchain identity and all your registrations.
                  </Text>
                  <Button 
                    mode="outlined" 
                    onPress={() => setShowWalletInfo(false)}
                    style={styles.closeWalletButton}
                  >
                    Close Wallet Info
                  </Button>
                </View>
              )}
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
  blockchainStatusContainer: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  networkInfo: {
    fontSize: 14,
    marginTop: 8,
    color: '#495057',
  },
  walletAddress: {
    fontSize: 12,
    marginTop: 4,
    color: '#495057',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  blockchainNote: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    color: '#6c757d',
  },
  walletButton: {
    marginTop: 8,
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
  transactionContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#e8f4f8',
    borderRadius: 5,
  },
  transactionTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  transactionHash: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
  },
  viewTransactionButton: {
    marginTop: 5,
  },
  walletInfoContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  walletInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  divider: {
    marginBottom: 10,
  },
  walletInfoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#495057',
  },
  walletInfoValue: {
    fontSize: 12,
    padding: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 5,
  },
  walletInfoWarning: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 15,
    textAlign: 'center',
  },
  closeWalletButton: {
    marginTop: 15,
  }
});
export default RegisterEventModal;