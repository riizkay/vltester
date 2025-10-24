import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

const HomeScreen = ({ navigation }) => {
  const handleReceiptApprover = () => {
    navigation.navigate('ReceiptApprover');
  };

  const handleKtpOcr = () => {
    navigation.navigate('KtpOcr');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>VL Tester</Text>
        <Text style={styles.subtitle}>Pilih menu yang ingin digunakan</Text>
        
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={handleReceiptApprover}
          >
            <Text style={styles.menuIcon}>📄</Text>
            <Text style={styles.menuTitle}>Receipt Approver</Text>
            <Text style={styles.menuDescription}>
              Bandingkan receipt customer dengan specimen
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={handleKtpOcr}
          >
            <Text style={styles.menuIcon}>🆔</Text>
            <Text style={styles.menuTitle}>KTP OCR</Text>
            <Text style={styles.menuDescription}>
              Scan KTP untuk ekstrak data teks
            </Text>
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
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  menuContainer: {
    gap: 20,
  },
  menuButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  menuIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  menuDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HomeScreen;