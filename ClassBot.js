import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Dimensions, KeyboardAvoidingView, Platform, Image, TouchableOpacity } from 'react-native';
import { Text, Button, TextInput, Surface, IconButton, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { getSettingsUrl, getFlow, mapNodeToUi, ActionTypes } from './Chatbot/flowRepository';

const { width, height } = Dimensions.get('window');

export default function ClassBot({ darkMode }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { classroom } = route.params;
  const scrollViewRef = useRef();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flow, setFlow] = useState(null);
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [uiMessages, setUiMessages] = useState([]);
  const [uiButtons, setUiButtons] = useState([]);

  const styles = getStyles(darkMode);

  useEffect(() => {
    loadFlow(false);
  }, [classroom.id]);

  const loadFlow = async (force) => {
    setLoading(true);
    setError('');
    try {
      const url = await getSettingsUrl(classroom.id);
      const result = await getFlow(classroom.id, url, force);
      if (!result.ok) {
        setError(result.error || 'Failed to load flow');
        setLoading(false);
        return;
      }
      const f = result.flow;
      setFlow(f);
      setCurrentNodeId(f.startNodeId);
      renderNode(f.startNodeId, f);
    } catch (e) {
      setError('Unexpected error loading flow');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    if (!action || !flow) return;
    if (action.type === ActionTypes.GO_TO_NODE) {
      if (action.targetNodeId) {
        setCurrentNodeId(action.targetNodeId);
        renderNode(action.targetNodeId, flow);
      }
    } else if (action.type === ActionTypes.OPEN_URL) {
      const url = action.url;
      if (!url) return;
      try {
        await WebBrowser.openBrowserAsync(url);
      } catch {
        Alert.alert('Error', 'Unable to open link');
      }
    }
  };

  const renderNode = (nodeId, f) => {
    const node = (f.nodes || []).find(n => n.id === nodeId);
    if (!node) {
      setError('Flow node not found');
      return;
    }
    const mapped = mapNodeToUi(node, handleAction);
    setUiMessages(mapped.uiMessages);
    setUiButtons(mapped.buttons);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-back"
          size={24}
          iconColor={darkMode ? '#fff' : '#000'}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          tooltip="Go back"
        />
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: darkMode ? '#fff' : '#000' }]}>Class Bot</Text>
          <Text style={[styles.headerSubtitle, { color: darkMode ? '#aaa' : '#666' }]}>
            {classroom.title}
          </Text>
        </View>
        <IconButton
          icon="refresh"
          size={22}
          iconColor={darkMode ? '#fff' : '#000'}
          onPress={() => loadFlow(true)}
          accessibilityLabel="Refresh chatbot"
          tooltip="Refresh"
        />
      </View>

      <KeyboardAvoidingView
        style={styles.messagesContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#009688" />
            <Text style={{ marginTop: 10, color: darkMode ? '#aaa' : '#666' }}>Loading chatbot...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={{ color: darkMode ? '#fff' : '#000', marginBottom: 8 }}>{error}</Text>
            <Button mode="contained" onPress={() => loadFlow(false)}>Try Again</Button>
            <Button mode="text" onPress={() => navigation.navigate('ChatbotSettings', { classroom })}>
              Open Settings
            </Button>
          </View>
        ) : (
          <>
            <ScrollView ref={scrollViewRef} style={styles.messagesList} showsVerticalScrollIndicator={false}>
              {uiMessages.map((m) => (
                <View key={m.id} style={styles.messageRow}>
                  <Surface style={[styles.botMessage, { backgroundColor: darkMode ? '#23272f' : '#fff' }]}>
                    {m.type === 'image' ? (
                      <Image source={{ uri: m.imageUrl }} style={{ width: '100%', height: 180, borderRadius: 8 }} />
                    ) : (
                      <Text style={[styles.botMessageText, { color: darkMode ? '#fff' : '#000' }]}>{m.text}</Text>
                    )}
                  </Surface>
                </View>
              ))}
            </ScrollView>

            {uiButtons.length > 0 && (
              <View style={styles.quickReplyContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {uiButtons.map((b, idx) => (
                    <Button
                      key={idx}
                      mode={b.primary ? 'contained' : 'outlined'}
                      onPress={b.onPress}
                      style={[styles.quickReplyButton, b.primary ? { backgroundColor: '#009688' } : { borderColor: '#009688' }]}
                      labelStyle={{ color: b.primary ? '#fff' : '#009688' }}
                    >
                      {b.label}
                    </Button>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Type a message..."
                value={''}
                onChangeText={() => {}}
                mode="outlined"
                style={styles.input}
                editable={false}
                right={<TextInput.Icon icon="send" disabled />}
              />
            </View>
          </>
        )}
      </KeyboardAvoidingView>
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
    headerContent: { flex: 1, marginLeft: 8 },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    headerSubtitle: { fontSize: 14, marginTop: 2 },
    messagesContainer: { flex: 1 },
    messagesList: { flex: 1, paddingHorizontal: 16, paddingVertical: 8 },
    messageRow: { flexDirection: 'row', marginBottom: 12 },
    botMessage: { flex: 1, padding: 12, borderRadius: 12, elevation: 1 },
    botMessageText: { fontSize: 16, lineHeight: 22 },
    quickReplyContainer: { paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1, borderTopColor: darkMode ? '#333' : '#E0E0E0' },
    quickReplyButton: { marginRight: 8, marginBottom: 8 },
    inputContainer: { paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1, borderTopColor: darkMode ? '#333' : '#E0E0E0' },
    input: { backgroundColor: darkMode ? '#23272f' : '#fff' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  });
}