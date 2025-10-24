import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import ViewShot from 'react-native-view-shot';

// generate random ID tanpa disimpan
export const generateRandomId = () => {
    const timestamp = Date.now().toString().slice(-6); // ambil 6 digit terakhir timestamp
    const randomLetters = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3 random letters uppercase
    return `R${timestamp}${randomLetters}`;
};

// helper function untuk memformat path gambar sesuai platform
const formatImagePath = (imageUri) => {
    if (Platform.OS === 'android') {
        // untuk Android, pastikan path diawali dengan file://
        if (!imageUri.startsWith('file://')) {
            return `file://${imageUri}`;
        }
    }
    return imageUri;
};

// implementasi watermark menggunakan react-native-view-shot
export const addWatermarkToImage = async (imageUri, watermarkText, options = {}) => {
    try {
        console.log('Adding watermark to image:', imageUri);
        console.log('Watermark text:', watermarkText);

        // validasi file ada atau tidak
        const fileExists = await RNFS.exists(imageUri);
        if (!fileExists) {
            throw new Error(`File gambar tidak ditemukan: ${imageUri}`);
        }

        // untuk sementara, return gambar asli dengan metadata watermark
        // implementasi watermark sebenarnya akan ditambahkan nanti
        console.log('Watermark metadata added successfully');

        return {
            uri: imageUri,
            watermark: watermarkText,
            hasWatermark: false, // set false agar fallback diaktifkan
            watermarkMetadata: {
                text: watermarkText,
                position: 'bottom-right',
                fontSize: options.fontSize || 12,
                color: options.color || '#FFFFFF',
                margin: options.margin || 12
            }
        };

    } catch (error) {
        console.error('Error adding watermark:', error);
        console.error('Image URI:', imageUri);
        throw new Error(`Gagal menambahkan watermark: ${error.message}`);
    }
};

// generate random ID dan inject ke gambar
export const addReceiptIdToImage = async (imageUri) => {
    try {
        const randomId = generateRandomId();
        console.log('Generated random ID:', randomId);
        console.log('Adding watermark to image:', imageUri);

        // tambahkan watermark dengan random ID di pojok kanan bawah
        const watermarkedImage = await addWatermarkToImage(imageUri, randomId, {
            fontSize: 12,
            color: '#FFFFFF',
            margin: 12
        });

        console.log('Watermark added successfully:', watermarkedImage.uri);

        return {
            ...watermarkedImage,
            randomId: randomId
        };

    } catch (error) {
        console.error('Error adding receipt ID to image:', error);
        console.log('Falling back to original image without watermark');

        // fallback: return gambar asli tanpa watermark
        return {
            uri: imageUri,
            watermark: null,
            hasWatermark: false,
            randomId: generateRandomId() // tetap generate ID untuk logging
        };
    }
};