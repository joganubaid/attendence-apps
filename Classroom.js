import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  Surface,
  Button,
  Modal,
  Portal,
  TextInput,
  FAB,
  IconButton,
  Chip,
  Avatar,
  Divider,
  Searchbar,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ROLES = {
  OWNER: 'owner',
  TEACHER: 'teacher',
  CR: 'cr',
  ADMIN: 'admin',
  STUDENT: 'student',
};

const ROLE_COLORS = {
  [ROLES.OWNER]: '#FF6B6B',
  [ROLES.TEACHER]: '#4ECDC4',
  [ROLES.CR]: '#45B7D1',
  [ROLES.ADMIN]: '#96CEB4',
  [ROLES.STUDENT]: '#FFEAA7',
};

const ROLE_LABELS = {
  [ROLES.OWNER]: 'Owner',
  [ROLES.TEACHER]: 'Teacher',
  [ROLES.CR]: 'CR',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.STUDENT]: 'Student',
};

function ClassroomCard({ classroom, onPress, darkMode }) {
  const styles = getStyles(darkMode);
  
  return (
    <Card style={[styles.classroomCard, { backgroundColor: darkMode ? '#23272f' : '#fff' }]} onPress={onPress}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.cardContent}>
            <Text style={[styles.classroomTitle, { color: darkMode ? '#fff' : '#000' }]}>
              {classroom.title}
            </Text>
            <Text style={[styles.classroomDescription, { color: darkMode ? '#aaa' : '#555' }]}>
              {classroom.description || 'No description'}
            </Text>
            <View style={styles.statsRow}>
              <Chip icon="account-group" style={styles.chip}>
                {classroom.memberCount} members
              </Chip>
              <Chip icon="book-open-variant" style={styles.chip}>
                {classroom.materialCount} materials
              </Chip>
            </View>
          </View>
          <View style={styles.roleContainer}>
            <Chip 
              style={[styles.roleChip, { backgroundColor: ROLE_COLORS[classroom.userRole] }]}
              textStyle={{ color: '#fff', fontWeight: 'bold' }}
            >
              {ROLE_LABELS[classroom.userRole]}
            </Chip>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

export default function Classroom({ darkMode }) {
  const navigation = useNavigation();
  const [classrooms, setClassrooms] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [classroomTitle, setClassroomTitle] = useState('');
  const [classroomDescription, setClassroomDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const styles = getStyles(darkMode);

  // Mock data for demonstration
  useEffect(() => {
    loadClassrooms();
  }, []);

  const loadClassrooms = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockClassrooms = [
        {
          id: '1',
          title: 'Computer Science 2024',
          description: 'Advanced programming and algorithms',
          userRole: ROLES.OWNER,
          memberCount: 45,
          materialCount: 23,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Mathematics Lab',
          description: 'Practical mathematics and problem solving',
          userRole: ROLES.TEACHER,
          memberCount: 32,
          materialCount: 15,
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Physics Study Group',
          description: 'Quantum mechanics and modern physics',
          userRole: ROLES.STUDENT,
          memberCount: 28,
          materialCount: 8,
          createdAt: new Date().toISOString(),
        },
      ];
      setClassrooms(mockClassrooms);
    } catch (error) {
      console.error('Error loading classrooms:', error);
      Alert.alert('Error', 'Failed to load classrooms');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClassrooms();
    setRefreshing(false);
  };

  const handleCreateClassroom = async () => {
    if (!classroomTitle.trim()) {
      Alert.alert('Error', 'Please enter a classroom title');
      return;
    }

    try {
      // Mock API call - replace with actual implementation
      const newClassroom = {
        id: Date.now().toString(),
        title: classroomTitle.trim(),
        description: classroomDescription.trim(),
        userRole: ROLES.OWNER,
        memberCount: 1,
        materialCount: 0,
        createdAt: new Date().toISOString(),
      };

      setClassrooms(prev => [newClassroom, ...prev]);
      setModalVisible(false);
      setClassroomTitle('');
      setClassroomDescription('');
      
      Alert.alert('Success', 'Classroom created successfully!');
    } catch (error) {
      console.error('Error creating classroom:', error);
      Alert.alert('Error', 'Failed to create classroom');
    }
  };

  const handleJoinClassroom = () => {
    navigation.navigate('JoinClassroom');
  };

  const handleClassroomPress = (classroom) => {
    navigation.navigate('ClassroomDetail', { classroom });
  };

  const filteredClassrooms = classrooms.filter(classroom =>
    classroom.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classroom.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search classrooms..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchbar, { backgroundColor: darkMode ? '#23272f' : '#fff' }]}
        iconColor={darkMode ? '#aaa' : '#666'}
        inputStyle={{ color: darkMode ? '#fff' : '#000' }}
      />

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredClassrooms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons 
              name="school-outline" 
              size={64} 
              color={darkMode ? '#aaa' : '#ccc'} 
            />
            <Text style={[styles.emptyText, { color: darkMode ? '#aaa' : '#666' }]}>
              {searchQuery ? 'No classrooms found' : 'No classrooms yet'}
            </Text>
            <Text style={[styles.emptySubtext, { color: darkMode ? '#888' : '#999' }]}>
              {searchQuery ? 'Try adjusting your search' : 'Create a classroom or join one to get started'}
            </Text>
          </View>
        ) : (
          filteredClassrooms.map((classroom) => (
            <ClassroomCard
              key={classroom.id}
              classroom={classroom}
              onPress={() => handleClassroomPress(classroom)}
              darkMode={darkMode}
            />
          ))
        )}
      </ScrollView>

      <View style={styles.fabContainer}>
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: '#009688' }]}
          onPress={() => setModalVisible(true)}
          color="#fff"
        />
        <FAB
          icon="qr-code"
          style={[styles.fab, styles.joinFab, { backgroundColor: '#4ECDC4' }]}
          onPress={handleJoinClassroom}
          color="#fff"
        />
      </View>

      <Portal>
        <Modal 
          visible={modalVisible} 
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: darkMode ? '#23272f' : '#fff' }]}
        >
          <Text style={[styles.modalTitle, { color: darkMode ? '#fff' : '#000' }]}>
            Create New Classroom
          </Text>
          <TextInput
            label="Classroom Title"
            value={classroomTitle}
            onChangeText={setClassroomTitle}
            mode="outlined"
            style={styles.input}
            theme={{ colors: { primary: '#009688' } }}
          />
          <TextInput
            label="Description (Optional)"
            value={classroomDescription}
            onChangeText={setClassroomDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            theme={{ colors: { primary: '#009688' } }}
          />
          <View style={styles.modalButtons}>
            <Button mode="outlined" onPress={() => setModalVisible(false)} style={styles.modalButton}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleCreateClassroom} style={styles.modalButton}>
              Create
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

function getStyles(darkMode) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? '#181818' : '#F5F5F5',
    },
    searchbar: {
      margin: 16,
      elevation: 2,
      borderRadius: 12,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 16,
    },
    classroomCard: {
      borderRadius: 16,
      marginBottom: 12,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    cardContent: {
      flex: 1,
    },
    classroomTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 4,
    },
    classroomDescription: {
      fontSize: 14,
      marginBottom: 8,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    chip: {
      marginRight: 8,
    },
    roleContainer: {
      marginLeft: 12,
    },
    roleChip: {
      minWidth: 60,
    },
    fabContainer: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      alignItems: 'center',
    },
    fab: {
      marginBottom: 12,
    },
    joinFab: {
      marginBottom: 0,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: 16,
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: 14,
      marginTop: 8,
      textAlign: 'center',
      paddingHorizontal: 32,
    },
    modal: {
      padding: 20,
      margin: 20,
      borderRadius: 12,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    input: {
      marginBottom: 12,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
      marginTop: 16,
    },
    modalButton: {
      minWidth: 80,
    },
  });
}