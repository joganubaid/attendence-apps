import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

export default function Settings({ darkMode, onToggleDarkMode }) {
  const styles = getStyles(darkMode);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Dark Mode</Text>
        <Switch
          value={darkMode}
          onValueChange={onToggleDarkMode}
        />
      </View>
    </View>
  );
}

function getStyles(darkMode) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: darkMode ? '#181818' : '#fff',
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 20,
      color: darkMode ? '#fff' : '#000',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: 10,
    },
    label: {
      fontSize: 18,
      color: darkMode ? '#ccc' : '#222',
    },
  });
}
