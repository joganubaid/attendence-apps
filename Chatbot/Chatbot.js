import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet, 
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get('window');
const API_BASE = "https://app-bot-ogeh.onrender.com";

export default function Chatbot({ darkMode }) {
  const navigation = useNavigation();
  const scrollViewRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const [messages, setMessages] = useState([]);
  const [buttons, setButtons] = useState([]);
  const [input, setInput] = useState("");
  const [state, setState] = useState({ subject: null, examType: null });
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const styles = getStyles(darkMode);

  const addMessage = (text, from = "bot") => {
    const newMessage = { 
      id: Date.now(), 
      text, 
      from, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Auto-scroll to bottom with animation
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    // Animate new message
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const showTypingIndicator = () => {
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1000);
  };

  const resetToStart = async () => {
    setIsLoading(true);
    setMessages([]);
    setButtons([]);
    setState({ subject: null, examType: null });

    try {
      const res = await axios.get(`${API_BASE}/subjects`);
      const theory = Array.isArray(res.data?.theory) ? res.data.theory : [];
      const labs = Array.isArray(res.data?.labs) ? res.data.labs : [];

     setButtons([
  { 
    label: "📚 Theory Subjects", 
    action: () => showSubjects(theory, "theory"),
    primary: true,
    icon: "book-outline"
  },
  { 
    label: "🔬 Lab Subjects", 
    action: () => showSubjects(labs, "lab"),
    primary: true,
    icon: "flask-outline"
  },
  { 
    label: "🔄 Restart", 
    action: showStartOptions,
    secondary: true,
    icon: "refresh-outline"
  }
]);
      addMessage("🎯 Choose your subject category to find the perfect study materials:");
    } catch (error) {
      console.error("Error fetching subjects:", error);
      addMessage("❌ Sorry, I couldn't load the subjects. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const showStartOptions = () => {
    showTypingIndicator();
    setTimeout(() => {
      setButtons([
        { 
          label: "🚀 Get Started", 
          action: () => resetToStart(),
          primary: true
        }
      ]);
      addMessage("👋 Welcome to StudyBot! I'll help you find study materials quickly and easily. Ready to start?");
    }, 1000);
  };
  const showSubjects = (subjectList, type) => {
  addMessage(`📚 Choose a ${type === "theory" ? "theory" : "lab"} subject:`);
  setButtons(
    subjectList.map(subject => ({
      label: subject,
      action: () => {
        setState(prev => ({ ...prev, subject }));
        addMessage(`📘 Selected: ${subject}`);
        if (type === "theory") {
          selectTheoryOptions(subject);
        } else {
          selectLabMaterial(subject);
        }
      },
      primary: true
    }))
  );
};

const selectTheoryOptions = (subject) => {
  setButtons([
    { label: "📄 Mid Sem 1", action: () => navigateToPDF(subject, "midsem1"), primary: true },
    { label: "📄 Mid Sem 2", action: () => navigateToPDF(subject, "midsem2"), primary: true },
    { label: "📘 Unit 1", action: () => navigateToPDF(subject, "unit1"), secondary: true },
    { label: "📘 Unit 2", action: () => navigateToPDF(subject, "unit2"), secondary: true },
    { label: "📘 Unit 3", action: () => navigateToPDF(subject, "unit3"), secondary: true },
    { label: "📘 Unit 4", action: () => navigateToPDF(subject, "unit4"), secondary: true },
    { label: "📘 Unit 5", action: () => navigateToPDF(subject, "unit5"), secondary: true },
    { label: "🧪 End Sem", action: () => selectEndSemYear(subject), primary: true },
    { label: "🔙 Back", action: resetToStart, secondary: true }
  ]);
};

const selectEndSemYear = (subject) => {
  addMessage("📅 Choose a year for End Sem:");
  setButtons([
    { label: "📅 2023", action: () => navigateToPDF(subject, "endsem-2023"), primary: true },
    { label: "📅 2024", action: () => navigateToPDF(subject, "endsem-2024"), primary: true },
    { label: "🔙 Back", action: () => selectTheoryOptions(subject), secondary: true }
  ]);
};

const selectLabMaterial = (subject) => {
  setButtons([
    { label: "📁 Material", action: () => navigateToPDF(subject, "material"), primary: true },
    { label: "🔙 Back", action: resetToStart, secondary: true }
  ]);
};

const navigateToPDF = (subject, examType) => {
  let filename = "";

  if (examType === "material") {
    filename = `${subject}_material.pdf`;
  } else if (examType.startsWith("unit")) {
    filename = `${subject}_${examType}.pdf`;
  } else {
    // End Sem, Mid Sem
    filename = `${subject}_${examType}_2024.pdf`;  // Change to dynamic year if needed
  }

  navigation.navigate("PdfViewer", {
    url: `https://app-bot-ogeh.onrender.com/download-url/${filename}`
  });
};








  // Enhanced button rendering with better visual hierarchy
  const renderButtons = () => (
    <View style={styles.buttonContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.buttonScrollContent}
      >
        {buttons.map((btn, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.actionButton,
              btn.primary && styles.primaryButton,
              btn.secondary && styles.secondaryButton
            ]}
            onPress={btn.action}
            activeOpacity={0.8}
          >
            {btn.icon && (
              <Ionicons 
                name={btn.icon} 
                size={18} 
                color={btn.primary ? '#fff' : (darkMode ? '#80cbc4' : '#009688')} 
                style={styles.buttonIcon}
              />
            )}
            <Text style={[
              styles.buttonText,
              btn.primary && styles.primaryButtonText,
              btn.secondary && styles.secondaryButtonText
            ]}>
              {btn.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Enhanced message rendering with better typography and spacing
  const renderMessage = (msg, idx) => (
    <Animated.View
      key={msg.id || idx}
      style={[
        styles.messageContainer,
        msg.from === "user" ? styles.userMessageContainer : styles.botMessageContainer,
        { opacity: fadeAnim }
      ]}
    >
      <View style={[
        styles.messageBubble,
        msg.from === "user" ? styles.userMessage : styles.botMessage
      ]}>
        <Text style={[
          styles.messageText,
          msg.from === "user" ? styles.userMessageText : styles.botMessageText
        ]}>
          {msg.text}
        </Text>
        <Text style={[
          styles.timestamp,
          msg.from === "user" ? styles.userTimestamp : styles.botTimestamp
        ]}>
          {msg.timestamp}
        </Text>
      </View>
    </Animated.View>
  );

  useEffect(() => {
    showStartOptions();
  }, []);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.botAvatar}>
            <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>StudyBot</Text>
            <Text style={styles.headerSubtitle}>
              {isLoading ? "Loading..." : isTyping ? "Typing..." : "Online"}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={darkMode ? '#80cbc4' : '#009688'} />
        </TouchableOpacity>
      </View>

      {/* Chat Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}
        
        {isTyping && (
          <View style={styles.typingIndicator}>
            <View style={styles.typingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {buttons.length > 0 && renderButtons()}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => {
              if (input.trim()) {
                addMessage(input, "user");
                setInput("");
              }
            }}
            placeholder="Type a message..."
            placeholderTextColor={darkMode ? '#666' : '#999'}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={() => {
              if (input.trim()) {
                addMessage(input, "user");
                setInput("");
              }
            }}
            style={styles.sendButton}
            disabled={!input.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={input.trim() ? '#fff' : '#999'} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function getStyles(darkMode) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? '#181818' : '#f8f9fa',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: darkMode ? '#23272f' : '#fff',
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? '#333' : '#e0e0e0',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    botAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#009688',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    headerText: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: darkMode ? '#fff' : '#222',
    },
    headerSubtitle: {
      fontSize: 14,
      color: darkMode ? '#80cbc4' : '#009688',
      marginTop: 2,
    },
    closeButton: {
      padding: 8,
    },
    chatArea: {
      flex: 1,
    },
    chatContent: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    messageContainer: {
      marginVertical: 4,
    },
    userMessageContainer: {
      alignItems: 'flex-end',
    },
    botMessageContainer: {
      alignItems: 'flex-start',
    },
    messageBubble: {
      maxWidth: width * 0.8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 20,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    userMessage: {
      backgroundColor: '#009688',
      borderBottomRightRadius: 4,
    },
    botMessage: {
      backgroundColor: darkMode ? '#23272f' : '#fff',
      borderBottomLeftRadius: 4,
      borderWidth: darkMode ? 0 : 1,
      borderColor: '#e0e0e0',
    },
    messageText: {
      fontSize: 16,
      lineHeight: 22,
    },
    userMessageText: {
      color: '#fff',
    },
    botMessageText: {
      color: darkMode ? '#fff' : '#222',
    },
    timestamp: {
      fontSize: 12,
      marginTop: 4,
      opacity: 0.7,
    },
    userTimestamp: {
      color: '#fff',
      textAlign: 'right',
    },
    botTimestamp: {
      color: darkMode ? '#aaa' : '#666',
    },
    typingIndicator: {
      alignItems: 'flex-start',
      marginVertical: 8,
    },
    typingDots: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: darkMode ? '#23272f' : '#f0f0f0',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 20,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#999',
      marginHorizontal: 2,
    },
    buttonContainer: {
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: darkMode ? '#333' : '#e0e0e0',
      backgroundColor: darkMode ? '#23272f' : '#fff',
    },
    buttonScrollContent: {
      paddingHorizontal: 16,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginRight: 8,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: darkMode ? '#80cbc4' : '#009688',
      backgroundColor: 'transparent',
      minWidth: 120,
    },
    primaryButton: {
      backgroundColor: '#009688',
      borderColor: '#009688',
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderColor: darkMode ? '#666' : '#ccc',
    },
    buttonIcon: {
      marginRight: 6,
    },
    buttonText: {
      fontSize: 14,
      fontWeight: '500',
      color: darkMode ? '#80cbc4' : '#009688',
    },
    primaryButtonText: {
      color: '#fff',
    },
    secondaryButtonText: {
      color: darkMode ? '#aaa' : '#666',
    },
    inputContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: darkMode ? '#23272f' : '#fff',
      borderTopWidth: 1,
      borderTopColor: darkMode ? '#333' : '#e0e0e0',
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: darkMode ? '#181818' : '#f8f9fa',
      borderRadius: 25,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: darkMode ? '#333' : '#e0e0e0',
    },
    textInput: {
      flex: 1,
      fontSize: 16,
      color: darkMode ? '#fff' : '#222',
      maxHeight: 100,
      marginRight: 8,
    },
    sendButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#009688',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
