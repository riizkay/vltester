import AsyncStorage from '@react-native-async-storage/async-storage';

const SPECIMEN_STORAGE_KEY = 'receipt_specimens';

// simpan specimen receipts ke local storage
export const saveSpecimenReceipts = async (specimens) => {
    try {
        const specimensData = specimens.map(specimen => ({
            uri: specimen.uri,
            base64: specimen.base64,
            timestamp: Date.now()
        }));

        await AsyncStorage.setItem(SPECIMEN_STORAGE_KEY, JSON.stringify(specimensData));
        console.log('Specimen receipts berhasil disimpan ke storage');
    } catch (error) {
        console.error('Error saving specimen receipts:', error);
        throw error;
    }
};

// load specimen receipts dari local storage
export const loadSpecimenReceipts = async () => {
    try {
        const storedData = await AsyncStorage.getItem(SPECIMEN_STORAGE_KEY);

        if (storedData) {
            const specimensData = JSON.parse(storedData);
            console.log(`Loaded ${specimensData.length} specimen receipts dari storage`);
            return specimensData;
        }

        return [];
    } catch (error) {
        console.error('Error loading specimen receipts:', error);
        return [];
    }
};

// hapus semua specimen receipts dari storage
export const clearSpecimenReceipts = async () => {
    try {
        await AsyncStorage.removeItem(SPECIMEN_STORAGE_KEY);
        console.log('Specimen receipts berhasil dihapus dari storage');
    } catch (error) {
        console.error('Error clearing specimen receipts:', error);
        throw error;
    }
};

// cek apakah ada specimen tersimpan
export const hasStoredSpecimens = async () => {
    try {
        const storedData = await AsyncStorage.getItem(SPECIMEN_STORAGE_KEY);
        return storedData !== null && storedData !== '[]';
    } catch (error) {
        console.error('Error checking stored specimens:', error);
        return false;
    }
};
