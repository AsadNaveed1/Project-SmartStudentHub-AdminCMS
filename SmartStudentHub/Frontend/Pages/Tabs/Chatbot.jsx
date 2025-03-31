import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { useTheme } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import api from '../../src/backend/api';
const Chatbot = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello! How can I help you today? You can ask me about events, upload images for analysis, or ask general questions.', isUser: false },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const flatListRef = useRef(null);
  const sendMessage = async () => {
    if ((inputText.trim() === '' && !selectedFile) || isLoading) return;
    const userMessage = { 
      id: Date.now().toString(), 
      text: inputText || 'Uploaded file', 
      isUser: true,
      file: selectedFile 
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setIsLoading(true);
    try {
      let response;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', {
          uri: selectedFile.uri,
          type: selectedFile.mimeType || 'image/jpeg',
          name: selectedFile.name || 'file.jpg'
        });
        if (inputText.trim()) {
          formData.append('message', inputText);
        } else {
          formData.append('message', 'Please analyze this image.');
        }
        response = await Promise.race([
          api.post('/chatbot/upload-and-chat', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 60000)
          )
        ]);
        setSelectedFile(null);
      } else {
        response = await api.post('/chatbot/chat', { 
          message: inputText 
        });
      }
      if (response.data && response.data.response) {
        const botResponse = { 
          id: (Date.now() + 1).toString(), 
          text: response.data.response, 
          isUser: false 
        };
        setMessages(prevMessages => [...prevMessages, botResponse]);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error communicating with chatbot:', error);
      const errorMessage = { 
        id: (Date.now() + 1).toString(), 
        text: 'Sorry, I encountered an error. Please try again later.', 
        isUser: false 
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  const pickDocument = async () => {
    if (isLoading) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
      });
      if (result.canceled === false && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select document.');
    }
  };
  const pickImage = async () => {
    if (isLoading) return;
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile({
          uri: result.assets[0].uri,
          mimeType: 'image/jpeg',
          name: 'image.jpg'
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image.');
    }
  };
  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageBubble, 
      {
        backgroundColor: item.isUser 
          ? theme.colors.primary 
          : theme.colors.surfaceVariant,
        alignSelf: item.isUser ? 'flex-end' : 'flex-start',
      }
    ]}>
      {item.file && (
        <Image 
          source={{ uri: item.file.uri }} 
          style={styles.attachedImage} 
          resizeMode="cover"
        />
      )}
      <Text style={[
        styles.messageText, 
        { color: item.isUser ? 'white' : theme.colors.onSurfaceVariant }
      ]}>
        {item.text}
      </Text>
    </View>
  );
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: theme.colors.primary }]}>
          AI Assistant
        </Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        onContentSizeChange={() => 
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => 
          flatListRef.current?.scrollToEnd({ animated: false })
        }
      />
      {selectedFile && (
        <View style={styles.selectedFileContainer}>
          <Text style={styles.selectedFileText} numberOfLines={1}>
            {selectedFile.name || 'File selected'}
          </Text>
          <TouchableOpacity 
            onPress={() => setSelectedFile(null)}
            style={styles.removeFileButton}
            disabled={isLoading}
          >
            <Ionicons name="close-circle" size={20} color={isLoading ? theme.colors.disabled : theme.colors.error} />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={styles.attachButton} 
          onPress={pickDocument}
          disabled={isLoading}
        >
          <MaterialIcons 
            name="attach-file" 
            size={24} 
            color={isLoading ? theme.colors.disabled : theme.colors.primary} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.imageButton} 
          onPress={pickImage}
          disabled={isLoading}
        >
          <MaterialIcons 
            name="image" 
            size={24} 
            color={isLoading ? theme.colors.disabled : theme.colors.primary} 
          />
        </TouchableOpacity>
        <TextInput
          style={[
            styles.input, 
            { 
              backgroundColor: theme.colors.surfaceVariant,
              color: theme.colors.onSurface,
              opacity: isLoading ? 0.7 : 1,
            }
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about events, upload images, or ask me anything..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          multiline
          editable={!isLoading}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            { 
              backgroundColor: isLoading || (inputText.trim() === '' && !selectedFile) 
                ? theme.colors.onSurfaceVariant
                : theme.colors.primary 
            }
          ]} 
          onPress={sendMessage}
          disabled={isLoading || (inputText.trim() === '' && !selectedFile)}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Ionicons name="send" size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingBottom: Platform.OS === 'ios' ? 15 : 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  attachButton: {
    padding: 8,
    marginRight: 5,
  },
  imageButton: {
    padding: 8,
    marginRight: 5,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    margin: 8,
    padding: 8,
    borderRadius: 8,
  },
  selectedFileText: {
    flex: 1,
    fontSize: 14,
  },
  removeFileButton: {
    padding: 4,
  },
  attachedImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
});
export default Chatbot;