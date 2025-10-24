import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_STORAGE_KEY = 'app_settings';

// default settings
const DEFAULT_SETTINGS = {
    MAX_IMAGE_SIZE: 448,
    IMAGE_QUALITY: 80,
    IMAGE_FORMAT: 'JPEG',
    API_ENDPOINT: 'YOUR_API_ENDPOINT_HERE',
    API_TIMEOUT: 30000,
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

    if (!settings.MAX_IMAGE_SIZE || settings.MAX_IMAGE_SIZE < 100 || settings.MAX_IMAGE_SIZE > 2000) {
        errors.MAX_IMAGE_SIZE = 'Ukuran gambar harus antara 100-2000 pixel';
    }

    if (!settings.IMAGE_QUALITY || settings.IMAGE_QUALITY < 10 || settings.IMAGE_QUALITY > 100) {
        errors.IMAGE_QUALITY = 'Kualitas gambar harus antara 10-100';
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

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export { DEFAULT_SETTINGS };
