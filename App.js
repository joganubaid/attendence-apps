import React, { useState, useCallback, memo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import Dashboard from './Dashboard';
import Today from './Today';
import Timetable from './Timetable';
import Calendar from './Calendar';
import Settings from './Settings';
import Chatbot from './Chatbot/Chatbot';
import PdfViewer from './Chatbot/PdfViewer';
import ChatbotSettings from './Chatbot/ChatbotSettings';
import Classroom from './Classroom';
import JoinClassroom from './JoinClassroom';
import ClassroomDetail from './ClassroomDetail';
import ClassBot from './ClassBot';

const initialSubjects = [
  { name: 'Mathematics' },
  { name: 'Physics' },
  { name: 'Engineering Mechanics'},
  { name: 'Basic Electrical Engineering' },
  { name: 'Chemistry' },
  { name: 'Environmental Studies' },
];

const initialTimetable = Array(7).fill().map(() => []);
const initialAttendance = {};

const SubjectsScreen = memo(function SubjectsScreen({ subjects, attendance, addSubject, deleteSubject, darkMode }) {
  return <Dashboard subjects={subjects} attendance={attendance} addSubject={addSubject} deleteSubject={deleteSubject} darkMode={darkMode} />;
});

const TodayScreen = memo(function TodayScreen({ subjects, timetable, attendance, markAttendance, darkMode }) {
  return <Today subjects={subjects} timetable={timetable} attendance={attendance} markAttendance={markAttendance} darkMode={darkMode} />;
});

const TimetableScreen = memo(function TimetableScreen({ subjects, timetable, setTimetable, darkMode }) {
  return <Timetable subjects={subjects} timetable={timetable} setTimetable={setTimetable} darkMode={darkMode} />;
});

const CalendarScreen = memo(function CalendarScreen({ subjects, timetable, attendance, markAttendance, darkMode }) {
  return <Calendar subjects={subjects} timetable={timetable} attendance={attendance} markAttendance={markAttendance} darkMode={darkMode} />;
});

// ✅ Stack navigator for Chatbot and PdfViewer
const ChatbotStackNav = createNativeStackNavigator();

// ✅ Stack navigator for Classroom features
const ClassroomStackNav = createNativeStackNavigator();

// Chatbot Stack Navigator
function ChatbotStack({ darkMode }) {
  return (
    <ChatbotStackNav.Navigator>
      <ChatbotStackNav.Screen name="ChatbotHome">
        {() => <Chatbot darkMode={darkMode} />}
      </ChatbotStackNav.Screen>
      <ChatbotStackNav.Screen name="PdfViewer">
        {({ route }) => <PdfViewer route={route} darkMode={darkMode} />}
      </ChatbotStackNav.Screen>
    </ChatbotStackNav.Navigator>
  );
}

// Classroom Stack Navigator
function ClassroomStack({ darkMode }) {
  return (
    <ClassroomStackNav.Navigator>
      <ClassroomStackNav.Screen name="ClassroomHome">
        {() => <Classroom darkMode={darkMode} />}
      </ClassroomStackNav.Screen>
      <ClassroomStackNav.Screen name="JoinClassroom">
        {() => <JoinClassroom darkMode={darkMode} />}
      </ClassroomStackNav.Screen>
      <ClassroomStackNav.Screen name="ClassroomDetail">
        {({ route }) => <ClassroomDetail darkMode={darkMode} route={route} />}
      </ClassroomStackNav.Screen>
      <ClassroomStackNav.Screen name="ClassBot">
        {({ route }) => <ClassBot darkMode={darkMode} route={route} />}
      </ClassroomStackNav.Screen>
      <ClassroomStackNav.Screen name="ChatbotSettings">
        {({ route }) => <ChatbotSettings darkMode={darkMode} route={route} />}
      </ClassroomStackNav.Screen>
      <ClassroomStackNav.Screen name="PdfViewer">
        {({ route }) => <PdfViewer route={route} darkMode={darkMode} />}
      </ClassroomStackNav.Screen>
    </ClassroomStackNav.Navigator>
  );
}

export default function App() {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [timetable, setTimetable] = useState(initialTimetable);
  const [attendance, setAttendance] = useState(initialAttendance);
  const [darkMode, setDarkMode] = useState(false);

  const addSubject = useCallback((subjectName) => {
    setSubjects(prev => [...prev, { name: subjectName }]); // ✅ FIXED
  }, []);

  const deleteSubject = useCallback((subjectName) => {
    setSubjects(prev => prev.filter(sub => sub.name !== subjectName));
    setAttendance(prev => {
      const updated = { ...prev };
      for (const date in updated) {
        delete updated[date][subjectName];
      }
      return updated;
    });
  }, []);

  const markAttendance = useCallback((date, subjectName, status) => {
    setAttendance(prev => {
      const day = prev[date] ? { ...prev[date] } : {};
      day[subjectName] = status;
      return { ...prev, [date]: day };
    });
  }, []);

  const handleToggleDarkMode = useCallback(() => setDarkMode(dm => !dm), []);

  const Tab = createBottomTabNavigator();

  return (
    <PaperProvider>
      <SafeAreaProvider>
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false, // ✅ hides header for ALL tabs
            tabBarIcon: ({ color, size }) => {
              let iconName;
              if (route.name === 'Subjects') iconName = 'book';
              else if (route.name === 'Today') iconName = 'calendar';
              else if (route.name === 'Timetable') iconName = 'grid';
              else if (route.name === 'Calendar') iconName = 'calendar-outline';
              else if (route.name === 'Settings') iconName = 'settings';
              else if (route.name === 'Chatbot') iconName = 'chatbubble-ellipses';
              else if (route.name === 'Classroom') iconName = 'school';
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#009688',
            tabBarInactiveTintColor: 'gray',
          })}
        >
          <Tab.Screen name="Subjects">
            {() => <SubjectsScreen subjects={subjects} attendance={attendance} addSubject={addSubject} deleteSubject={deleteSubject}  darkMode={darkMode} />}
          </Tab.Screen>
          <Tab.Screen name="Today">
            {() => <TodayScreen subjects={subjects} timetable={timetable} attendance={attendance} markAttendance={markAttendance} darkMode={darkMode} />}
          </Tab.Screen>
          <Tab.Screen name="Timetable">
            {() => <TimetableScreen subjects={subjects} timetable={timetable} setTimetable={setTimetable} darkMode={darkMode} />}
          </Tab.Screen>
          <Tab.Screen name="Calendar">
            {() => <CalendarScreen subjects={subjects} timetable={timetable} attendance={attendance} markAttendance={markAttendance} darkMode={darkMode} />}
          </Tab.Screen>
          <Tab.Screen name="Settings">
            {() => <Settings darkMode={darkMode} onToggleDarkMode={handleToggleDarkMode} />}
          </Tab.Screen>
          <Tab.Screen name="Chatbot">
            {() => <ChatbotStack darkMode={darkMode} />}
          </Tab.Screen>
          <Tab.Screen name="Classroom">
            {() => <ClassroomStack darkMode={darkMode} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
      </SafeAreaView>
  </SafeAreaProvider>
    </PaperProvider>
  );
}
