/**
 * CompressionTest - Contoh penggunaan kompresi gambar optimal
 * 
 * File ini berisi contoh penggunaan fungsi-fungsi kompresi untuk testing
 */

import {
    takePhotoWithBase64,
    pickImageWithCompression,
    takePhotoWithWatermark,
    compressImageOptimal
} from './imageUtils';

// contoh penggunaan untuk testing kompresi kamera
export const testCameraCompression = async () => {
    try {
        console.log('Testing camera compression...');

        const result = await takePhotoWithBase64();

        console.log('Camera compression test results:');
        console.log('- Original size:', result.compressionInfo.originalSize, 'bytes');
        console.log('- Compressed size:', result.compressionInfo.compressedSize, 'bytes');
        console.log('- Compression ratio:', result.compressionInfo.compressionRatio + '%');
        console.log('- Strategy used:', result.compressionInfo.strategy);

        return result;
    } catch (error) {
        console.error('Camera compression test failed:', error);
        throw error;
    }
};

// contoh penggunaan untuk testing kompresi galeri
export const testGalleryCompression = async () => {
    try {
        console.log('Testing gallery compression...');

        const result = await pickImageWithCompression();

        console.log('Gallery compression test results:');
        console.log('- Original size:', result.compressionInfo.originalSize, 'bytes');
        console.log('- Compressed size:', result.compressionInfo.compressedSize, 'bytes');
        console.log('- Compression ratio:', result.compressionInfo.compressionRatio + '%');
        console.log('- Strategy used:', result.compressionInfo.strategy);

        return result;
    } catch (error) {
        console.error('Gallery compression test failed:', error);
        throw error;
    }
};

// contoh penggunaan untuk testing kompresi dengan watermark
export const testWatermarkCompression = async () => {
    try {
        console.log('Testing watermark compression...');

        const result = await takePhotoWithWatermark();

        console.log('Watermark compression test results:');
        console.log('- Original size:', result.compressionInfo.originalSize, 'bytes');
        console.log('- Compressed size:', result.compressionInfo.compressedSize, 'bytes');
        console.log('- Compression ratio:', result.compressionInfo.compressionRatio + '%');
        console.log('- Strategy used:', result.compressionInfo.strategy);
        console.log('- Random ID:', result.randomId);
        console.log('- Has watermark:', result.hasWatermark);

        return result;
    } catch (error) {
        console.error('Watermark compression test failed:', error);
        throw error;
    }
};

// contoh penggunaan untuk testing kompresi manual
export const testManualCompression = async (imageUri) => {
    try {
        console.log('Testing manual compression...');
        console.log('Image URI:', imageUri);

        const result = await compressImageOptimal(imageUri);

        console.log('Manual compression test results:');
        console.log('- Original size:', result.originalSize, 'bytes');
        console.log('- Compressed size:', result.compressedSize, 'bytes');
        console.log('- Compression ratio:', result.compressionRatio + '%');
        console.log('- Strategy used:', result.strategy);

        return result;
    } catch (error) {
        console.error('Manual compression test failed:', error);
        throw error;
    }
};

// contoh penggunaan untuk testing dengan custom options
export const testCustomCompression = async (imageUri, customOptions = {}) => {
    try {
        console.log('Testing custom compression...');
        console.log('Image URI:', imageUri);
        console.log('Custom options:', customOptions);

        const result = await compressImageOptimal(imageUri, customOptions);

        console.log('Custom compression test results:');
        console.log('- Original size:', result.originalSize, 'bytes');
        console.log('- Compressed size:', result.compressedSize, 'bytes');
        console.log('- Compression ratio:', result.compressionRatio + '%');
        console.log('- Strategy used:', result.strategy);

        return result;
    } catch (error) {
        console.error('Custom compression test failed:', error);
        throw error;
    }
};

// helper untuk format ukuran file
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// helper untuk menampilkan hasil kompresi dengan format yang lebih readable
export const displayCompressionResults = (result) => {
    console.log('\n=== COMPRESSION RESULTS ===');
    console.log('Original size:', formatFileSize(result.originalSize));
    console.log('Compressed size:', formatFileSize(result.compressedSize));
    console.log('Compression ratio:', result.compressionRatio + '%');
    console.log('Strategy:', JSON.stringify(result.strategy, null, 2));
    console.log('===========================\n');
};
