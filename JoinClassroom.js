import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Dimensions } from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  Surface,
  IconButton,
  Portal,
  Modal,
  ActivityIndicator,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function JoinClassroom({ darkMode }) {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const styles = getStyles(darkMode);

  useEffect(() => {
    // For now, we'll simulate camera permission
    setHasPermission(true);
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setShowScanner(false);

    try {
      const inviteData = JSON.parse(data);
      if (inviteData.classId && inviteData.inviteToken) {
        joinClassroomWithInvite(inviteData);
      } else {
        Alert.alert('Invalid QR Code', 'This QR code is not a valid classroom invite.');
      }
    } catch (error) {
      // Try to parse as simple invite code
      joinClassroomWithInvite({ inviteCode: data });
    }
  };

  const joinClassroomWithInvite = async (inviteData) => {
    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate successful join
      Alert.alert(
        'Success!',
        'You have successfully joined the classroom.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error joining classroom:', error);
      Alert.alert('Error', 'Failed to join classroom. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteCodeSubmit = () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }
    joinClassroomWithInvite({ inviteCode: inviteCode.trim() });
  };

  const handlePasteFromClipboard = async () => {
    // For now, we'll simulate clipboard functionality
    Alert.alert('Info', 'Clipboard functionality would be implemented here');
  };

  const handleDeepLink = (url) => {
    // Handle deep link format: myapp://join?code=ABC123
    const code = url.split('code=')[1];
    if (code) {
      setInviteCode(code);
      joinClassroomWithInvite({ inviteCode: code });
    }
  };

  const renderScanner = () => {
    if (hasPermission === null) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#009688" />
          <Text style={[styles.scannerText, { color: darkMode ? '#fff' : '#000' }]}>
            Requesting camera permission...
          </Text>
        </View>
      );
    }

    if (hasPermission === false) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="camera-off" size={64} color="#FF6B6B" />
          <Text style={[styles.scannerText, { color: darkMode ? '#fff' : '#000' }]}>
            Camera access is required to scan QR codes
          </Text>
          <Button
            mode="contained"
            onPress={() => setShowScanner(false)}
            style={{ marginTop: 16 }}
          >
            Go Back
          </Button>
        </View>
      );
    }

    return (
      <View style={styles.scannerContainer}>
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerFrame} />
          <Text style={styles.scannerInstruction}>
            QR Scanner would be implemented here
          </Text>
          <Text style={styles.scannerInstruction}>
            (Camera permissions required)
          </Text>
        </View>
        <View style={styles.scannerControls}>
          <IconButton
            icon="close"
            size={30}
            iconColor="#fff"
            style={styles.scannerButton}
            onPress={() => setShowScanner(false)}
            accessibilityLabel="Close scanner"
            tooltip="Close"
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-back"
          size={24}
          iconColor={darkMode ? '#fff' : '#000'}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          tooltip="Go back"
        />
        <Text style={[styles.headerTitle, { color: darkMode ? '#fff' : '#000' }]}>
          Join Classroom
        </Text>
      </View>

      <View style={styles.content}>
        {/* QR Code Scanner Option */}
        <Card style={[styles.optionCard, { backgroundColor: darkMode ? '#23272f' : '#fff' }]}>
          <Card.Content>
            <View style={styles.optionHeader}>
              <Ionicons name="qr-code" size={32} color="#4ECDC4" />
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: darkMode ? '#fff' : '#000' }]}>
                  Scan QR Code
                </Text>
                <Text style={[styles.optionDescription, { color: darkMode ? '#aaa' : '#666' }]}>
                  Scan a classroom QR code to join instantly
                </Text>
              </View>
            </View>
            <Button
              mode="contained"
              onPress={() => setShowScanner(true)}
              style={styles.scanButton}
              icon="camera"
            >
              Scan QR Code
            </Button>
          </Card.Content>
        </Card>

        {/* Invite Code Option */}
        <Card style={[styles.optionCard, { backgroundColor: darkMode ? '#23272f' : '#fff' }]}>
          <Card.Content>
            <View style={styles.optionHeader}>
              <Ionicons name="key" size={32} color="#FF6B6B" />
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: darkMode ? '#fff' : '#000' }]}>
                  Enter Invite Code
                </Text>
                <Text style={[styles.optionDescription, { color: darkMode ? '#aaa' : '#666' }]}>
                  Use a classroom invite code or link
                </Text>
              </View>
            </View>
            <View style={styles.inviteInputContainer}>
              <TextInput
                label="Invite Code"
                value={inviteCode}
                onChangeText={setInviteCode}
                mode="outlined"
                style={styles.inviteInput}
                placeholder="Enter invite code..."
                right={
                  <TextInput.Icon
                    icon="content-paste"
                    onPress={handlePasteFromClipboard}
                      accessibilityLabel="Paste from clipboard"
                  />
                }
              />
              <Button
                mode="contained"
                onPress={handleInviteCodeSubmit}
                disabled={loading || !inviteCode.trim()}
                style={styles.joinButton}
                loading={loading}
              >
                Join Classroom
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Help Section */}
        <Card style={[styles.helpCard, { backgroundColor: darkMode ? '#23272f' : '#fff' }]}>
          <Card.Content>
            <Text style={[styles.helpTitle, { color: darkMode ? '#fff' : '#000' }]}>
              How to join a classroom?
            </Text>
            <View style={styles.helpSteps}>
              <View style={styles.helpStep}>
                <Ionicons name="qr-code" size={20} color="#4ECDC4" />
                <Text style={[styles.helpText, { color: darkMode ? '#aaa' : '#666' }]}>
                  Ask your teacher for a QR code or invite link
                </Text>
              </View>
              <View style={styles.helpStep}>
                <Ionicons name="scan" size={20} color="#FF6B6B" />
                <Text style={[styles.helpText, { color: darkMode ? '#aaa' : '#666' }]}>
                  Scan the QR code or enter the invite code
                </Text>
              </View>
              <View style={styles.helpStep}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={[styles.helpText, { color: darkMode ? '#aaa' : '#666' }]}>
                  Wait for approval if required by the classroom
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* QR Scanner Modal */}
      <Portal>
        <Modal
          visible={showScanner}
          onDismiss={() => setShowScanner(false)}
          contentContainerStyle={styles.scannerModal}
        >
          {renderScanner()}
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? '#333' : '#E0E0E0',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginLeft: 8,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    optionCard: {
      borderRadius: 16,
      marginBottom: 16,
      elevation: 2,
    },
    optionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    optionText: {
      flex: 1,
      marginLeft: 16,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    optionDescription: {
      fontSize: 14,
    },
    scanButton: {
      backgroundColor: '#4ECDC4',
    },
    inviteInputContainer: {
      gap: 12,
    },
    inviteInput: {
      backgroundColor: 'transparent',
    },
    joinButton: {
      backgroundColor: '#FF6B6B',
    },
    helpCard: {
      borderRadius: 16,
      elevation: 2,
    },
    helpTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
    },
    helpSteps: {
      gap: 12,
    },
    helpStep: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    helpText: {
      flex: 1,
      fontSize: 14,
    },
    scannerModal: {
      flex: 1,
      backgroundColor: '#000',
    },
    scannerContainer: {
      flex: 1,
      position: 'relative',
    },
    scannerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scannerFrame: {
      width: 250,
      height: 250,
      borderWidth: 2,
      borderColor: '#4ECDC4',
      borderRadius: 12,
      backgroundColor: 'transparent',
    },
    scannerInstruction: {
      color: '#fff',
      fontSize: 16,
      marginTop: 20,
      textAlign: 'center',
      paddingHorizontal: 32,
    },
    scannerControls: {
      position: 'absolute',
      top: 50,
      left: 20,
      right: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    scannerButton: {
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    scanAgainButton: {
      backgroundColor: '#4ECDC4',
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    scannerText: {
      fontSize: 16,
      textAlign: 'center',
      marginTop: 16,
    },
  });
}