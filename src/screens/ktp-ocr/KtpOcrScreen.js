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
  Dimensions,
} from 'react-native';
import { takePhotoWithBase64 } from '../../utils/imageUtils';
import ImagePreviewModal from '../../components/ImagePreviewModal';
import CameraScreen from './components/CameraScreen';
import { processKtpImage } from '../../utils/imageCropUtils';
import RNFS from 'react-native-fs';
import { loadSettings } from '../../utils/settingsUtils';
import CroppedImageView from '../../components/CroppedImageView';

const KtpOcrScreen = ({ navigation }) => {
  const [imageData, setImageData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [infoData, setInfoData] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [originalImageUri, setOriginalImageUri] = useState(null);
  const [cropParams, setCropParams] = useState(null);

  const handleTakePhoto = async () => {
    setShowCamera(true);
  };

  const handleCameraCapture = async (image) => {
    try {
      console.log('handleCameraCapture - received image:', JSON.stringify(image, null, 2));

      if (!image || !image.uri) {
        console.error('Invalid image data:', image);
        throw new Error('Image URI kosong');
      }

      setShowCamera(false);
      setIsLoading(true);

      console.log('Processing image URI:', image.uri);

      // Get image dimensions
      const imageSize = await new Promise((resolve, reject) => {
        Image.getSize(image.uri, (width, height) => {
          resolve({ width, height });
        }, reject);
      });

      console.log('Original image size:', imageSize);

      // Calculate crop parameters
      const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
      const KTP_MASK_WIDTH = SCREEN_WIDTH * 0.9;
      const KTP_MASK_HEIGHT = KTP_MASK_WIDTH * 0.63;
      const MASK_LEFT = (SCREEN_WIDTH - KTP_MASK_WIDTH) / 2;
      const MASK_TOP = (SCREEN_HEIGHT - KTP_MASK_HEIGHT) / 2;

      const scaleX = imageSize.width / SCREEN_WIDTH;
      const scaleY = imageSize.height / SCREEN_HEIGHT;

      const cropX = Math.max(0, Math.floor(MASK_LEFT * scaleX));
      const cropY = Math.max(0, Math.floor(MASK_TOP * scaleY));
      const cropWidth = Math.floor(KTP_MASK_WIDTH * scaleX);
      const cropHeight = Math.floor(KTP_MASK_HEIGHT * scaleY);

      console.log('Crop params calculated:', { cropX, cropY, cropWidth, cropHeight });

      // Set crop params and show cropper
      setOriginalImageUri(image.uri);
      setCropParams({
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        imageWidth: imageSize.width,
        imageHeight: imageSize.height
      });
      setShowCropper(true);
      setIsLoading(false);
    } catch (error) {
      console.log('Camera capture error:', error);
      Alert.alert('Error', `Gagal memproses foto: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleCroppedImageCapture = async (croppedUri) => {
    console.log('handleCroppedImageCapture called with URI:', croppedUri);

    if (croppedUri) {
      try {
        setShowCropper(false);
        setIsLoading(true);

        // Process the cropped image (resize for OCR)
        const { processKtpImage } = require('../../utils/imageCropUtils');
        const processedUri = await processKtpImage(croppedUri);

        console.log('Processed cropped URI:', processedUri);

        // convert ke base64 untuk OCR
        const base64 = await RNFS.readFile(processedUri, 'base64');

        console.log('Base64 length:', base64.length);

        setImageData({
          uri: processedUri,
          base64: base64,
          compressionInfo: null,
        });
      } catch (error) {
        console.error('Error processing cropped image:', error);
        Alert.alert('Error', 'Gagal memproses gambar yang di-crop');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCameraCancel = () => {
    setShowCamera(false);
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
          subject: 'extract_ktp_structured',
          base64_image: imageData.base64,
        },
      },
    });
  };

  const handleRetakePhoto = () => {
    setImageData(null);
  };

  const handleImagePress = () => {
    // prepare info data sebelum buka modal
    if (imageData && imageData.uri) {
      const getImageInfo = async () => {
        try {
          // get image size
          const imageSize = await new Promise((resolve, reject) => {
            Image.getSize(imageData.uri, (width, height) => {
              resolve({ width, height });
            }, reject);
          });

          // get file size menggunakan RNFS
          const fileInfo = await RNFS.stat(imageData.uri);
          const fileSizeInMB = (fileInfo.size / 1024 / 1024).toFixed(2);

          setInfoData({
            title: 'Informasi KTP',
            width: imageSize.width,
            height: imageSize.height,
            fileSize: fileSizeInMB,
            hasWatermark: false,
          });
          setPreviewModalVisible(true);
        } catch (error) {
          console.error('Error getting image info:', error);
          setPreviewModalVisible(true);
        }
      };

      getImageInfo();
    } else {
      setPreviewModalVisible(true);
    }
  };

  const handleClosePreview = () => {
    setPreviewModalVisible(false);
  };

  if (showCamera) {
    return (
      <CameraScreen
        onTakePhoto={handleCameraCapture}
        onCancel={handleCameraCancel}
      />
    );
  }

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
        infoData={infoData}
      />

      {/* Cropped Image View - Invisible ViewShot Component */}
      {showCropper && originalImageUri && cropParams && (
        <CroppedImageView
          imageUri={originalImageUri}
          cropParams={cropParams}
          onCapture={handleCroppedImageCapture}
        />
      )}
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