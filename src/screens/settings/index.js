import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import {
    saveSettings,
    loadSettings,
    resetSettings,
    validateSettings,
    DEFAULT_SETTINGS
} from '../../utils/settingsUtils';

const SettingsScreen = ({ navigation }) => {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // load settings saat component mount
    useEffect(() => {
        const loadStoredSettings = async () => {
            try {
                const storedSettings = await loadSettings();
                setSettings(storedSettings);
            } catch (error) {
                console.error('Error loading settings:', error);
                Alert.alert('Error', 'Gagal memuat pengaturan');
            } finally {
                setIsLoading(false);
            }
        };

        loadStoredSettings();
    }, []);

    const handleInputChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));

        // clear error saat user mengetik
        if (errors[key]) {
            setErrors(prev => ({
                ...prev,
                [key]: ''
            }));
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);

            // validasi settings
            const validation = validateSettings(settings);
            if (!validation.isValid) {
                setErrors(validation.errors);
                Alert.alert('Error', 'Terdapat kesalahan dalam pengaturan');
                return;
            }

            // simpan settings
            await saveSettings(settings);
            Alert.alert('Berhasil', 'Pengaturan berhasil disimpan');

        } catch (error) {
            console.error('Error saving settings:', error);
            Alert.alert('Error', 'Gagal menyimpan pengaturan');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = async () => {
        Alert.alert(
            'Konfirmasi',
            'Apakah Anda yakin ingin mengembalikan pengaturan ke default?',
            [
                {
                    text: 'Batal',
                    style: 'cancel',
                },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const defaultSettings = await resetSettings();
                            setSettings(defaultSettings);
                            setErrors({});
                            Alert.alert('Berhasil', 'Pengaturan berhasil di-reset');
                        } catch (error) {
                            console.error('Error resetting settings:', error);
                            Alert.alert('Error', 'Gagal mereset pengaturan');
                        }
                    },
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                    <Text style={styles.loadingText}>Memuat pengaturan...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content}>
                <Text style={styles.title}>Pengaturan Aplikasi</Text>
                <Text style={styles.subtitle}>
                    Atur konfigurasi aplikasi sesuai kebutuhan
                </Text>

                {/* Image Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Pengaturan Gambar</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Ukuran Maksimal Gambar (pixel)</Text>
                        <TextInput
                            style={[styles.input, errors.MAX_IMAGE_SIZE && styles.inputError]}
                            value={settings.MAX_IMAGE_SIZE.toString()}
                            onChangeText={(value) => handleInputChange('MAX_IMAGE_SIZE', parseInt(value) || 0)}
                            keyboardType="numeric"
                            placeholder="448"
                        />
                        {errors.MAX_IMAGE_SIZE && (
                            <Text style={styles.errorText}>{errors.MAX_IMAGE_SIZE}</Text>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Kualitas Gambar (10-100)</Text>
                        <TextInput
                            style={[styles.input, errors.IMAGE_QUALITY && styles.inputError]}
                            value={settings.IMAGE_QUALITY.toString()}
                            onChangeText={(value) => handleInputChange('IMAGE_QUALITY', parseInt(value) || 0)}
                            keyboardType="numeric"
                            placeholder="80"
                        />
                        {errors.IMAGE_QUALITY && (
                            <Text style={styles.errorText}>{errors.IMAGE_QUALITY}</Text>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Format Gambar</Text>
                        <View style={styles.radioGroup}>
                            <TouchableOpacity
                                style={[
                                    styles.radioButton,
                                    settings.IMAGE_FORMAT === 'JPEG' && styles.radioButtonActive
                                ]}
                                onPress={() => handleInputChange('IMAGE_FORMAT', 'JPEG')}
                            >
                                <Text style={[
                                    styles.radioButtonText,
                                    settings.IMAGE_FORMAT === 'JPEG' && styles.radioButtonTextActive
                                ]}>
                                    JPEG
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.radioButton,
                                    settings.IMAGE_FORMAT === 'PNG' && styles.radioButtonActive
                                ]}
                                onPress={() => handleInputChange('IMAGE_FORMAT', 'PNG')}
                            >
                                <Text style={[
                                    styles.radioButtonText,
                                    settings.IMAGE_FORMAT === 'PNG' && styles.radioButtonTextActive
                                ]}>
                                    PNG
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* API Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Pengaturan API</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>API Endpoint</Text>
                        <TextInput
                            style={[styles.input, errors.API_ENDPOINT && styles.inputError]}
                            value={settings.API_ENDPOINT}
                            onChangeText={(value) => handleInputChange('API_ENDPOINT', value)}
                            placeholder="https://api.example.com"
                            autoCapitalize="none"
                        />
                        {errors.API_ENDPOINT && (
                            <Text style={styles.errorText}>{errors.API_ENDPOINT}</Text>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Timeout (ms)</Text>
                        <TextInput
                            style={[styles.input, errors.API_TIMEOUT && styles.inputError]}
                            value={settings.API_TIMEOUT.toString()}
                            onChangeText={(value) => handleInputChange('API_TIMEOUT', parseInt(value) || 0)}
                            keyboardType="numeric"
                            placeholder="30000"
                        />
                        {errors.API_TIMEOUT && (
                            <Text style={styles.errorText}>{errors.API_TIMEOUT}</Text>
                        )}
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Simpan</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={handleReset}
                    >
                        <Text style={styles.resetButtonText}>Reset ke Default</Text>
                    </TouchableOpacity>
                </View>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 12,
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
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#ffffff',
    },
    inputError: {
        borderColor: '#ef4444',
    },
    errorText: {
        fontSize: 12,
        color: '#ef4444',
        marginTop: 4,
    },
    radioGroup: {
        flexDirection: 'row',
        gap: 12,
    },
    radioButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    radioButtonActive: {
        borderColor: '#4F46E5',
        backgroundColor: '#4F46E5',
    },
    radioButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    radioButtonTextActive: {
        color: '#ffffff',
    },
    buttonContainer: {
        marginTop: 20,
        marginBottom: 20,
    },
    saveButton: {
        backgroundColor: '#4F46E5',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    resetButton: {
        backgroundColor: '#ef4444',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    resetButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SettingsScreen;
