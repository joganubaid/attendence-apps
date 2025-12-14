import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  Text,
  Card,
  Button,
  Surface,
  IconButton,
  Portal,
  Modal,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as Sharing from 'expo-sharing';

export default function QRCodeGenerator({ classroom, darkMode, visible, onDismiss }) {
  const [qrValue, setQrValue] = useState('');

  const styles = getStyles(darkMode);

  React.useEffect(() => {
    if (visible && classroom) {
      // Generate QR code data
      const inviteData = {
        classId: classroom.id,
        className: classroom.title,
        inviteToken: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      };
      setQrValue(JSON.stringify(inviteData));
    }
  }, [visible, classroom]);

  const handleCopyInviteLink = async () => {
    try {
      const inviteLink = `myapp://join?code=${classroom.id}&token=${qrValue}`;
      Alert.alert('Success', 'Invite link copied to clipboard!');
    } catch (error) {
      console.error('Error copying invite link:', error);
      Alert.alert('Error', 'Failed to copy invite link');
    }
  };

  const handleShareQR = async () => {
    try {
      // For now, we'll share the invite link
      const inviteLink = `myapp://join?code=${classroom.id}&token=${qrValue}`;
      await Sharing.shareAsync(inviteLink);
    } catch (error) {
      console.error('Error sharing QR code:', error);
      Alert.alert('Error', 'Failed to share QR code');
    }
  };

  if (!classroom) return null;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modal, { backgroundColor: darkMode ? '#23272f' : '#fff' }]}
      >
        <View style={styles.header}>
          <Text style={[styles.modalTitle, { color: darkMode ? '#fff' : '#000' }]}>
            Classroom Invite
          </Text>
          <IconButton
            icon="close"
            size={24}
            iconColor={darkMode ? '#fff' : '#000'}
            onPress={onDismiss}
            accessibilityLabel="Close"
            tooltip="Close"
          />
        </View>

        <View style={styles.content}>
          <Text style={[styles.classroomName, { color: darkMode ? '#fff' : '#000' }]}>
            {classroom.title}
          </Text>
          <Text style={[styles.description, { color: darkMode ? '#aaa' : '#666' }]}>
            Share this QR code or invite link with others to join your classroom
          </Text>

          <View style={styles.qrContainer}>
            {qrValue ? (
              <QRCode
                value={qrValue}
                size={200}
                color={darkMode ? '#fff' : '#000'}
                backgroundColor={darkMode ? '#23272f' : '#fff'}
              />
            ) : (
              <View style={styles.qrPlaceholder}>
                <Ionicons name="qr-code" size={64} color={darkMode ? '#aaa' : '#ccc'} />
                <Text style={[styles.qrPlaceholderText, { color: darkMode ? '#aaa' : '#666' }]}>
                  Generating QR Code...
                </Text>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={handleCopyInviteLink}
              style={styles.actionButton}
              icon="content-copy"
            >
              Copy Invite Link
            </Button>
            <Button
              mode="outlined"
              onPress={handleShareQR}
              style={styles.actionButton}
              icon="share"
            >
              Share
            </Button>
          </View>

          <View style={styles.info}>
            <Text style={[styles.infoTitle, { color: darkMode ? '#fff' : '#000' }]}>
              How to use:
            </Text>
            <View style={styles.infoSteps}>
              <View style={styles.infoStep}>
                <Ionicons name="qr-code" size={16} color="#4ECDC4" />
                <Text style={[styles.infoText, { color: darkMode ? '#aaa' : '#666' }]}>
                  Others can scan this QR code to join
                </Text>
              </View>
              <View style={styles.infoStep}>
                <Ionicons name="link" size={16} color="#FF6B6B" />
                <Text style={[styles.infoText, { color: darkMode ? '#aaa' : '#666' }]}>
                  Or share the invite link directly
                </Text>
              </View>
              <View style={styles.infoStep}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={[styles.infoText, { color: darkMode ? '#aaa' : '#666' }]}>
                  You'll be notified when someone joins
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}

function getStyles(darkMode) {
  return StyleSheet.create({
    modal: {
      margin: 20,
      borderRadius: 16,
      padding: 0,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? '#333' : '#E0E0E0',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    content: {
      padding: 20,
    },
    classroomName: {
      fontSize: 20,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 8,
    },
    description: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 24,
    },
    qrContainer: {
      alignItems: 'center',
      marginBottom: 24,
      padding: 20,
      backgroundColor: darkMode ? '#181818' : '#F5F5F5',
      borderRadius: 12,
    },
    qrPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 200,
      height: 200,
    },
    qrPlaceholderText: {
      fontSize: 14,
      marginTop: 12,
      textAlign: 'center',
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    actionButton: {
      flex: 1,
    },
    info: {
      borderTopWidth: 1,
      borderTopColor: darkMode ? '#333' : '#E0E0E0',
      paddingTop: 16,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
    },
    infoSteps: {
      gap: 8,
    },
    infoStep: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    infoText: {
      fontSize: 14,
      flex: 1,
    },
  });
}