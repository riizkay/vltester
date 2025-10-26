import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { takePhotoAndConvert, takePhotoWithWatermark, convertImageToBase64 } from '../../utils/imageUtils';
import {
  saveSpecimenReceipts,
  loadSpecimenReceipts,
  clearSpecimenReceipts,
  hasStoredSpecimens
} from '../../utils/storageUtils';
import SpecimenPreviewModal from './components/SpecimenPreviewModal';
import ImagePreviewModal from '../../components/ImagePreviewModal';
import ImageInfoModal from '../../components/ImageInfoModal';
import WatermarkImage from '../../components/WatermarkImage';
import SimpleCameraScreen from './components/SimpleCameraScreen';
import RNFS from 'react-native-fs';

const ReceiptApproverScreen = ({ navigation }) => {
  const [customerReceipt, setCustomerReceipt] = useState(null);
  const [specimenReceipts, setSpecimenReceipts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStorage, setIsLoadingStorage] = useState(true);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedSpecimen, setSelectedSpecimen] = useState(null);
  const [selectedSpecimenIndex, setSelectedSpecimenIndex] = useState(0);
  const [customerPreviewModalVisible, setCustomerPreviewModalVisible] = useState(false);
  const [randomId, setRandomId] = useState(null);
  const [showWatermark, setShowWatermark] = useState(false);
  const [watermarkImageUri, setWatermarkImageUri] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState('customer'); // 'customer' or 'specimen'
  const [infoData, setInfoData] = useState(null);

  // load specimen dari storage saat component mount
  useEffect(() => {
    const loadStoredSpecimens = async () => {
      try {
        const storedSpecimens = await loadSpecimenReceipts();
        if (storedSpecimens.length > 0) {
          setSpecimenReceipts(storedSpecimens);
          console.log(`Loaded ${storedSpecimens.length} specimen dari storage`);
        }
      } catch (error) {
        console.error('Error loading specimens:', error);
      } finally {
        setIsLoadingStorage(false);
      }
    };

    loadStoredSpecimens();
  }, []);

  // auto-save specimen ke storage setiap kali ada perubahan
  useEffect(() => {
    if (!isLoadingStorage && specimenReceipts.length > 0) {
      saveSpecimenReceipts(specimenReceipts);
    }
  }, [specimenReceipts, isLoadingStorage]);

  const handleTakeCustomerPhoto = async () => {
    setCameraType('customer');
    setShowCamera(true);
  };

  const handleTakeSpecimenPhoto = async () => {
    setCameraType('specimen');
    setShowCamera(true);
  };

  const handleCameraCapture = async (image) => {
    try {
      setShowCamera(false);
      setIsLoading(true);

      console.log('Camera captured for type:', cameraType);

      if (cameraType === 'customer') {
        // untuk customer receipt dengan watermark
        // generate random ID untuk watermark
        const generatedId = Math.random().toString(36).substring(2, 10).toUpperCase();
        setRandomId(generatedId);

        // set gambar original untuk di-watermark
        setWatermarkImageUri(image.uri);
        setShowWatermark(true);

        // simpan gambar original dulu sementara
        setCustomerReceipt({
          uri: image.uri,
          base64: null,
          hasWatermark: false,
        });
      } else {
        // untuk specimen receipt - langsung convert ke base64
        const base64 = await RNFS.readFile(image.uri, 'base64');
        setSpecimenReceipts(prev => [...prev, {
          uri: image.uri,
          base64: base64,
        }]);
      }
    } catch (error) {
      console.log('Camera capture error:', error);
      Alert.alert('Error', `Gagal memproses foto: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCameraCancel = () => {
    setShowCamera(false);
  };

  const handleRemoveSpecimen = (index) => {
    setSpecimenReceipts(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAllSpecimens = async () => {
    Alert.alert(
      'Konfirmasi',
      'Apakah Anda yakin ingin menghapus semua specimen yang tersimpan?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearSpecimenReceipts();
              setSpecimenReceipts([]);
            } catch (error) {
              console.error('Error clearing specimens:', error);
              Alert.alert('Error', 'Gagal menghapus specimen');
            }
          },
        },
      ]
    );
  };

  const handleSpecimenPress = (specimen, index) => {
    setSelectedSpecimen(specimen);
    setSelectedSpecimenIndex(index);
    setPreviewModalVisible(true);

    // set info data untuk specimen
    if (specimen.uri) {
      const getSpecimenInfo = async () => {
        try {
          // get image size
          const imageSize = await new Promise((resolve, reject) => {
            Image.getSize(specimen.uri, (width, height) => {
              resolve({ width, height });
            }, reject);
          });

          // get file size menggunakan RNFS
          const fileInfo = await RNFS.stat(specimen.uri);
          const fileSizeInMB = (fileInfo.size / 1024 / 1024).toFixed(2);

          setInfoData({
            title: `Informasi Specimen ${index + 1}`,
            width: imageSize.width,
            height: imageSize.height,
            fileSize: fileSizeInMB,
            hasWatermark: false,
          });
        } catch (error) {
          console.error('Error getting specimen info:', error);
        }
      };

      getSpecimenInfo();
    }
  };

  const handleClosePreview = () => {
    setPreviewModalVisible(false);
    setSelectedSpecimen(null);
    setSelectedSpecimenIndex(0);
  };

  const handleCustomerImagePress = () => {
    // prepare info data sebelum buka modal
    if (customerReceipt && customerReceipt.uri) {
      const getCustomerInfo = async () => {
        try {
          // get image size
          const imageSize = await new Promise((resolve, reject) => {
            Image.getSize(customerReceipt.uri, (width, height) => {
              resolve({ width, height });
            }, reject);
          });

          // get file size menggunakan RNFS
          const fileInfo = await RNFS.stat(customerReceipt.uri);
          const fileSizeInMB = (fileInfo.size / 1024 / 1024).toFixed(2);

          setInfoData({
            title: 'Informasi Receipt Customer',
            width: imageSize.width,
            height: imageSize.height,
            fileSize: fileSizeInMB,
            hasWatermark: customerReceipt.hasWatermark,
            randomId: randomId,
          });
          setCustomerPreviewModalVisible(true);
        } catch (error) {
          console.error('Error getting customer receipt info:', error);
          setCustomerPreviewModalVisible(true);
        }
      };

      getCustomerInfo();
    } else {
      setCustomerPreviewModalVisible(true);
    }
  };

  const handleCloseCustomerPreview = () => {
    setCustomerPreviewModalVisible(false);
  };

  const handleProcessApproval = () => {
    if (!customerReceipt) {
      Alert.alert('Error', 'Silakan ambil foto receipt customer terlebih dahulu');
      return;
    }

    if (specimenReceipts.length === 0) {
      Alert.alert('Error', 'Silakan tambahkan minimal 1 receipt specimen');
      return;
    }

    // navigasi ke result screen dengan data
    navigation.navigate('Result', {
      type: 'receipt_approver',
      data: {
        input: {
          subject: 'receipt_approver',
          receipt_ori: customerReceipt.base64,
          receipt_specimens: specimenReceipts.map(item => item.base64),
        },
      },
    });
  };

  const handleRetakeCustomerPhoto = () => {
    setCustomerReceipt(null);
    setRandomId(null);
    setShowWatermark(false);
    setWatermarkImageUri(null);
  };

  const handleWatermarkCapture = async (watermarkedUri) => {
    console.log('handleWatermarkCapture called with URI:', watermarkedUri);

    if (watermarkedUri) {
      console.log('Watermark captured successfully:', watermarkedUri);

      try {
        setIsLoading(true);

        // convert watermarked image ke base64
        const watermarkedBase64 = await RNFS.readFile(watermarkedUri, 'base64');
        console.log('Watermarked image converted to base64, length:', watermarkedBase64.length);

        setCustomerReceipt({
          uri: watermarkedUri,
          base64: watermarkedBase64,
          hasWatermark: true
        });

        console.log('Customer receipt updated with watermarked image');
      } catch (error) {
        console.error('Error converting watermarked image to base64:', error);

        // fallback: gunakan gambar original dan convert ke base64
        try {
          const originalBase64 = await RNFS.readFile(watermarkImageUri, 'base64');
          setCustomerReceipt({
            uri: watermarkImageUri,
            base64: originalBase64,
            hasWatermark: false
          });
          console.log('Fallback: using original image without watermark');
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          Alert.alert('Error', 'Gagal memproses gambar');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log('Watermark capture returned null or undefined, using original image');

      // fallback: gunakan gambar original tanpa watermark
      try {
        setIsLoading(true);
        const originalBase64 = await RNFS.readFile(watermarkImageUri, 'base64');
        setCustomerReceipt({
          uri: watermarkImageUri,
          base64: originalBase64,
          hasWatermark: false
        });
      } catch (error) {
        console.error('Error in fallback:', error);
        Alert.alert('Error', 'Gagal memproses gambar');
      } finally {
        setIsLoading(false);
      }
    }

    setShowWatermark(false);
  };

  if (showCamera) {
    return (
      <SimpleCameraScreen
        onTakePhoto={handleCameraCapture}
        onCancel={handleCameraCancel}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>



        {/* Customer Receipt Section */}
        <View style={styles.firstSection}>
          <Text style={styles.sectionTitle}>Receipt Customer</Text>
          <Text style={styles.sectionSubtitle}>
            Receipt yang akan di-approve
          </Text>

          <View style={styles.imageContainer}>
            {customerReceipt ? (
              <View style={styles.imagePreview}>
                <TouchableOpacity
                  onPress={handleCustomerImagePress}
                  style={styles.imageContainer}
                >
                  <Image source={{ uri: customerReceipt.uri }} style={styles.image} />
                  <View style={styles.zoomOverlay}>
                    <Text style={styles.zoomIcon}>🔍</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={handleRetakeCustomerPhoto}
                >
                  <Text style={styles.retakeButtonText}>Ambil Ulang</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={handleTakeCustomerPhoto}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="large" color="#4F46E5" />
                ) : (
                  <>
                    <Text style={styles.cameraIcon}>📷</Text>
                    <Text style={styles.cameraText}>Ambil Foto Receipt</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Specimen Receipts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Receipt Specimen</Text>
              <Text style={styles.sectionSubtitle}>
                Receipt untuk perbandingan ({specimenReceipts.length} item)
                {isLoadingStorage && ' - Loading...'}
                {!isLoadingStorage && specimenReceipts.length > 0 && ' - Tersimpan'}
              </Text>
            </View>
            <View style={styles.headerButtons}>
              {specimenReceipts.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearAllSpecimens}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleTakeSpecimenPhoto}
                disabled={isLoading}
              >
                <Text style={styles.addButtonText}>+ Tambah</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.specimenContainer}>
            {isLoadingStorage ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4F46E5" />
                <Text style={styles.loadingText}>Loading specimen...</Text>
              </View>
            ) : (
              <>
                {specimenReceipts.map((specimen, index) => (
                  <View key={index} style={styles.specimenItem}>
                    <TouchableOpacity
                      onPress={() => handleSpecimenPress(specimen, index)}
                      style={styles.specimenImageContainer}
                    >
                      <Image source={{ uri: specimen.uri }} style={styles.specimenImage} />
                      <View style={styles.zoomOverlay}>
                        <Text style={styles.zoomIcon}>🔍</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveSpecimen(index)}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                {specimenReceipts.length === 0 && (
                  <View style={styles.emptySpecimen}>
                    <Text style={styles.emptyText}>Belum ada specimen</Text>
                    <Text style={styles.emptySubtext}>Tap tombol + untuk menambah</Text>
                    <Text style={styles.emptySubtext}>Specimen akan tersimpan otomatis</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* Process Button */}
        {(customerReceipt && specimenReceipts.length > 0) && (
          <TouchableOpacity
            style={styles.processButton}
            onPress={handleProcessApproval}
          >
            <Text style={styles.processButtonText}>Proses Approval</Text>
          </TouchableOpacity>
        )}
      </ScrollView>



      {/* Customer Receipt Preview Modal */}
      <ImagePreviewModal
        visible={customerPreviewModalVisible}
        onClose={handleCloseCustomerPreview}
        imageUri={customerReceipt?.uri}
        title="Preview Receipt Customer"
        infoData={infoData}
      />

      {/* Specimen Preview Modal dengan Info */}
      <SpecimenPreviewModal
        visible={previewModalVisible}
        onClose={handleClosePreview}
        specimen={selectedSpecimen}
        index={selectedSpecimenIndex}
        totalCount={specimenReceipts.length}
        infoData={infoData}
      />

      {/* Watermark Component */}
      {showWatermark && watermarkImageUri && randomId && (
        <WatermarkImage
          imageUri={watermarkImageUri}
          watermarkText={randomId}
          onCapture={handleWatermarkCapture}
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
    marginBottom: 20,
    lineHeight: 22,
  },
  infoBox: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  infoText: {
    fontSize: 14,
    color: '#0369a1',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 30,
  },
  firstSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 6,
    flexShrink: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  imageContainer: {
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 30,
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
    fontSize: 40,
    marginBottom: 12,
  },
  cameraText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  imagePreview: {
    alignItems: 'center',
  },
  image: {
    width: 250,
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  retakeButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retakeButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  addButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 11,
  },
  clearButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 11,
  },
  specimenContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  loadingContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    width: '100%',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  specimenItem: {
    position: 'relative',
  },
  specimenImageContainer: {
    position: 'relative',
  },
  specimenImage: {
    width: 100,
    height: 80,
    borderRadius: 8,
  },
  zoomOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  zoomIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  specimenImage: {
    width: 100,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptySpecimen: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    width: '100%',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
  processButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  processButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReceiptApproverScreen;