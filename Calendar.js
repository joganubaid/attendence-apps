import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Modal, Portal, Button, IconButton, Surface, Divider } from 'react-native-paper';
import { Calendar as RNCalendar } from 'react-native-calendars';

const statusOptions = [
  { key: 'off', icon: 'close-circle-outline', label: 'Off', color: '#BDBDBD' },
  { key: 'missed', icon: 'close', label: 'Missed', color: '#F44336' },
  { key: 'attended', icon: 'check', label: 'Present', color: '#4CAF50' },
  { key: 'half', icon: 'minus', label: 'Half Day', color: '#FF9800' },
  { key: 'not_marked', icon: 'help-circle-outline', label: 'Not Marked', color: '#90A4AE' },
];

function SubjectAttendanceCard({ subject, status, onStatusChange, darkMode, styles }) {

  return (
    <Surface style={[styles.subjectCard, { backgroundColor: darkMode ? '#23272f' : '#fff' }]}>
      <View style={styles.subjectInfo}>
        <Text style={[styles.subjectName, { color: darkMode ? '#fff' : '#000' }]}>{subject.name}</Text>
        <Text style={[styles.subjectStatus, { color: darkMode ? '#aaa' : '#555' }]}>
          {statusOptions.find(opt => opt.key === status)?.label || 'Not Marked'}
        </Text>
      </View>
      <View style={styles.statusButtons}>
        {statusOptions.slice(0, 4).map(option => (
          <IconButton
            key={option.key}
            icon={option.icon}
            iconColor={status === option.key ? option.color : '#BDBDBD'}
            size={26}
            onPress={() => onStatusChange(option.key)}
            style={{ margin: 4 }}
          />
        ))}
      </View>
    </Surface>
  );
}

export default function Calendar({ subjects = [], timetable = [], attendance = {}, markAttendance, darkMode }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const styles = getStyles(darkMode);


  function getWeekdayIdx(dateStr) {
    const d = new Date(dateStr);
    const jsDay = d.getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  }

  function getMarkedDates() {
    const marked = {};
    Object.entries(attendance).forEach(([date, subjObj]) => {
      const values = Object.values(subjObj);
      let status = 'attended';
      if (values.includes('missed')) status = 'missed';
      else if (values.includes('half')) status = 'half';
      else if (values.includes('off')) status = 'off';

      marked[date] = {
        customStyles: {
          container: {
            backgroundColor: statusOptions.find(opt => opt.key === status)?.color || '#4CAF50',
            borderRadius: 16,
          },
          text: {
            color: '#fff',
            fontWeight: 'bold',
          }
        }
      };
    });

    if (selectedDate) {
      marked[selectedDate] = {
        ...(marked[selectedDate] || {}),
        selected: true,
        selectedColor: '#009688',
      };
    }

    return marked;
  }

  function getModalSubjects() {
    if (!selectedDate || timetable.length !== 7) return [];
    const idx = getWeekdayIdx(selectedDate);
    return timetable[idx] || [];
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toDateString();
  }

  

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <Card style={[styles.card, darkMode && styles.cardDark]}>
        <Card.Content>
          <RNCalendar
            current={new Date().toISOString().slice(0, 10)}
            markingType="custom"
            markedDates={getMarkedDates()}
            onDayPress={day => {
              setSelectedDate(day.dateString);
              setModalVisible(true);
            }}
            theme={{
              calendarBackground: darkMode ? '#23272f' : '#FAFAFA',
              textSectionTitleColor: darkMode ? '#80cbc4' : '#009688',
              todayTextColor: '#009688',
              dayTextColor: darkMode ? '#fff' : '#222',
              textDisabledColor: '#BDBDBD',
              arrowColor: '#009688',
              monthTextColor: darkMode ? '#80cbc4' : '#009688',
              textDayFontWeight: 'bold',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: 'bold',
            }}
            style={{ borderRadius: 12 }}
          />
        </Card.Content>
      </Card>

      <View style={styles.legendRow}>
        {statusOptions.slice(0, 4).map(option => (
          <View key={option.key} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: option.color }]} />
            <Text style={{ color: darkMode ? '#fff' : '#000' }}>{option.label}</Text>
          </View>
        ))}
      </View>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[styles.fullModal, darkMode && styles.fullModalDark]}
        >
          <View style={styles.modalHeader}>
            <Button icon="arrow-left" onPress={() => setModalVisible(false)} />
            <Text style={[styles.modalTitle, { color: darkMode ? '#fff' : '#000' }]}>
              {formatDate(selectedDate)}
            </Text>
          </View>

          <Divider style={{ marginBottom: 12 }} />

          {getModalSubjects().length === 0 ? (
            <Text style={[styles.emptyText, { color: darkMode ? '#aaa' : '#666' }]}>
              No subjects scheduled for this day.
            </Text>
          ) : (
            getModalSubjects().map((subjectName, idx) => {
              const subject = subjects.find(s => s.name === subjectName) || { name: subjectName };
              const status = attendance[selectedDate]?.[subjectName] || 'not_marked';
              return (
                <SubjectAttendanceCard
  key={idx}
  subject={subject}
  status={status}
  onStatusChange={status => markAttendance(selectedDate, subjectName, status)}
  darkMode={darkMode}
  styles={styles} // ✅ Add this line
/>

              );
            })
          )}
        </Modal>
      </Portal>
    </View>
  );
}

function getStyles(darkMode) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 12,
    },
    containerDark: {
      backgroundColor: '#181818',
    },
    card: {
      borderRadius: 12,
      elevation: 2,
      marginBottom: 16,
      backgroundColor: '#fff',
    },
    cardDark: {
      backgroundColor: '#23272f',
    },
    legendRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 12,
      marginBottom: 16,
      flexWrap: 'wrap',
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 4,
    },
    legendDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      marginRight: 6,
    },
    fullModal: {
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 12,
      margin: 20,
    },
    fullModalDark: {
      backgroundColor: '#23272f',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      flex: 1,
      textAlign: 'center',
    },
    subjectCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    subjectInfo: {
      flex: 1,
    },
    subjectName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    subjectStatus: {
      fontSize: 14,
    },
    statusButtons: {
      flexDirection: 'row',
      marginLeft: 12,
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 40,
      fontSize: 16,
    },
  });
}
