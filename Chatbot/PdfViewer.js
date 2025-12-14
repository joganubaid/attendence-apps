import React, { useEffect, useState, useRef } from "react";
import { useNavigation } from '@react-navigation/native';

import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Text,
  Animated,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const { width, height } = Dimensions.get('window');

export default function PdfViewer({ route, darkMode }) {
  const navigation = useNavigation();

  const { url: pdfUrl } = route.params;
  const googleUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`;
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!status?.granted) requestPermission();
  }, []);

  const hideControls = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowControls(false));
  };

  const showControlsTemporary = () => {
    setShowControls(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setTimeout(hideControls, 3000);
  };

  const downloadPDF = async () => {
    try {
      if (!status?.granted) {
        const permission = await requestPermission();
        if (!permission.granted) {
          Alert.alert("Permission Required", "Please grant permission to save files.");
          return;
        }
      }

      setDownloading(true);
      const filename = pdfUrl.split("/").pop() || "file.pdf";
      const downloadPath = `${FileSystem.documentDirectory}${filename}`;

      const downloadResumable = FileSystem.createDownloadResumable(
        pdfUrl,
        downloadPath,
        {},
        ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
          const progressValue = totalBytesWritten / totalBytesExpectedToWrite;
          setProgress(Math.round(progressValue * 100));
          Animated.timing(progressAnim, {
            toValue: progressValue,
            duration: 100,
            useNativeDriver: false,
          }).start();
        }
      );

      const { uri } = await downloadResumable.downloadAsync();
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(uri);
      } else {
        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync("StudyBot Downloads", asset, false);
      }

      Alert.alert("✅ Downloaded", `${filename} saved to your device.`);
    } catch (err) {
      Alert.alert("❌ Failed", "Something went wrong downloading the PDF.");
      console.error(err);
    } finally {
      setDownloading(false);
      setProgress(0);
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? "#181818" : "#fff" }]}>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={darkMode ? "#23272f" : "#fff"}
      />

      {/* Header */}
      {showControls && (
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color={darkMode ? '#80cbc4' : '#009688'} />
          </TouchableOpacity>

          <TouchableOpacity onPress={downloadPDF} style={styles.headerButton}>
            <Ionicons name={downloading ? "hourglass" : "download-outline"} size={24} color={darkMode ? '#80cbc4' : '#009688'} />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* WebView */}
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={showControlsTemporary}>
        {error ? (
          <View style={styles.center}>
            <Text style={styles.error}>Failed to load PDF.</Text>
          </View>
        ) : (
          <WebView
            source={{ uri: googleUrl }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => setError(true)}
            style={{ flex: 1 }}
            javaScriptEnabled
            domStorageEnabled
          />
        )}
      </TouchableOpacity>

      {/* Loading & Progress */}
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#009688" />
          <Text style={{ marginTop: 10, color: darkMode ? "#aaa" : "#666" }}>Loading PDF...</Text>
        </View>
      )}

      {downloading && (
        <View style={styles.progress}>
          <Animated.View
            style={[styles.progressFill, {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              })
            }]}
          />
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff'
  },
  headerButton: { padding: 8 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    color: "#333"
  },
  center: {
    position: 'absolute',
    top: height / 3,
    left: 0,
    right: 0,
    alignItems: "center"
  },
  error: {
    fontSize: 16,
    color: "red"
  },
  progress: {
    height: 4,
    width: "100%",
    backgroundColor: "#eee",
    position: "absolute",
    bottom: 0,
    left: 0
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#009688"
  },
  progressText: {
    textAlign: "center",
    color: "#009688",
    fontSize: 12,
    marginTop: 4
  }
});