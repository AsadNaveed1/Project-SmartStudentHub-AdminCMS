

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useTheme, Dialog, Portal, Button } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatPage({ route }) {
  const theme = useTheme();
  const { group } = route.params; 

  const [messages, setMessages] = useState([
    
    { id: "1", text: "Welcome to the group!", sender: "Admin" },
    { id: "2", text: "Glad to be here!", sender: "User1" },
    
  ]);

  const [inputText, setInputText] = useState("");

  const flatListRef = useRef(null);

  const handleSend = useCallback(() => {
    if (inputText.trim() === "") return;

    const newMessage = {
      id: (messages.length + 1).toString(),
      text: inputText.trim(),
      sender: "You",
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputText("");
  }, [inputText, messages.length]);

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "You" ? styles.yourMessage : styles.otherMessage,
      ]}
    >
      {item.sender !== "You" && (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {item.sender.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.messageBubble}>
        <Text style={[styles.messageText, { color: theme.colors.Surface }]}>
          {item.text}
        </Text>
      </View>
      {item.sender === "You" && (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>Y</Text>
        </View>
      )}
    </View>
  );

  
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [messages]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 45 : 90}
      >

          <View style={styles.inner}>

            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
            
            />

            <View
              style={[
                styles.inputContainer,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <TextInput
                style={[styles.input, { color: theme.colors.color }]}
                placeholder="Type a message"
                placeholderTextColor={"#000000"}
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                <Icon name="send" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: -55,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: "space-between",
  },
  groupName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  messagesList: {
    padding: 16,
    paddingBottom: 80, 
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
    maxWidth: "80%",
  },
  yourMessage: {
    alignSelf: "flex-end",
    justifyContent: "flex-end",
  },
  otherMessage: {
    alignSelf: "flex-start",
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginLeft: 8,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
  },
  messageBubble: {
    padding: 10,
    borderRadius: 16,
    backgroundColor: "#E5E5EA",
  },
  yourMessageBubble: {
    backgroundColor: "#DCF8C6",
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 8,
    alignItems: "flex-end",
    borderTopWidth: 0.5,
    borderTopColor: "#ccc",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
    marginBottom: 10,
  },
});
