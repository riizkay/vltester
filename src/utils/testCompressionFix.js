/**
 * TestCompression - Script untuk test kompresi setelah perbaikan
 * 
 * Jalankan script ini untuk test apakah kompresi sudah bekerja dengan benar
 */

import { compressImageOptimal } from './imageUtils';

// test kompresi dengan berbagai konfigurasi
export const testCompressionFix = async () => {
    console.log('=== TESTING COMPRESSION FIX ===');

    try {
        // test dengan konfigurasi default
        console.log('\n1. Testing dengan konfigurasi default...');
        const result1 = await compressImageOptimal('file://test-image.jpg');
        console.log('✅ Default config test passed');
        console.log('Compression ratio:', result1.compressionRatio + '%');
        console.log('Is fallback:', result1.isFallback || false);

        // test dengan custom options
        console.log('\n2. Testing dengan custom options...');
        const result2 = await compressImageOptimal('file://test-image.jpg', {
            quality: 0.5,
            maxWidth: 1280,
            maxHeight: 1280,
            keepMeta: false
        });
        console.log('✅ Custom options test passed');
        console.log('Compression ratio:', result2.compressionRatio + '%');
        console.log('Is fallback:', result2.isFallback || false);

        console.log('\n=== ALL TESTS PASSED ===');
        return true;

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return false;
    }
};

// helper untuk test dengan file yang ada
export const testWithRealFile = async (imageUri) => {
    try {
        console.log('Testing compression with real file:', imageUri);

        const result = await compressImageOptimal(imageUri);

        console.log('✅ Real file test passed');
        console.log('Original size:', result.originalSize, 'bytes');
        console.log('Compressed size:', result.compressedSize, 'bytes');
        console.log('Compression ratio:', result.compressionRatio + '%');
        console.log('Strategy:', result.strategy);
        console.log('Is fallback:', result.isFallback || false);

        return result;
    } catch (error) {
        console.error('❌ Real file test failed:', error.message);
        throw error;
    }
};
