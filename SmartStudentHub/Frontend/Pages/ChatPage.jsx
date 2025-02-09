// ChatPage.jsx

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
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../src/backend/api';

export default function ChatPage({ route }) {
  const theme = useTheme();
  const { group } = route.params; 

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const socket = io('http://YOUR_BACKEND_URL:5002', {
          auth: {
            token,
          },
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          console.log('Connected to Socket.IO server');
          socket.emit('joinGroup', group._id.toString());
        });

        socket.on('newMessage', (message) => {
          setMessages((prevMessages) => [...prevMessages, message]);
          scrollToBottom();
        });

        socket.on('disconnect', () => {
          console.log('Disconnected from Socket.IO server');
        });

        // Fetch existing messages
        const res = await axios.get(`/messages/${group._id}`);
        setMessages(res.data);
        scrollToBottom();

      } catch (error) {
        console.error('Socket.IO connection error:', error.message);
      }
    };

    initializeSocket();

    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [group._id]);

  const handleSend = useCallback(() => {
    if (inputText.trim() === "") return;

    const messageData = {
      groupId: group._id.toString(),
      message: inputText.trim(),
    };

    // Emit message via Socket.IO
    socketRef.current.emit('sendMessage', messageData);

    setInputText("");
  }, [inputText, group._id]);

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender.username === "You" ? styles.yourMessage : styles.otherMessage,
      ]}
    >
      {item.sender.username !== "You" && (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {item.sender.fullName.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.messageBubble}>
        <Text style={[styles.messageText, { color: theme.colors.surface }]}>
          {item.text}
        </Text>
      </View>
      {item.sender.username === "You" && (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>Y</Text>
        </View>
      )}
    </View>
  );

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item._id}
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
                placeholderTextColor={theme.colors.placeholder || "#000000"}
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                <Icon name="send" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: "space-between",
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