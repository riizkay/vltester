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
  ScrollView,
} from 'react-native';
import { takePhotoAndConvert } from '../../utils/imageUtils';

const ReceiptApproverScreen = ({ navigation }) => {
  const [customerReceipt, setCustomerReceipt] = useState(null);
  const [specimenReceipts, setSpecimenReceipts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleTakeCustomerPhoto = async () => {
    try {
      setIsLoading(true);
      const result = await takePhotoAndConvert();
      setCustomerReceipt(result);
    } catch (error) {
      console.log('Take photo error:', error);
      Alert.alert('Error', `Gagal mengambil foto: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakeSpecimenPhoto = async () => {
    try {
      setIsLoading(true);
      const result = await takePhotoAndConvert();
      setSpecimenReceipts(prev => [...prev, result]);
    } catch (error) {
      console.log('Take photo error:', error);
      Alert.alert('Error', `Gagal mengambil foto: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSpecimen = (index) => {
    setSpecimenReceipts(prev => prev.filter((_, i) => i !== index));
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
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Receipt Approver</Text>
        <Text style={styles.subtitle}>
          Bandingkan receipt customer dengan specimen untuk approval
        </Text>

        {/* Customer Receipt Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Receipt Customer</Text>
          <Text style={styles.sectionSubtitle}>
            Receipt yang akan di-approve
          </Text>
          
          <View style={styles.imageContainer}>
            {customerReceipt ? (
              <View style={styles.imagePreview}>
                <Image source={{ uri: customerReceipt.uri }} style={styles.image} />
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
            <View>
              <Text style={styles.sectionTitle}>Receipt Specimen</Text>
              <Text style={styles.sectionSubtitle}>
                Receipt untuk perbandingan ({specimenReceipts.length} item)
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={handleTakeSpecimenPhoto}
              disabled={isLoading}
            >
              <Text style={styles.addButtonText}>+ Tambah</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.specimenContainer}>
            {specimenReceipts.map((specimen, index) => (
              <View key={index} style={styles.specimenItem}>
                <Image source={{ uri: specimen.uri }} style={styles.specimenImage} />
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
              </View>
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
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  specimenContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  specimenItem: {
    position: 'relative',
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