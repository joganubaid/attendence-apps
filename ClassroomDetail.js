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
  List,
  Menu,
  Badge,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import QRCodeGenerator from './QRCodeGenerator';

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

const MATERIAL_TYPES = {
  PDF: 'pdf',
  PPT: 'ppt',
  IMAGE: 'image',
  DOC: 'doc',
  LINK: 'link',
  GITHUB: 'github',
};

const MATERIAL_ICONS = {
  [MATERIAL_TYPES.PDF]: 'file-pdf-box',
  [MATERIAL_TYPES.PPT]: 'file-powerpoint-box',
  [MATERIAL_TYPES.IMAGE]: 'file-image-box',
  [MATERIAL_TYPES.DOC]: 'file-document-box',
  [MATERIAL_TYPES.LINK]: 'link',
  [MATERIAL_TYPES.GITHUB]: 'github',
};

function MaterialCard({ material, onPress, onPin, onDelete, userRole, darkMode }) {
  const styles = getStyles(darkMode);
  const canManage = [ROLES.OWNER, ROLES.TEACHER, ROLES.CR, ROLES.ADMIN].includes(userRole);

  return (
    <Card style={[styles.materialCard, { backgroundColor: darkMode ? '#23272f' : '#fff' }]} onPress={onPress}>
      <Card.Content>
        <View style={styles.materialHeader}>
          <View style={styles.materialInfo}>
            <Ionicons 
              name={MATERIAL_ICONS[material.type] || 'file'} 
              size={24} 
              color="#009688" 
            />
            <View style={styles.materialDetails}>
              <Text style={[styles.materialTitle, { color: darkMode ? '#fff' : '#000' }]}>
                {material.title}
              </Text>
              <Text style={[styles.materialMeta, { color: darkMode ? '#aaa' : '#666' }]}>
                {material.subject} • {material.uploader} • {material.uploadDate}
              </Text>
              <View style={styles.materialStats}>
                <Chip icon="file" style={styles.metaChip}>
                  {material.fileSize}
                </Chip>
                {material.version && (
                  <Chip icon="tag" style={styles.metaChip}>
                    v{material.version}
                  </Chip>
                )}
                {material.pinned && (
                  <Chip icon="pin" style={[styles.metaChip, { backgroundColor: '#FFD700' }]}>
                    Pinned
                  </Chip>
                )}
              </View>
            </View>
          </View>
          {canManage && (
            <Menu
              visible={false}
              onDismiss={() => {}}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  iconColor={darkMode ? '#aaa' : '#666'}
                />
              }
            >
              <Menu.Item
                onPress={() => onPin(material.id)}
                title={material.pinned ? 'Unpin' : 'Pin'}
                leadingIcon={material.pinned ? 'pin-off' : 'pin'}
              />
              <Menu.Item
                onPress={() => onDelete(material.id)}
                title="Delete"
                leadingIcon="delete"
              />
            </Menu>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}

export default function ClassroomDetail({ darkMode }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { classroom } = route.params;

  const [activeTab, setActiveTab] = useState('materials');
  const [materials, setMaterials] = useState([]);
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    subject: '',
    description: '',
    type: MATERIAL_TYPES.PDF,
  });

  const styles = getStyles(darkMode);

  useEffect(() => {
    loadClassroomData();
  }, []);

  const loadClassroomData = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockMaterials = [
        {
          id: '1',
          title: 'Introduction to Algorithms',
          subject: 'Computer Science',
          type: MATERIAL_TYPES.PDF,
          uploader: 'Dr. Smith',
          uploadDate: '2024-01-15',
          fileSize: '2.5 MB',
          version: '1.0',
          pinned: true,
          url: 'https://example.com/algorithms.pdf',
        },
        {
          id: '2',
          title: 'Data Structures Slides',
          subject: 'Computer Science',
          type: MATERIAL_TYPES.PPT,
          uploader: 'Prof. Johnson',
          uploadDate: '2024-01-10',
          fileSize: '5.1 MB',
          version: '2.1',
          pinned: false,
          url: 'https://example.com/datastructures.pptx',
        },
        {
          id: '3',
          title: 'GitHub Repository',
          subject: 'Programming',
          type: MATERIAL_TYPES.GITHUB,
          uploader: 'TA Mike',
          uploadDate: '2024-01-08',
          fileSize: 'Repository',
          version: null,
          pinned: false,
          url: 'https://github.com/example/cs101',
        },
      ];

      const mockMembers = [
        { id: '1', name: 'Dr. Smith', role: ROLES.TEACHER, avatar: null },
        { id: '2', name: 'Prof. Johnson', role: ROLES.TEACHER, avatar: null },
        { id: '3', name: 'TA Mike', role: ROLES.CR, avatar: null },
        { id: '4', name: 'Alice Student', role: ROLES.STUDENT, avatar: null },
        { id: '5', name: 'Bob Student', role: ROLES.STUDENT, avatar: null },
      ];

      setMaterials(mockMaterials);
      setMembers(mockMembers);
    } catch (error) {
      console.error('Error loading classroom data:', error);
      Alert.alert('Error', 'Failed to load classroom data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClassroomData();
    setRefreshing(false);
  };

  const handleUploadMaterial = async () => {
    if (!uploadData.title.trim() || !uploadData.subject.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      // Mock upload - replace with actual API call
      const newMaterial = {
        id: Date.now().toString(),
        title: uploadData.title,
        subject: uploadData.subject,
        type: uploadData.type,
        uploader: 'You',
        uploadDate: new Date().toISOString().split('T')[0],
        fileSize: '1.2 MB',
        version: '1.0',
        pinned: false,
        url: 'https://example.com/uploaded-file.pdf',
      };

      setMaterials(prev => [newMaterial, ...prev]);
      setShowUploadModal(false);
      setUploadData({ title: '', subject: '', description: '', type: MATERIAL_TYPES.PDF });
      
      Alert.alert('Success', 'Material uploaded successfully!');
    } catch (error) {
      console.error('Error uploading material:', error);
      Alert.alert('Error', 'Failed to upload material');
    }
  };

  const handleMaterialPress = async (material) => {
    try {
      if (material.type === MATERIAL_TYPES.GITHUB || material.type === MATERIAL_TYPES.LINK) {
        // Open in browser - would use Linking in full implementation
        Alert.alert('Info', `Would open: ${material.url}`);
      } else {
        // Download and open file
        Alert.alert('Info', `Would download: ${material.url}`);
      }
    } catch (error) {
      console.error('Error opening material:', error);
      Alert.alert('Error', 'Failed to open material');
    }
  };

  const handlePinMaterial = (materialId) => {
    setMaterials(prev => 
      prev.map(material => 
        material.id === materialId 
          ? { ...material, pinned: !material.pinned }
          : material
      )
    );
  };

  const handleDeleteMaterial = (materialId) => {
    Alert.alert(
      'Delete Material',
      'Are you sure you want to delete this material?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setMaterials(prev => prev.filter(material => material.id !== materialId));
          },
        },
      ]
    );
  };

  const handleInviteMembers = () => {
    setShowQRModal(true);
  };

  const handleCopyInviteLink = async () => {
    try {
      const inviteLink = `myapp://join?code=${classroom.id}`;
      Alert.alert('Success', 'Invite link copied to clipboard!');
    } catch (error) {
      console.error('Error copying invite link:', error);
      Alert.alert('Error', 'Failed to copy invite link');
    }
  };

  const filteredMaterials = materials.filter(material =>
    material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedMaterials = filteredMaterials.filter(material => material.pinned);
  const regularMaterials = filteredMaterials.filter(material => !material.pinned);

  const canManage = [ROLES.OWNER, ROLES.TEACHER, ROLES.CR, ROLES.ADMIN].includes(classroom.userRole);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-back"
          size={24}
          iconColor={darkMode ? '#fff' : '#000'}
          onPress={() => navigation.goBack()}
        />
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: darkMode ? '#fff' : '#000' }]}>
            {classroom.title}
          </Text>
          <Text style={[styles.headerSubtitle, { color: darkMode ? '#aaa' : '#666' }]}>
            {classroom.description}
          </Text>
        </View>
        <Chip 
          style={[styles.roleChip, { backgroundColor: ROLE_COLORS[classroom.userRole] }]}
          textStyle={{ color: '#fff', fontWeight: 'bold' }}
        >
          {ROLE_LABELS[classroom.userRole]}
        </Chip>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <Button
          mode={activeTab === 'materials' ? 'contained' : 'text'}
          onPress={() => setActiveTab('materials')}
          style={activeTab === 'materials' ? styles.activeTab : styles.inactiveTab}
        >
          Materials
        </Button>
        <Button
          mode={activeTab === 'members' ? 'contained' : 'text'}
          onPress={() => setActiveTab('members')}
          style={activeTab === 'members' ? styles.activeTab : styles.inactiveTab}
        >
          Members
        </Button>
        <Button
          mode={activeTab === 'bot' ? 'contained' : 'text'}
          onPress={() => setActiveTab('bot')}
          style={activeTab === 'bot' ? styles.activeTab : styles.inactiveTab}
        >
          Class Bot
        </Button>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'materials' && (
          <View>
            <Searchbar
              placeholder="Search materials..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={[styles.searchbar, { backgroundColor: darkMode ? '#23272f' : '#fff' }]}
              iconColor={darkMode ? '#aaa' : '#666'}
              inputStyle={{ color: darkMode ? '#fff' : '#000' }}
            />

            {pinnedMaterials.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: darkMode ? '#fff' : '#000' }]}>
                  📌 Pinned Materials
                </Text>
                {pinnedMaterials.map((material) => (
                  <MaterialCard
                    key={material.id}
                    material={material}
                    onPress={() => handleMaterialPress(material)}
                    onPin={handlePinMaterial}
                    onDelete={handleDeleteMaterial}
                    userRole={classroom.userRole}
                    darkMode={darkMode}
                  />
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: darkMode ? '#fff' : '#000' }]}>
                📚 All Materials
              </Text>
              {regularMaterials.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="folder-open" size={48} color={darkMode ? '#aaa' : '#ccc'} />
                  <Text style={[styles.emptyText, { color: darkMode ? '#aaa' : '#666' }]}>
                    No materials yet
                  </Text>
                </View>
              ) : (
                regularMaterials.map((material) => (
                  <MaterialCard
                    key={material.id}
                    material={material}
                    onPress={() => handleMaterialPress(material)}
                    onPin={handlePinMaterial}
                    onDelete={handleDeleteMaterial}
                    userRole={classroom.userRole}
                    darkMode={darkMode}
                  />
                ))
              )}
            </View>
          </View>
        )}

        {activeTab === 'members' && (
          <View>
            <View style={styles.membersHeader}>
              <Text style={[styles.membersTitle, { color: darkMode ? '#fff' : '#000' }]}>
                {members.length} Members
              </Text>
              {canManage && (
                <Button
                  mode="contained"
                  onPress={handleInviteMembers}
                  style={styles.inviteButton}
                >
                  Invite
                </Button>
              )}
            </View>
            {members.map((member) => (
              <Card key={member.id} style={[styles.memberCard, { backgroundColor: darkMode ? '#23272f' : '#fff' }]}>
                <Card.Content>
                  <View style={styles.memberInfo}>
                    <Avatar.Text 
                      size={40} 
                      label={member.name.split(' ').map(n => n[0]).join('')}
                      style={{ backgroundColor: ROLE_COLORS[member.role] }}
                    />
                    <View style={styles.memberDetails}>
                      <Text style={[styles.memberName, { color: darkMode ? '#fff' : '#000' }]}>
                        {member.name}
                      </Text>
                      <Chip 
                        style={[styles.memberRole, { backgroundColor: ROLE_COLORS[member.role] }]}
                        textStyle={{ color: '#fff', fontSize: 12 }}
                      >
                        {ROLE_LABELS[member.role]}
                      </Chip>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        {activeTab === 'bot' && (
          <View>
            <Card style={[styles.botCard, { backgroundColor: darkMode ? '#23272f' : '#fff' }]}>
              <Card.Content>
                <View style={styles.botHeader}>
                  <Ionicons name="chatbubble-ellipses" size={32} color="#4ECDC4" />
                  <Text style={[styles.botTitle, { color: darkMode ? '#fff' : '#000' }]}>
                    Class Bot
                  </Text>
                </View>
                <Text style={[styles.botDescription, { color: darkMode ? '#aaa' : '#666' }]}>
                  Get instant access to materials and announcements
                </Text>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('ClassBot', { classroom })}
                  style={styles.botButton}
                  icon="chat"
                >
                  Open Class Bot
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('ChatbotSettings', { classroom })}
                  style={[styles.botButton, { marginTop: 8 }]}
                  icon="cog"
                >
                  Chatbot Settings
                </Button>
              </Card.Content>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* FAB for upload */}
      {activeTab === 'materials' && canManage && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: '#009688' }]}
          onPress={() => setShowUploadModal(true)}
          color="#fff"
        />
      )}

      {/* Upload Modal */}
      <Portal>
        <Modal
          visible={showUploadModal}
          onDismiss={() => setShowUploadModal(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: darkMode ? '#23272f' : '#fff' }]}
        >
          <Text style={[styles.modalTitle, { color: darkMode ? '#fff' : '#000' }]}>
            Upload Material
          </Text>
          <TextInput
            label="Title"
            value={uploadData.title}
            onChangeText={(text) => setUploadData(prev => ({ ...prev, title: text }))}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Subject"
            value={uploadData.subject}
            onChangeText={(text) => setUploadData(prev => ({ ...prev, subject: text }))}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Description (Optional)"
            value={uploadData.description}
            onChangeText={(text) => setUploadData(prev => ({ ...prev, description: text }))}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />
          <View style={styles.modalButtons}>
            <Button mode="outlined" onPress={() => setShowUploadModal(false)} style={styles.modalButton}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleUploadMaterial} style={styles.modalButton}>
              Upload
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* QR Code Generator */}
      <QRCodeGenerator
        classroom={classroom}
        darkMode={darkMode}
        visible={showQRModal}
        onDismiss={() => setShowQRModal(false)}
      />
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
    headerContent: {
      flex: 1,
      marginLeft: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
    },
    headerSubtitle: {
      fontSize: 14,
      marginTop: 2,
    },
    roleChip: {
      minWidth: 60,
    },
    tabContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? '#333' : '#E0E0E0',
    },
    activeTab: {
      backgroundColor: '#009688',
      marginRight: 8,
    },
    inactiveTab: {
      marginRight: 8,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
    },
    searchbar: {
      marginVertical: 16,
      elevation: 2,
      borderRadius: 12,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
    },
    materialCard: {
      borderRadius: 12,
      marginBottom: 8,
      elevation: 2,
    },
    materialHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    materialInfo: {
      flexDirection: 'row',
      flex: 1,
    },
    materialDetails: {
      flex: 1,
      marginLeft: 12,
    },
    materialTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    materialMeta: {
      fontSize: 12,
      marginBottom: 8,
    },
    materialStats: {
      flexDirection: 'row',
      gap: 8,
    },
    metaChip: {
      height: 24,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: 16,
      marginTop: 12,
    },
    membersHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 16,
    },
    membersTitle: {
      fontSize: 18,
      fontWeight: '600',
    },
    inviteButton: {
      backgroundColor: '#4ECDC4',
    },
    memberCard: {
      borderRadius: 12,
      marginBottom: 8,
      elevation: 2,
    },
    memberInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    memberDetails: {
      flex: 1,
      marginLeft: 12,
    },
    memberName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    memberRole: {
      alignSelf: 'flex-start',
    },
    botCard: {
      borderRadius: 16,
      marginVertical: 16,
      elevation: 2,
    },
    botHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    botTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginLeft: 12,
    },
    botDescription: {
      fontSize: 14,
      marginBottom: 16,
    },
    botButton: {
      backgroundColor: '#4ECDC4',
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
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
    modalDescription: {
      fontSize: 14,
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
    copyButton: {
      backgroundColor: '#4ECDC4',
      marginBottom: 12,
    },
    closeButton: {
      borderColor: '#009688',
    },
  });
}