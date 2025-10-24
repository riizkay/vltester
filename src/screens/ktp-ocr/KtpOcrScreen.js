import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { takePhotoAndConvert } from '../../utils/imageUtils';
import ImagePreviewModal from '../../components/ImagePreviewModal';

const KtpOcrScreen = ({ navigation }) => {
  const [imageData, setImageData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);

  const handleTakePhoto = async () => {
    try {
      setIsLoading(true);
      const result = await takePhotoAndConvert();
      setImageData(result);
    } catch (error) {
      console.log('Take photo error:', error);
      Alert.alert('Error', `Gagal mengambil foto: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessOcr = () => {
    if (!imageData) {
      Alert.alert('Error', 'Silakan ambil foto KTP terlebih dahulu');
      return;
    }

    // navigasi ke result screen dengan data
    navigation.navigate('Result', {
      type: 'ktp_ocr',
      data: {
        input: {
          subject: 'ktp_ocr',
          image: imageData.base64,
        },
      },
    });
  };

  const handleRetakePhoto = () => {
    setImageData(null);
  };

  const handleImagePress = () => {
    setPreviewModalVisible(true);
  };

  const handleClosePreview = () => {
    setPreviewModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Scan KTP</Text>
        <Text style={styles.subtitle}>
          Ambil foto KTP untuk ekstrak data teks menggunakan OCR
        </Text>

        <View style={styles.imageContainer}>
          {imageData ? (
            <View style={styles.imagePreview}>
              <TouchableOpacity
                onPress={handleImagePress}
                style={styles.imageContainer}
              >
                <Image source={{ uri: imageData.uri }} style={styles.image} />
                <View style={styles.zoomOverlay}>
                  <Text style={styles.zoomIcon}>🔍</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={handleRetakePhoto}
              >
                <Text style={styles.retakeButtonText}>Ambil Ulang</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handleTakePhoto}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="large" color="#4F46E5" />
              ) : (
                <>
                  <Text style={styles.cameraIcon}>📷</Text>
                  <Text style={styles.cameraText}>Ambil Foto KTP</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {imageData && (
          <TouchableOpacity
            style={styles.processButton}
            onPress={handleProcessOcr}
          >
            <Text style={styles.processButtonText}>Proses OCR</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        visible={previewModalVisible}
        onClose={handleClosePreview}
        imageUri={imageData?.uri}
        title="Preview KTP"
      />
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
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#4F46E5',
    borderStyle: 'dashed',
    minWidth: 200,
  },
  cameraIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  cameraText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
  },
  imagePreview: {
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  zoomOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  zoomIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  retakeButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retakeButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  processButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  processButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default KtpOcrScreen;