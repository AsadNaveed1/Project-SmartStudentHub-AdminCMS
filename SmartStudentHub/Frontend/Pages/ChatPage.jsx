import React, { useState, useCallback, useRef, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import { SafeAreaView } from "react-native-safe-area-context";
import io from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "../src/backend/api";
import { AuthContext } from "../newcontext/AuthContext";

export default function ChatPage({ route }) {
  const theme = useTheme();
  const { group } = route.params;
  const { authState } = useContext(AuthContext);
  const currentUser = authState.user;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const flatListRef = useRef(null);
  const socketRef = useRef(null);
  useEffect(() => {
    console.log("Current User ID:", currentUser.id);
    const initializeSocket = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const socket = io("http://localhost:5002", {
          auth: { token },
        });
        socketRef.current = socket;
        socket.on("connect", () => {
          console.log("Connected to Socket.IO server");
          socket.emit("joinGroup", group._id.toString());
        });
        socket.on("newMessage", (message) => {
          setMessages((prevMessages) => [...prevMessages, message]);
          if (isAtBottom) {
            scrollToBottom();
          } else {
            setNewMessageCount((count) => count + 1);
          }
        });
        socket.on("disconnect", () => {
          console.log("Disconnected from Socket.IO server");
        });
        const res = await axios.get(`/messages/${group._id}`);
        setMessages(res.data);
        setIsLoading(false);
        scrollToBottom();
      } catch (error) {
        console.error("Socket.IO connection error:", error.message);
        setIsLoading(false);
      }
    };
    initializeSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [group._id, currentUser.id]);
  const handleSend = useCallback(() => {
    if (inputText.trim() === "") return;
    const messageData = {
      groupId: group._id.toString(),
      message: inputText.trim(),
    };
    socketRef.current.emit("sendMessage", messageData);
    setInputText("");
  }, [inputText, group._id]);
  const renderItem = ({ item }) => {
    const isUser = item.sender._id === currentUser.id;
    const messageBubbleStyle = isUser
      ? styles.yourMessageBubble
      : styles.otherMessageBubble;
    const containerStyle = isUser
      ? styles.messageContainerRight
      : styles.messageContainerLeft;
    const avatarInitial = item.sender.fullName
      ? item.sender.fullName.charAt(0).toUpperCase()
      : "U";
    return (
      <View style={[styles.messageContainer, containerStyle]}>
        {!isUser && (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
        )}
        <View style={styles.messageContent}>
          {!isUser && (
            <Text style={[styles.senderName, { color: theme.colors.onSurface }]}>
              {item.sender.fullName}
            </Text>
          )}
          <View style={[styles.messageBubble, messageBubbleStyle]}>
            <Text
              style={[
                styles.messageText,
                { color: isUser ? "#000" : "#000" },
              ]}
            >
              {item.text}
            </Text>
          </View>
        </View>
        {isUser && (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : "Y"}
            </Text>
          </View>
        )}
      </View>
    );
  };
  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };
  const handleScroll = (event) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    setIsAtBottom(isBottom);
    if (isBottom) {
      setNewMessageCount(0);
    }
  };
  const handlePressNewMessage = () => {
    scrollToBottom();
    setNewMessageCount(0);
  };
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 45 : 90}
      >
        <View style={styles.inner}>
          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="on-drag"
              style={styles.flatList}
            />
          )}
          {newMessageCount > 0 && (
            <TouchableOpacity
              style={styles.newMessageButton}
              onPress={handlePressNewMessage}
            >
              <Text style={styles.newMessageText}>
                {newMessageCount} New Message{newMessageCount > 1 ? "s" : ""}
              </Text>
            </TouchableOpacity>
          )}
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Type a message"
              placeholderTextColor={theme.colors.placeholder || "#6e6e6e"}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Icon name="send" size={20} color={theme.colors.primary} />
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
  },
  keyboardAvoiding: {
    flex: 1,
    marginTop: -90,
    paddingTop: 40,
  },
  inner: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexGrow: 1,
  },
  flatList: {
    flex: 1,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
  },
  messageContainerLeft: {
    justifyContent: "flex-start",
  },
  messageContainerRight: {
    justifyContent: "flex-end",
    alignSelf: "flex-end",
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4a90e2",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  messageContent: {
    maxWidth: "80%",
  },
  senderName: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: "600",
  },
  messageBubble: {
    padding: 10,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  yourMessageBubble: {
    backgroundColor: "#0084ff",
    borderTopRightRadius: 0,
  },
  otherMessageBubble: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
  },
  newMessageButton: {
    position: "absolute",
    bottom: 70,
    alignSelf: "center",
    backgroundColor: "#0084ff",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  newMessageText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});