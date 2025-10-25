import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { CONFIG } from '../../config/appConfig';

const ResultScreen = ({ route, navigation }) => {
  const { type, data } = route.params || {};
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (data) {
      processApiCall();
    }
  }, [data]);

  const processApiCall = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // simulasi API call - ganti dengan URL API yang sebenarnya
      const response = await fetch(CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setResult(result);
    } catch (err) {
      setError(err.message);
      // untuk demo, tampilkan data yang dikirim sebagai hasil
      setResult({
        message: 'API call failed, showing payload data:',
        payload: data,
        error: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    processApiCall();
  };

  const handleBackToHome = () => {
    navigation.navigate('Home');
  };

  const handleCopyJson = () => {
    if (result) {
      const jsonString = formatJson(result);
      Clipboard.setString(jsonString);
      Alert.alert('Berhasil', 'JSON berhasil di-copy ke clipboard');
    }
  };

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  const getTitle = () => {
    switch (type) {
      case 'ktp_ocr':
        return 'Hasil KTP OCR';
      case 'receipt_approver':
        return 'Hasil Receipt Approver';
      default:
        return 'Hasil';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'ktp_ocr':
        return 'Data teks yang diekstrak dari KTP';
      case 'receipt_approver':
        return 'Hasil perbandingan receipt customer dengan specimen';
      default:
        return 'Hasil pemrosesan';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{getTitle()}</Text>
        <Text style={styles.subtitle}>{getDescription()}</Text>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Memproses data...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Error</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        )}

        {result && !isLoading && (
          <ScrollView style={styles.resultContainer}>
            <View style={styles.jsonContainer}>
              <View style={styles.jsonHeader}>
                <Text style={styles.jsonTitle}>Response JSON:</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={handleCopyJson}
                >
                  <Text style={styles.copyButtonText}>📋 Copy</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text style={styles.jsonText}>{formatJson(result)}</Text>
              </ScrollView>
            </View>
          </ScrollView>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToHome}
          >
            <Text style={styles.backButtonText}>Kembali ke Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
    marginBottom: 20,
  },
  jsonContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  jsonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jsonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  copyButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  copyButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  jsonText: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  buttonContainer: {
    paddingTop: 20,
  },
  backButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ResultScreen;