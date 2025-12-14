import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console or crash reporting service
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Error Info:', errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: Crashlytics.recordError(error);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      const { darkMode } = this.props;
      const styles = getStyles(darkMode);

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Ionicons
              name="alert-circle-outline"
              size={64}
              color={darkMode ? '#f44336' : '#d32f2f'}
            />

            <Text style={styles.title}>
              Oops! Something went wrong
            </Text>

            <Text style={styles.message}>
              The app encountered an unexpected error. Don't worry, your data is safe.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugTitle}>Debug Info:</Text>
                <Text style={styles.debugText}>
                  {this.state.error.toString()}
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={this.handleRetry}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>

              {this.props.onGoBack && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={this.props.onGoBack}
                >
                  <Ionicons name="arrow-back" size={20} color={darkMode ? '#80cbc4' : '#009688'} />
                  <Text style={styles.backText}>Go Back</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

function getStyles(darkMode) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? '#181818' : '#ffffff',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    content: {
      alignItems: 'center',
      maxWidth: 300,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#000000',
      marginTop: 16,
      marginBottom: 8,
      textAlign: 'center',
    },
    message: {
      fontSize: 16,
      color: darkMode ? '#cccccc' : '#666666',
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 24,
    },
    debugInfo: {
      backgroundColor: darkMode ? '#23272f' : '#f5f5f5',
      padding: 12,
      borderRadius: 8,
      marginBottom: 20,
      width: '100%',
    },
    debugTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#000000',
      marginBottom: 4,
    },
    debugText: {
      fontSize: 10,
      color: darkMode ? '#cccccc' : '#666666',
      fontFamily: 'monospace',
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    retryButton: {
      backgroundColor: '#009688',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 25,
      gap: 8,
    },
    retryText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    backButton: {
      borderWidth: 1,
      borderColor: darkMode ? '#80cbc4' : '#009688',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 25,
      gap: 8,
    },
    backText: {
      color: darkMode ? '#80cbc4' : '#009688',
      fontSize: 16,
      fontWeight: '600',
    },
  });
}

export default ErrorBoundary;
