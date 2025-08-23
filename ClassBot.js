import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Alert, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  Surface,
  IconButton,
  Portal,
  Modal,
  ActivityIndicator,
  Chip,
  Avatar,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';

const { width, height } = Dimensions.get('window');

const ROLES = {
  OWNER: 'owner',
  TEACHER: 'teacher',
  CR: 'cr',
  ADMIN: 'admin',
  STUDENT: 'student',
};

const MATERIAL_TYPES = {
  PDF: 'pdf',
  PPT: 'ppt',
  IMAGE: 'image',
  DOC: 'doc',
  LINK: 'link',
  GITHUB: 'github',
};

const MATERIAL_ICONS = {
  [MATERIAL_TYPES.PDF]: 'file-pdf-box',
  [MATERIAL_TYPES.PPT]: 'file-powerpoint-box',
  [MATERIAL_TYPES.IMAGE]: 'file-image-box',
  [MATERIAL_TYPES.DOC]: 'file-document-box',
  [MATERIAL_TYPES.LINK]: 'link',
  [MATERIAL_TYPES.GITHUB]: 'github',
};

function BotMessage({ message, darkMode, onMaterialPress }) {
  const styles = getStyles(darkMode);
  
  if (message.type === 'material') {
    return (
      <View style={styles.botMessageContainer}>
        <Avatar.Icon size={32} icon="robot" style={styles.botAvatar} />
        <Card style={[styles.materialCard, { backgroundColor: darkMode ? '#23272f' : '#fff' }]} onPress={() => onMaterialPress(message.material)}>
          <Card.Content>
            <View style={styles.materialHeader}>
              <Ionicons 
                name={MATERIAL_ICONS[message.material.type] || 'file'} 
                size={24} 
                color="#009688" 
              />
              <View style={styles.materialInfo}>
                <Text style={[styles.materialTitle, { color: darkMode ? '#fff' : '#000' }]}>
                  {message.material.title}
                </Text>
                <Text style={[styles.materialMeta, { color: darkMode ? '#aaa' : '#666' }]}>
                  {message.material.subject} • {message.material.fileSize}
                </Text>
                <View style={styles.materialActions}>
                  <Chip icon="download" style={styles.actionChip}>
                    Download
                  </Chip>
                  <Chip icon="eye" style={styles.actionChip}>
                    View
                  </Chip>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  }

  if (message.type === 'announcement') {
    return (
      <View style={styles.botMessageContainer}>
        <Avatar.Icon size={32} icon="robot" style={styles.botAvatar} />
        <Surface style={[styles.announcementCard, { backgroundColor: '#FFD700' }]}>
          <View style={styles.announcementHeader}>
            <Ionicons name="megaphone" size={20} color="#000" />
            <Text style={styles.announcementTitle}>📢 Announcement</Text>
          </View>
          <Text style={styles.announcementText}>{message.text}</Text>
          <Text style={styles.announcementTime}>{message.timestamp}</Text>
        </Surface>
      </View>
    );
  }

  return (
    <View style={styles.botMessageContainer}>
      <Avatar.Icon size={32} icon="robot" style={styles.botAvatar} />
      <Surface style={[styles.botMessage, { backgroundColor: darkMode ? '#23272f' : '#fff' }]}>
        <Text style={[styles.botMessageText, { color: darkMode ? '#fff' : '#000' }]}>
          {message.text}
        </Text>
        <Text style={[styles.messageTime, { color: darkMode ? '#aaa' : '#666' }]}>
          {message.timestamp}
        </Text>
      </Surface>
    </View>
  );
}

function UserMessage({ message, darkMode }) {
  const styles = getStyles(darkMode);
  
  return (
    <View style={styles.userMessageContainer}>
      <Surface style={[styles.userMessage, { backgroundColor: '#009688' }]}>
        <Text style={styles.userMessageText}>{message.text}</Text>
        <Text style={styles.messageTime}>{message.timestamp}</Text>
      </Surface>
      <Avatar.Icon size={32} icon="person" style={styles.userAvatar} />
    </View>
  );
}

function QuickReplyButton({ button, onPress, darkMode }) {
  const styles = getStyles(darkMode);
  
  return (
    <Button
      mode={button.primary ? 'contained' : 'outlined'}
      onPress={() => onPress(button)}
      style={[
        styles.quickReplyButton,
        button.primary ? { backgroundColor: '#009688' } : { borderColor: '#009688' }
      ]}
      labelStyle={{ color: button.primary ? '#fff' : '#009688' }}
      icon={button.icon}
    >
      {button.label}
    </Button>
  );
}

export default function ClassBot({ darkMode }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { classroom } = route.params;
  const scrollViewRef = useRef();

  const [messages, setMessages] = useState([]);
  const [buttons, setButtons] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');

  const styles = getStyles(darkMode);

  useEffect(() => {
    initializeBot();
  }, []);

  const initializeBot = () => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      text: `👋 Welcome to ${classroom.title}! I'm your Class Bot. I can help you find materials, get announcements, and more. What would you like to do?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const initialButtons = [
      { 
        label: "📚 Browse Materials", 
        action: 'browse_materials',
        primary: true,
        icon: 'book-open-variant'
      },
      { 
        label: "🔍 Search Materials", 
        action: 'search_materials',
        primary: false,
        icon: 'magnify'
      },
      { 
        label: "📢 Announcements", 
        action: 'announcements',
        primary: false,
        icon: 'megaphone'
      },
      { 
        label: "❓ Help", 
        action: 'help',
        primary: false,
        icon: 'help-circle'
      }
    ];

    setMessages([welcomeMessage]);
    setButtons(initialButtons);
  };

  const addMessage = (text, type = 'bot') => {
    const newMessage = {
      id: Date.now(),
      type,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Auto-scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const showTypingIndicator = () => {
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1000);
  };

  const handleButtonPress = (button) => {
    // Add user message
    addMessage(button.label, 'user');
    
    // Show typing indicator
    showTypingIndicator();
    
    // Handle button action
    setTimeout(() => {
      switch (button.action) {
        case 'browse_materials':
          showSubjects();
          break;
        case 'search_materials':
          addMessage("🔍 What would you like to search for? Type your search query below.");
          setButtons([]);
          break;
        case 'announcements':
          showAnnouncements();
          break;
        case 'help':
          showHelp();
          break;
        default:
          handleSubjectSelection(button.label);
          break;
      }
    }, 1000);
  };

  const showSubjects = () => {
    const subjects = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'English'];
    
    addMessage("📚 Here are the available subjects:");
    
    const subjectButtons = subjects.map(subject => ({
      label: subject,
      action: `subject_${subject}`,
      primary: true,
      icon: 'book'
    }));
    
    setButtons(subjectButtons);
  };

  const handleSubjectSelection = (subject) => {
    // Mock materials for the selected subject
    const mockMaterials = [
      {
        id: '1',
        title: `${subject} - Introduction`,
        subject: subject,
        type: MATERIAL_TYPES.PDF,
        fileSize: '2.5 MB',
        url: 'https://example.com/intro.pdf',
      },
      {
        id: '2',
        title: `${subject} - Practice Problems`,
        subject: subject,
        type: MATERIAL_TYPES.DOC,
        fileSize: '1.8 MB',
        url: 'https://example.com/practice.doc',
      },
    ];

    addMessage(`📖 Here are the materials for ${subject}:`);
    
    // Add material messages
    mockMaterials.forEach(material => {
      const materialMessage = {
        id: Date.now() + Math.random(),
        type: 'material',
        material,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, materialMessage]);
    });

    setButtons([
      { 
        label: "🔙 Back to Subjects", 
        action: 'back_to_subjects',
        primary: false,
        icon: 'arrow-back'
      },
      { 
        label: "🏠 Main Menu", 
        action: 'main_menu',
        primary: true,
        icon: 'home'
      }
    ]);
  };

  const showAnnouncements = () => {
    const mockAnnouncements = [
      {
        id: '1',
        text: "New assignment uploaded for Computer Science! Due next week.",
        timestamp: "2 hours ago"
      },
      {
        id: '2',
        text: "Class cancelled tomorrow due to teacher availability.",
        timestamp: "1 day ago"
      }
    ];

    addMessage("📢 Here are the recent announcements:");
    
    mockAnnouncements.forEach(announcement => {
      const announcementMessage = {
        id: Date.now() + Math.random(),
        type: 'announcement',
        text: announcement.text,
        timestamp: announcement.timestamp,
      };
      setMessages(prev => [...prev, announcementMessage]);
    });

    const canAnnounce = [ROLES.OWNER, ROLES.TEACHER, ROLES.CR, ROLES.ADMIN].includes(classroom.userRole);
    
    setButtons([
      { 
        label: "🔄 Refresh", 
        action: 'refresh_announcements',
        primary: false,
        icon: 'refresh'
      },
      ...(canAnnounce ? [{
        label: "📢 New Announcement", 
        action: 'new_announcement',
        primary: true,
        icon: 'megaphone'
      }] : []),
      { 
        label: "🏠 Main Menu", 
        action: 'main_menu',
        primary: false,
        icon: 'home'
      }
    ]);
  };

  const showHelp = () => {
    addMessage(`🤖 Here's how I can help you:

📚 Browse Materials - Find study materials by subject
🔍 Search Materials - Search for specific materials
📢 Announcements - View class announcements
❓ Help - Show this help message

You can also type your questions directly!`);
    
    setButtons([
      { 
        label: "🏠 Main Menu", 
        action: 'main_menu',
        primary: true,
        icon: 'home'
      }
    ]);
  };

  const handleMaterialPress = async (material) => {
    try {
      if (material.type === MATERIAL_TYPES.GITHUB || material.type === MATERIAL_TYPES.LINK) {
        // Open in browser - would use Linking in full implementation
        Alert.alert('Info', `Would open: ${material.url}`);
      } else {
        // Download and open file
        Alert.alert('Info', `Would download: ${material.url}`);
      }
    } catch (error) {
      console.error('Error opening material:', error);
      Alert.alert('Error', 'Failed to open material');
    }
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    addMessage(input.trim(), 'user');
    const userInput = input.trim();
    setInput('');

    // Show typing indicator
    showTypingIndicator();

    // Simulate bot response
    setTimeout(() => {
      if (userInput.toLowerCase().includes('hello') || userInput.toLowerCase().includes('hi')) {
        addMessage("👋 Hello! How can I help you today?");
      } else if (userInput.toLowerCase().includes('materials') || userInput.toLowerCase().includes('files')) {
        showSubjects();
      } else if (userInput.toLowerCase().includes('announcement')) {
        showAnnouncements();
      } else {
        addMessage("I'm not sure how to help with that. Try asking about materials, announcements, or use the buttons below!");
      }
      
      setButtons([
        { 
          label: "📚 Browse Materials", 
          action: 'browse_materials',
          primary: true,
          icon: 'book-open-variant'
        },
        { 
          label: "📢 Announcements", 
          action: 'announcements',
          primary: false,
          icon: 'megaphone'
        },
        { 
          label: "🏠 Main Menu", 
          action: 'main_menu',
          primary: false,
          icon: 'home'
        }
      ]);
    }, 1000);
  };

  const handleNewAnnouncement = () => {
    setShowAnnouncementModal(true);
  };

  const sendAnnouncement = () => {
    if (!announcementText.trim()) {
      Alert.alert('Error', 'Please enter an announcement');
      return;
    }

    const announcementMessage = {
      id: Date.now(),
      type: 'announcement',
      text: announcementText.trim(),
      timestamp: 'Just now',
    };

    setMessages(prev => [...prev, announcementMessage]);
    setShowAnnouncementModal(false);
    setAnnouncementText('');
    
    addMessage("📢 Announcement sent successfully!");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-back"
          size={24}
          iconColor={darkMode ? '#fff' : '#000'}
          onPress={() => navigation.goBack()}
        />
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: darkMode ? '#fff' : '#000' }]}>
            Class Bot
          </Text>
          <Text style={[styles.headerSubtitle, { color: darkMode ? '#aaa' : '#666' }]}>
            {classroom.title}
          </Text>
        </View>
        <Avatar.Icon size={32} icon="robot" style={styles.headerBotIcon} />
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.messagesContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View key={message.id}>
              {message.type === 'user' ? (
                <UserMessage message={message} darkMode={darkMode} />
              ) : (
                <BotMessage 
                  message={message} 
                  darkMode={darkMode} 
                  onMaterialPress={handleMaterialPress}
                />
              )}
            </View>
          ))}
          
          {isTyping && (
            <View style={styles.botMessageContainer}>
              <Avatar.Icon size={32} icon="robot" style={styles.botAvatar} />
              <Surface style={[styles.typingIndicator, { backgroundColor: darkMode ? '#23272f' : '#fff' }]}>
                <ActivityIndicator size="small" color="#009688" />
                <Text style={[styles.typingText, { color: darkMode ? '#aaa' : '#666' }]}>
                  Bot is typing...
                </Text>
              </Surface>
            </View>
          )}
        </ScrollView>

        {/* Quick Reply Buttons */}
        {buttons.length > 0 && (
          <View style={styles.quickReplyContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {buttons.map((button, index) => (
                <QuickReplyButton
                  key={index}
                  button={button}
                  onPress={handleButtonPress}
                  darkMode={darkMode}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Type a message..."
            value={input}
            onChangeText={setInput}
            mode="outlined"
            style={styles.input}
            multiline
            right={
              <TextInput.Icon
                icon="send"
                onPress={handleSendMessage}
                disabled={!input.trim()}
              />
            }
          />
        </View>
      </KeyboardAvoidingView>

      {/* Announcement Modal */}
      <Portal>
        <Modal
          visible={showAnnouncementModal}
          onDismiss={() => setShowAnnouncementModal(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: darkMode ? '#23272f' : '#fff' }]}
        >
          <Text style={[styles.modalTitle, { color: darkMode ? '#fff' : '#000' }]}>
            New Announcement
          </Text>
          <TextInput
            placeholder="Enter your announcement..."
            value={announcementText}
            onChangeText={setAnnouncementText}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.modalInput}
          />
          <View style={styles.modalButtons}>
            <Button mode="outlined" onPress={() => setShowAnnouncementModal(false)} style={styles.modalButton}>
              Cancel
            </Button>
            <Button mode="contained" onPress={sendAnnouncement} style={styles.modalButton}>
              Send
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

function getStyles(darkMode) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? '#181818' : '#F5F5F5',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? '#333' : '#E0E0E0',
    },
    headerContent: {
      flex: 1,
      marginLeft: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
    },
    headerSubtitle: {
      fontSize: 14,
      marginTop: 2,
    },
    headerBotIcon: {
      backgroundColor: '#009688',
    },
    messagesContainer: {
      flex: 1,
    },
    messagesList: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    botMessageContainer: {
      flexDirection: 'row',
      marginBottom: 16,
      alignItems: 'flex-start',
    },
    userMessageContainer: {
      flexDirection: 'row',
      marginBottom: 16,
      alignItems: 'flex-start',
      justifyContent: 'flex-end',
    },
    botAvatar: {
      backgroundColor: '#009688',
      marginRight: 8,
    },
    userAvatar: {
      backgroundColor: '#FF6B6B',
      marginLeft: 8,
    },
    botMessage: {
      flex: 1,
      padding: 12,
      borderRadius: 16,
      borderTopLeftRadius: 4,
      elevation: 1,
    },
    userMessage: {
      padding: 12,
      borderRadius: 16,
      borderTopRightRadius: 4,
      elevation: 1,
    },
    botMessageText: {
      fontSize: 16,
      lineHeight: 22,
    },
    userMessageText: {
      fontSize: 16,
      lineHeight: 22,
      color: '#fff',
    },
    messageTime: {
      fontSize: 12,
      marginTop: 4,
      opacity: 0.7,
    },
    typingIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 16,
      borderTopLeftRadius: 4,
      elevation: 1,
    },
    typingText: {
      fontSize: 14,
      marginLeft: 8,
    },
    materialCard: {
      flex: 1,
      borderRadius: 12,
      elevation: 2,
    },
    materialHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    materialInfo: {
      flex: 1,
      marginLeft: 12,
    },
    materialTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    materialMeta: {
      fontSize: 12,
      marginBottom: 8,
    },
    materialActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionChip: {
      height: 28,
    },
    announcementCard: {
      flex: 1,
      padding: 12,
      borderRadius: 12,
      elevation: 2,
    },
    announcementHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    announcementTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
      color: '#000',
    },
    announcementText: {
      fontSize: 14,
      lineHeight: 20,
      color: '#000',
      marginBottom: 8,
    },
    announcementTime: {
      fontSize: 12,
      color: '#666',
      textAlign: 'right',
    },
    quickReplyContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: darkMode ? '#333' : '#E0E0E0',
    },
    quickReplyButton: {
      marginRight: 8,
      marginBottom: 8,
    },
    inputContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: darkMode ? '#333' : '#E0E0E0',
    },
    input: {
      backgroundColor: darkMode ? '#23272f' : '#fff',
    },
    modal: {
      padding: 20,
      margin: 20,
      borderRadius: 12,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    modalInput: {
      marginBottom: 16,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
    },
    modalButton: {
      minWidth: 80,
    },
  });
}