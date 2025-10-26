import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_STORAGE_KEY = 'app_settings';

// default settings - optimized untuk quality seperti WhatsApp
const DEFAULT_SETTINGS = {
    IMAGE_FORMAT: 'JPEG',
    API_ENDPOINT: 'https://quwe0f17qz90w2-3000.proxy.runpod.net/runSync',
    API_TIMEOUT: 1.5 * 60 * 1000,

    // konfigurasi kompresi umum - satu quality untuk semua
    COMPRESSION_QUALITY: 0.8, // quality untuk semua jenis gambar
    COMPRESSION_MAX_WIDTH: 1024, // max width kompresi
    COMPRESSION_MAX_HEIGHT: 1024, // max height kompresi
    COMPRESSION_KEEP_META: false, // preserve EXIF untuk orientation

    // konfigurasi kompresi khusus untuk KTP OCR - quality lebih tinggi untuk akurasi OCR
    KTP_COMPRESSION_QUALITY: 0.9, // quality lebih tinggi untuk OCR
    KTP_COMPRESSION_MAX_WIDTH: 600, // resolusi lebih tinggi untuk detail KTP
    KTP_COMPRESSION_MAX_HEIGHT: 600,
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
    if (!settings.COMPRESSION_QUALITY || settings.COMPRESSION_QUALITY < 0.1 || settings.COMPRESSION_QUALITY > 1.0) {
        errors.COMPRESSION_QUALITY = 'Kualitas kompresi harus antara 0.1-1.0';
    }

    if (!settings.COMPRESSION_MAX_WIDTH || settings.COMPRESSION_MAX_WIDTH < 100 || settings.COMPRESSION_MAX_WIDTH > 3840) {
        errors.COMPRESSION_MAX_WIDTH = 'Max width kompresi harus antara 100-3840 pixel';
    }

    if (!settings.COMPRESSION_MAX_HEIGHT || settings.COMPRESSION_MAX_HEIGHT < 100 || settings.COMPRESSION_MAX_HEIGHT > 3840) {
        errors.COMPRESSION_MAX_HEIGHT = 'Max height kompresi harus antara 100-3840 pixel';
    }

    // validasi konfigurasi kompresi KTP
    if (!settings.KTP_COMPRESSION_QUALITY || settings.KTP_COMPRESSION_QUALITY < 0.1 || settings.KTP_COMPRESSION_QUALITY > 1.0) {
        errors.KTP_COMPRESSION_QUALITY = 'Kualitas kompresi KTP harus antara 0.1-1.0';
    }

    if (!settings.KTP_COMPRESSION_MAX_WIDTH || settings.KTP_COMPRESSION_MAX_WIDTH < 100 || settings.KTP_COMPRESSION_MAX_WIDTH > 3840) {
        errors.KTP_COMPRESSION_MAX_WIDTH = 'Max width kompresi KTP harus antara 100-3840 pixel';
    }

    if (!settings.KTP_COMPRESSION_MAX_HEIGHT || settings.KTP_COMPRESSION_MAX_HEIGHT < 100 || settings.KTP_COMPRESSION_MAX_HEIGHT > 3840) {
        errors.KTP_COMPRESSION_MAX_HEIGHT = 'Max height kompresi KTP harus antara 100-3840 pixel';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export { DEFAULT_SETTINGS };
