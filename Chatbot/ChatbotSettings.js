import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getSettingsUrl, setSettingsUrl } from './flowRepository';

function isValidHttps(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && !!u.host;
  } catch {
    return false;
  }
}

export default function ChatbotSettings({ darkMode }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { classroom } = route.params;

  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const styles = getStyles(darkMode);

  useEffect(() => {
    (async () => {
      const existing = await getSettingsUrl(classroom.id);
      if (existing) setUrl(existing);
    })();
  }, [classroom.id]);

  const onSave = async () => {
    const value = url.trim();
    if (!isValidHttps(value)) {
      setError('Enter a valid HTTPS URL');
      return;
    }
    setError('');
    await setSettingsUrl(classroom.id, value);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chatbot Flow URL</Text>
      <TextInput
        label="HTTPS URL"
        value={url}
        onChangeText={setUrl}
        mode="outlined"
        placeholder="https://example.onrender.com/flow"
        style={styles.input}
      />
      {!!error && <HelperText type="error">{error}</HelperText>}
      <Button mode="contained" onPress={onSave} style={styles.button}>
        Save
      </Button>
    </View>
  );
}

function getStyles(darkMode) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: darkMode ? '#181818' : '#fff',
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12,
      color: darkMode ? '#fff' : '#000',
    },
    input: {
      marginBottom: 8,
      backgroundColor: darkMode ? '#23272f' : '#fff',
    },
    button: {
      marginTop: 8,
      backgroundColor: '#009688',
    },
  });
}