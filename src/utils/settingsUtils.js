import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_STORAGE_KEY = 'app_settings';

// default settings - optimized untuk quality seperti WhatsApp
const DEFAULT_SETTINGS = {
    MAX_IMAGE_SIZE: 1024, // ukuran lebih besar agar detail tetap bagus
    IMAGE_QUALITY: 87, // sweet spot untuk JPEG - balance optimal antara kualitas dan ukuran
    IMAGE_FORMAT: 'JPEG',
    API_ENDPOINT: 'https://quwe0f17qz90w2-3000.proxy.runpod.net/runSync',
    API_TIMEOUT: 1.5 * 60 * 1000,

    // konfigurasi kompresi optimal seperti WhatsApp
    COMPRESSION_LIGHT_QUALITY: 0.8, // untuk gambar kecil (< 1MB)
    COMPRESSION_MEDIUM_QUALITY: 0.7, // untuk gambar medium (1-5MB)
    COMPRESSION_AGGRESSIVE_QUALITY: 0.6, // untuk gambar besar (> 5MB)
    COMPRESSION_MAX_WIDTH: 1024,
    COMPRESSION_MAX_HEIGHT: 1024,
    COMPRESSION_KEEP_META: false, // preserve EXIF untuk orientation
};

// simpan settings ke local storage
export const saveSettings = async (settings) => {
    try {
        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        console.log('Settings berhasil disimpan');
    } catch (error) {
        console.error('Error saving settings:', error);
        throw error;
    }
};

// load settings dari local storage
export const loadSettings = async () => {
    try {
        const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);

        if (storedSettings) {
            const settings = JSON.parse(storedSettings);
            console.log('Settings berhasil di-load dari storage');
            return { ...DEFAULT_SETTINGS, ...settings };
        }

        console.log('Menggunakan default settings');
        return DEFAULT_SETTINGS;
    } catch (error) {
        console.error('Error loading settings:', error);
        return DEFAULT_SETTINGS;
    }
};

// reset settings ke default
export const resetSettings = async () => {
    try {
        await AsyncStorage.removeItem(SETTINGS_STORAGE_KEY);
        console.log('Settings berhasil di-reset ke default');
        return DEFAULT_SETTINGS;
    } catch (error) {
        console.error('Error resetting settings:', error);
        throw error;
    }
};

// validasi settings
export const validateSettings = (settings) => {
    const errors = {};

    if (!settings.MAX_IMAGE_SIZE || settings.MAX_IMAGE_SIZE < 100 || settings.MAX_IMAGE_SIZE > 3840) {
        errors.MAX_IMAGE_SIZE = 'Ukuran gambar harus antara 100-3840 pixel (optimal: 1280-1920)';
    }

    if (!settings.IMAGE_QUALITY || settings.IMAGE_QUALITY < 10 || settings.IMAGE_QUALITY > 95) {
        errors.IMAGE_QUALITY = 'Kualitas gambar harus antara 10-95 (optimal: 85-92)';
    }

    if (!settings.IMAGE_FORMAT || !['JPEG', 'PNG'].includes(settings.IMAGE_FORMAT)) {
        errors.IMAGE_FORMAT = 'Format gambar harus JPEG atau PNG';
    }

    if (!settings.API_ENDPOINT || settings.API_ENDPOINT.trim() === '') {
        errors.API_ENDPOINT = 'API endpoint tidak boleh kosong';
    }

    if (!settings.API_TIMEOUT || settings.API_TIMEOUT < 1000 || settings.API_TIMEOUT > 120000) {
        errors.API_TIMEOUT = 'Timeout harus antara 1000-120000 ms';
    }

    // validasi konfigurasi kompresi
    if (!settings.COMPRESSION_LIGHT_QUALITY || settings.COMPRESSION_LIGHT_QUALITY < 0.1 || settings.COMPRESSION_LIGHT_QUALITY > 1.0) {
        errors.COMPRESSION_LIGHT_QUALITY = 'Kualitas kompresi ringan harus antara 0.1-1.0';
    }

    if (!settings.COMPRESSION_MEDIUM_QUALITY || settings.COMPRESSION_MEDIUM_QUALITY < 0.1 || settings.COMPRESSION_MEDIUM_QUALITY > 1.0) {
        errors.COMPRESSION_MEDIUM_QUALITY = 'Kualitas kompresi sedang harus antara 0.1-1.0';
    }

    if (!settings.COMPRESSION_AGGRESSIVE_QUALITY || settings.COMPRESSION_AGGRESSIVE_QUALITY < 0.1 || settings.COMPRESSION_AGGRESSIVE_QUALITY > 1.0) {
        errors.COMPRESSION_AGGRESSIVE_QUALITY = 'Kualitas kompresi agresif harus antara 0.1-1.0';
    }

    if (!settings.COMPRESSION_MAX_WIDTH || settings.COMPRESSION_MAX_WIDTH < 100 || settings.COMPRESSION_MAX_WIDTH > 3840) {
        errors.COMPRESSION_MAX_WIDTH = 'Max width kompresi harus antara 100-3840 pixel';
    }

    if (!settings.COMPRESSION_MAX_HEIGHT || settings.COMPRESSION_MAX_HEIGHT < 100 || settings.COMPRESSION_MAX_HEIGHT > 3840) {
        errors.COMPRESSION_MAX_HEIGHT = 'Max height kompresi harus antara 100-3840 pixel';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export { DEFAULT_SETTINGS };
