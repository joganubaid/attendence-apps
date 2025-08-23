import React, { useState } from 'react';

import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, IconButton } from 'react-native-paper';
import Calendar from './Calendar';

const statusOptions = [
  { key: 'off', icon: 'close-circle-outline', color: '#BDBDBD' },
  { key: 'missed', icon: 'close', color: '#F44336' },
  { key: 'attended', icon: 'check', color: '#4CAF50' },
  { key: 'half', icon: 'minus', color: '#FF9800' },
  { key: 'not_marked', icon: 'help-circle-outline', color: '#90A4AE' },
];

function getWeekdayIdx(dateStr) {
  const d = new Date(dateStr);
  const jsDay = d.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  return jsDay === 0 ? 6 : jsDay - 1;
}

function SubjectAttendanceCard({ subject, status, onStatusChange, darkMode }) {
  return (
    <Card style={[styles.card, darkMode && styles.cardDark]}>
      <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={[{ fontSize: 16, fontWeight: 'bold' }, darkMode && { color: '#fff' }]}>{subject.name}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {statusOptions.map(option => (
            <IconButton
              key={option.key}
              icon={option.icon}
              iconColor={status === option.key ? option.color : '#BDBDBD'}
              size={24}
              onPress={() => onStatusChange(option.key)}
              style={{ margin: 0 }}
            />
          ))}
        </View>
      </Card.Content>
    </Card>
  );
}

export default function Timetable({ subjects, timetable, setTimetable, darkMode, attendance = {}, markAttendance }) 
 {
  const [showEditor, setShowEditor] = useState(false);
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  const todayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;




  const todaySubjects = timetable[todayIdx] || [];

  console.log('Today is:', today.toDateString(), 'Index:', todayIdx);
  console.log('Timetable for today:', timetable[todayIdx]);

  return (
    <ScrollView style={[styles.container, darkMode && styles.containerDark]}>
      <Text style={[{ marginBottom: 12, marginTop: 8, textAlign: 'center', fontSize: 20, fontWeight: 'bold' }, darkMode && { color: '#fff' }]}>
        {today.toDateString()}
      </Text>
      {todaySubjects.length === 0 && (
        <Text style={{ textAlign: 'center', color: darkMode ? '#aaa' : '#888', marginTop: 32 }}>No subjects scheduled for today.</Text>
      )}
      {todaySubjects.map((subjectName, idx) => {
        const subject = subjects.find(s => s.name === subjectName) || { name: subjectName };
        const status = attendance[dateStr]?.[subjectName] || 'not_marked';
        return (
          <SubjectAttendanceCard
            subject={subject}
            key={idx}
            status={status}
            onStatusChange={status => markAttendance(dateStr, subjectName, status)}
            darkMode={darkMode}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 8,
  },
  containerDark: {
    backgroundColor: '#181818',
  },
  card: {
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff',
  },
  cardDark: {
    backgroundColor: '#23272f',
  },
}); 