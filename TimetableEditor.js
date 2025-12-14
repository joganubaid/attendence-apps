import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Menu, Appbar, IconButton, Portal, Modal } from 'react-native-paper';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekdayIdx(dateStr) {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  const jsDay = d.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export default function TimetableEditor({ subjects = [], timetable = [], setTimetable, goBack }) {
  // Always initialize as 7 arrays
  const initialTable = Array.isArray(timetable) && timetable.length === 7
    ? timetable.map(row => Array.isArray(row) ? [...row] : [])
    : Array(7).fill().map(() => []);
  const [editTable, setEditTable] = useState(initialTable.length === 7 ? initialTable : Array(7).fill().map(() => []));
  const [menuVisible, setMenuVisible] = useState({});
  const [activeDay, setActiveDay] = useState(0);

  const subjectNames = subjects.map(s => s.name);

  const handleCellChange = (periodIdx, value) => {
    setEditTable(prev => {
      const newTable = prev.map(r => [...r]);
      if (activeDay >= 0 && activeDay < 7) {
        newTable[activeDay][periodIdx] = value;
      }
      return newTable;
    });
  };

  const handleAddPeriod = () => {
    setEditTable(prev => {
      const newTable = prev.map(r => [...r]);
      if (activeDay >= 0 && activeDay < 7) {
        newTable[activeDay].push('');
      }
      return newTable;
    });
  };

  const handleRemovePeriod = (periodIdx) => {
    setEditTable(prev => {
      const newTable = prev.map(r => [...r]);
      if (activeDay >= 0 && activeDay < 7) {
        newTable[activeDay].splice(periodIdx, 1);
      }
      return newTable;
    });
  };

  const openMenu = (periodIdx) => {
    setMenuVisible({ [periodIdx]: true });
  };
  const closeMenu = (periodIdx) => {
    setMenuVisible({ [periodIdx]: false });
  };

  const handleSave = () => {
    setTimetable(editTable.map(row => [...row]));
    goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={goBack} />
        <Appbar.Content title="Customize Timetable" />
        <Button mode="contained" onPress={handleSave} style={{ marginRight: 8, backgroundColor: '#009688' }}>Save</Button>
      </Appbar.Header>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.tabRow}>
          {days.map((day, idx) => (
            <Button
              key={day}
              mode={activeDay === idx ? 'contained' : 'text'}
              onPress={() => setActiveDay(idx)}
              style={activeDay === idx ? styles.activeTab : null}
              labelStyle={{ color: activeDay === idx ? 'white' : '#009688', fontWeight: 'bold', minWidth: 80 }}
            >
              {day}
            </Button>
          ))}
        </View>
      </ScrollView>
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.periodList}>
          {Array.isArray(editTable[activeDay]) && editTable[activeDay].map((subject, periodIdx) => (
            <View key={periodIdx} style={styles.periodRow}>
              <Menu
                visible={!!menuVisible[periodIdx]}
                onDismiss={() => closeMenu(periodIdx)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => openMenu(periodIdx)}
                    style={styles.menuButton}
                    labelStyle={{ fontSize: 15, color: subject ? '#009688' : '#aaa' }}
                  >
                    {subject || 'Free'}
                  </Button>
                }
              >
                {subjectNames.map((subj, i) => (
                  <Menu.Item
                    key={i}
                    onPress={() => {
                      handleCellChange(periodIdx, subj);
                      closeMenu(periodIdx);
                    }}
                    title={subj}
                  />
                ))}
                <Menu.Item
                  key="free"
                  onPress={() => {
                    handleCellChange(periodIdx, '');
                    closeMenu(periodIdx);
                  }}
                  title="Free"
                />
              </Menu>
              <IconButton
                icon="delete"
                onPress={() => handleRemovePeriod(periodIdx)}
                accessibilityLabel="Remove period"
                tooltip="Remove period"
              />
              <IconButton icon="delete" onPress={() => handleRemovePeriod(periodIdx)} />
            </View>
          ))}
          <Button mode="outlined" onPress={handleAddPeriod} style={styles.addPeriodBtn} icon="plus">
            Add Period
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabScroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    paddingVertical: 4,
  },
  activeTab: {
    backgroundColor: '#009688',
    borderRadius: 8,
  },
  periodList: {
    padding: 16,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#009688',
    borderRadius: 4,
  },
  addPeriodBtn: {
    marginTop: 12,
    alignSelf: 'center',
    borderColor: '#009688',
  },
});