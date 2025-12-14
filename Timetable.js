import React, { useState } from 'react';
import { View, Text as RNText, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import TimetableEditor from './TimetableEditor';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Timetable({ subjects, timetable, setTimetable, darkMode, attendance = {}, markAttendance }) {

  const [showEditor, setShowEditor] = useState(false);
  const today = new Date();
const dateStr = today.toISOString().slice(0, 10);
const todayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;


  if (showEditor) {
    return (
  <TimetableEditor
    subjects={subjects}
    timetable={timetable}
    setTimetable={setTimetable}
    goBack={() => setShowEditor(false)}
    darkMode={darkMode}
  />
);

  }

  // Find the max number of periods in any day
  const maxPeriods = timetable.reduce((max, day) => Math.max(max, day.length), 0);

  // Each day column width (show 3 at a time)
  const dayColumnWidth = 120;
  const visibleDays = 3;
  const gridWidth = dayColumnWidth * days.length;

  const styles = getStyles(darkMode);

  return (
    <ScrollView style={[styles.container, darkMode && styles.containerDark]}>
      <Card style={[styles.card, darkMode && styles.cardDark]}>
        <Card.Content>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={[styles.title, darkMode && styles.titleDark]}>Timetable</Text>
            <Button mode="contained" onPress={() => setShowEditor(true)} style={styles.button}>
              Customize Timetable
            </Button>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: dayColumnWidth * visibleDays }} contentContainerStyle={{ width: gridWidth }}>
            <View>
              <View style={styles.headerRow}>
                {days.map(day => (
                  <Text key={day} style={[styles.headerCell, darkMode && styles.headerCellDark, { width: dayColumnWidth }]}>{day}</Text>
                ))}
              </View>
              <View style={styles.gridRow}>
                {timetable.map((dayPeriods, dayIdx) => (
                  <View key={dayIdx} style={[styles.dayColumn, { width: dayColumnWidth }]}>
                    {[...Array(maxPeriods)].map((_, periodIdx) => (
                      <View key={periodIdx} style={[styles.cell, darkMode && styles.cellDark]}>

  <Text style={[{ textAlign: 'center' }, darkMode && { color: '#fff' }]}>
    {dayPeriods[periodIdx] || ''}
  </Text>
  {dayIdx === todayIdx && !!dayPeriods[periodIdx] && (
    <Text style={{ fontSize: 10, color: '#009688' }}>
      {attendance[dateStr]?.[dayPeriods[periodIdx]] || '—'}
    </Text>
  )}


                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

function getStyles(darkMode) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? '#181818' : '#F5F5F5',
      padding: 8,
    },
    containerDark: {
      backgroundColor: '#181818',
    },
    card: {
      borderRadius: 12,
      elevation: 2,
      marginBottom: 10,
      backgroundColor: '#fff',
    },
    cardDark: {
      backgroundColor: '#23272f',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#222',
    },
    titleDark: {
      color: '#fff',
    },
    button: {
      backgroundColor: '#009688',
    },
    headerRow: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    headerCell: {
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: 15,
      color: '#009688',
      marginHorizontal: 2,
    },
    headerCellDark: {
      color: '#80cbc4',
    },
    gridRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    dayColumn: {
      alignItems: 'stretch',
      marginHorizontal: 2,
    },
    cell: {
      minHeight: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 0.5,
      borderColor: '#E0E0E0',
      borderRadius: 4,
      backgroundColor: '#FAFAFA',
      marginVertical: 2,
      marginHorizontal: 0,
      padding: 2,
    },
    cellDark: {
      backgroundColor: '#23272f',
      borderColor: '#333',
    },
  });
}