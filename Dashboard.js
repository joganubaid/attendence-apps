import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import {
  Text,
  Card,
  Surface,
  Button,
  Modal,
  Portal,
  TextInput,
  FAB,
  ProgressBar,
  Badge,
  IconButton,
} from 'react-native-paper';

function calculateStats(subjectName, attendance) {
  let attended = 0, missed = 0, half = 0, total = 0;

  Object.values(attendance).forEach(day => {
    if (subjectName in day) {
      total++;
      const status = day[subjectName];
      if (status === 'attended') attended++;
      else if (status === 'missed') missed++;
      else if (status === 'half') half++;
    }
  });

  const percent = total > 0 ? ((attended + 0.5 * half) / total) * 100 : 0;
  let canMiss = 0, needAttend = 0;

  if (percent >= 75) {
    let a = attended, h = half, t = total;
    while (((a + 0.5 * h) / (t + 1)) * 100 >= 75) {
      canMiss++;
      t++;
    }
  } else {
    let a = attended, h = half, t = total;
    while (t === 0 || ((a + 1 + 0.5 * h) / (t + 1)) * 100 < 75) {
      needAttend++;
      a++;
      t++;
    }
    needAttend++;
  }

  return { attended, missed, half, total, percent, canMiss, needAttend };
}

function SubjectCard({ subject, stats, darkMode, styles, onDelete }) {
  const successColor = '#4CAF50';
  const errorColor = '#F44336';
  const isLow = stats.percent < 75;

  return (
    <Surface style={[styles.subjectCard, { backgroundColor: darkMode ? '#23272f' : '#fff' }]} elevation={2}>
      <View style={styles.cardHeader}>
        <View style={styles.cardContent}>
          <Text style={[styles.subjectName, { color: darkMode ? '#fff' : '#000' }]}>{subject.name}</Text>
          <Text style={[styles.statsText, { color: darkMode ? '#aaa' : '#555' }]}>
            {stats.attended} attended • {stats.missed} missed • {stats.total} total
          </Text>
        </View>
        <View style={styles.percentageContainer}>
          <Badge size={32} style={{ backgroundColor: isLow ? errorColor : successColor, color: '#fff' }}>
            {stats.percent.toFixed(1)}%
          </Badge>
          <IconButton
            icon="delete"
            iconColor={darkMode ? '#ccc' : '#888'}
            size={20}
            onPress={() => onDelete(subject.name)}
            style={{ marginTop: 4 }}
            accessibilityLabel={`Delete ${subject.name}`}
            tooltip="Delete Subject"
          />
        </View>
      </View>

      <ProgressBar progress={stats.percent / 100} color={isLow ? errorColor : successColor} style={styles.progressBar} />

      <Text style={[styles.statusMessage, { color: isLow ? errorColor : successColor }]}>
        {stats.percent >= 75
          ? `Can miss ${stats.canMiss} more classes`
          : `Need to attend ${stats.needAttend} more classes`}
      </Text>
    </Surface>
  );
}

export default function Dashboard({ subjects = [], attendance = {}, addSubject, deleteSubject, darkMode }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [subjectName, setSubjectName] = useState('');

  const styles = getStyles(darkMode);

  const handleAdd = () => {
    const trimmed = subjectName.trim();
    if (trimmed && !subjects.find(s => s.name === trimmed)) {
      addSubject(trimmed);
    }
    setModalVisible(false);
    setSubjectName('');
  };

  const handleDelete = (name) => {
    Alert.alert("Delete Subject", `Are you sure you want to delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", onPress: () => deleteSubject(name), style: "destructive" }
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {subjects.map((subject, idx) => {
          const stats = calculateStats(subject.name, attendance);
          return (
            <SubjectCard
              key={idx}
              subject={subject}
              stats={stats}
              darkMode={darkMode}
              styles={styles}
              onDelete={handleDelete}
            />
          );
        })}
      </ScrollView>

      <FAB icon="plus" style={styles.fab} onPress={() => setModalVisible(true)} color="#fff" />

      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>Add Subject</Text>
          <TextInput
            label="Subject Name"
            value={subjectName}
            onChangeText={setSubjectName}
            mode="outlined"
            style={{ marginBottom: 12 }}
          />
          <Button mode="contained" onPress={handleAdd}>
            Add
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

function getStyles(darkMode) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: darkMode ? '#181818' : '#F5F5F5',
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor: '#009688',
    },
    subjectCard: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    cardContent: {
      flex: 1,
    },
    subjectName: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 4,
    },
    statsText: {
      fontSize: 14,
    },
    percentageContainer: {
      alignItems: 'flex-end',
    },
    progressBar: {
      height: 6,
      borderRadius: 3,
      marginVertical: 12,
    },
    statusMessage: {
      fontSize: 14,
      fontWeight: '500',
    },
    modal: {
      backgroundColor: darkMode ? '#23272f' : '#fff',
      padding: 20,
      margin: 20,
      borderRadius: 12,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
    },
  });
}
