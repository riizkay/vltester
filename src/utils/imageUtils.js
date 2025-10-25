/**
 * ImageUtils - Utility untuk handling gambar dengan kompresi optimal seperti WhatsApp
 * 
 * Fitur utama:
 * - Kompresi gambar otomatis berdasarkan ukuran file
 * - Strategi kompresi adaptif (light/medium/aggressive)
 * - Preserve EXIF metadata untuk orientation
 * - Konfigurasi dinamis dari settings
 * - Support kamera dan galeri
 * - Watermark integration
 * - Fallback ke ImageResizer jika react-native-compressor gagal
 * 
 * Strategi kompresi:
 * - Light (< 1MB): Quality 0.8, Max 1920px
 * - Medium (1-5MB): Quality 0.7, Max 1920px  
 * - Aggressive (> 5MB): Quality 0.6, Max 1920px
 * 
 * Penggunaan:
 * - takePhotoWithBase64(): Ambil foto + kompresi + base64
 * - pickImageWithCompression(): Ambil dari galeri + kompresi + base64
 * - takePhotoWithWatermark(): Ambil foto + kompresi + watermark + base64
 * - compressImageOptimal(): Kompresi manual dengan strategi adaptif
 * 
 * Error Handling:
 * - Jika react-native-compressor gagal, otomatis fallback ke ImageResizer
 * - Logging detail untuk debugging
 * - Return info kompresi termasuk apakah menggunakan fallback
 */

import ImageResizer from '@bam.tech/react-native-image-resizer';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { CONFIG } from '../config/appConfig';
import { Platform, PermissionsAndroid } from 'react-native';
import { addReceiptIdToImage } from './watermarkUtils';
import RNFS from 'react-native-fs';
import { Image } from 'react-native-compressor';
import { loadSettings } from './settingsUtils';

// konfigurasi resize image
const MAX_SIZE = CONFIG.MAX_IMAGE_SIZE;

/**
 * Optimasi Kompresi Image (mendekati quality WhatsApp):
 * 
 * 1. MAX_SIZE: 1920px (cukup besar untuk preserve detail)
 * 2. QUALITY: 87 (sweet spot JPEG - di atas 90 file size membengkak, di bawah 85 quality drop)
 * 3. MODE: 'cover' (preserve aspect ratio tanpa distorsi)
 * 4. keepMeta: true (preserve EXIF untuk orientation)
 * 
 * Quality 100 TIDAK disarankan karena:
 * - File size sangat besar
 * - Menimbulkan artefak JPEG compression
 * - Tidak ada perbedaan visual signifikan dengan quality 87-92
 */


// fungsi untuk menentukan strategi kompresi berdasarkan ukuran file dan settings
const getCompressionStrategy = (fileSize, settings) => {
  const sizeInMB = fileSize / (1024 * 1024);

  if (sizeInMB < 1) {
    return {
      quality: settings.COMPRESSION_LIGHT_QUALITY,
      maxWidth: settings.COMPRESSION_MAX_WIDTH,
      maxHeight: settings.COMPRESSION_MAX_HEIGHT,
    };
  } else if (sizeInMB < 5) {
    return {
      quality: settings.COMPRESSION_MEDIUM_QUALITY,
      maxWidth: settings.COMPRESSION_MAX_WIDTH,
      maxHeight: settings.COMPRESSION_MAX_HEIGHT,
    };
  } else {
    return {
      quality: settings.COMPRESSION_AGGRESSIVE_QUALITY,
      maxWidth: settings.COMPRESSION_MAX_WIDTH,
      maxHeight: settings.COMPRESSION_MAX_HEIGHT,
    };
  }
};

// kompresi gambar dengan react-native-compressor (optimal seperti WhatsApp)
export const compressImageOptimal = async (imageUri, options = {}) => {
  try {
    console.log('Starting optimal image compression...');
    console.log('Original image URI:', imageUri);

    // load settings untuk konfigurasi kompresi
    const settings = await loadSettings();
    console.log('Loaded compression settings:', settings);

    // cek file size untuk menentukan strategi kompresi
    const fileInfo = await RNFS.stat(imageUri);
    const fileSize = fileInfo.size;
    console.log('Original file size:', fileSize, 'bytes');

    // tentukan strategi kompresi berdasarkan settings
    const compressionStrategy = getCompressionStrategy(fileSize, settings);
    console.log('Using compression strategy:', compressionStrategy);

    // kompresi dengan react-native-compressor
    const compressedUri = await Image.compress(imageUri, {
      quality: options.quality || compressionStrategy.quality,
      maxWidth: options.maxWidth || compressionStrategy.maxWidth,
      maxHeight: options.maxHeight || compressionStrategy.maxHeight,
      input: 'uri',
      output: 'jpg', // format output harus berupa format file, bukan 'uri'
      returnableOutputType: 'uri', // ini yang menentukan return type
      // preserve metadata untuk orientation dari settings
      keepMeta: options.keepMeta !== undefined ? options.keepMeta : settings.COMPRESSION_KEEP_META,
    });

    // cek hasil kompresi
    const compressedFileInfo = await RNFS.stat(compressedUri);
    const compressedSize = compressedFileInfo.size;
    const compressionRatio = ((fileSize - compressedSize) / fileSize * 100).toFixed(1);

    console.log('Compressed file size:', compressedSize, 'bytes');
    console.log('Compression ratio:', compressionRatio + '%');

    return {
      uri: compressedUri,
      originalSize: fileSize,
      compressedSize: compressedSize,
      compressionRatio: parseFloat(compressionRatio),
      strategy: compressionStrategy
    };

  } catch (error) {
    console.error('Error compressing image:', error);

    // fallback: gunakan ImageResizer jika react-native-compressor gagal
    console.log('Falling back to ImageResizer...');
    try {
      const settings = await loadSettings();
      const fallbackResult = await ImageResizer.createResizedImage(
        imageUri,
        settings.COMPRESSION_MAX_WIDTH,
        settings.COMPRESSION_MAX_HEIGHT,
        'JPEG',
        Math.round(settings.COMPRESSION_MEDIUM_QUALITY * 100), // convert ke 0-100 scale
        0,
        undefined,
        false,
        {
          mode: 'contain',
          onlyScaleDown: true,
        }
      );

      const fallbackFileInfo = await RNFS.stat(fallbackResult.uri);
      const fallbackSize = fallbackFileInfo.size;
      const fallbackRatio = ((fileSize - fallbackSize) / fileSize * 100).toFixed(1);

      console.log('Fallback compression successful:', fallbackSize, 'bytes');
      console.log('Fallback compression ratio:', fallbackRatio + '%');

      return {
        uri: fallbackResult.uri,
        originalSize: fileSize,
        compressedSize: fallbackSize,
        compressionRatio: parseFloat(fallbackRatio),
        strategy: { quality: settings.COMPRESSION_MEDIUM_QUALITY, maxWidth: settings.COMPRESSION_MAX_WIDTH, maxHeight: settings.COMPRESSION_MAX_HEIGHT },
        isFallback: true
      };
    } catch (fallbackError) {
      console.error('Fallback compression also failed:', fallbackError);
      throw new Error(`Gagal kompresi gambar: ${error.message}`);
    }
  }
};

// pilihan untuk image picker
const imagePickerOptions = {
  mediaType: 'photo',
  includeBase64: false, // tidak perlu base64 dari picker, akan diprocess dulu untuk fix orientation
  maxHeight: 2000,
  maxWidth: 2000,
  quality: 0.8, // kembali ke 0.8 untuk menghindari file terlalu besar sebelum kompresi
  cameraType: 'back', // kamera belakang sebagai default
  saveToPhotos: false,
};

// request permission kamera untuk Android
const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs access to camera to take photos',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};

// ambil foto dari kamera
export const takePhoto = () => {
  return new Promise(async (resolve, reject) => {
    // cek permission dulu
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      reject(new Error('Camera permission denied'));
      return;
    }

    // pastikan kamera belakang digunakan
    const options = {
      ...imagePickerOptions,
      cameraType: 'back',
    };

    launchCamera(options, (response) => {
      console.log('Camera response:', response);

      if (response.didCancel) {
        reject(new Error('User cancelled camera'));
        return;
      }

      if (response.errorMessage) {
        reject(new Error(`Camera error: ${response.errorMessage}`));
        return;
      }

      if (response.assets && response.assets[0]) {
        resolve(response.assets[0]);
      } else {
        reject(new Error('No image selected'));
      }
    });
  });
};

// ambil foto dari galeri
export const pickImage = () => {
  return new Promise((resolve, reject) => {
    launchImageLibrary(imagePickerOptions, (response) => {
      console.log('Gallery response:', response);

      if (response.didCancel) {
        reject(new Error('User cancelled gallery'));
        return;
      }

      if (response.errorMessage) {
        reject(new Error(`Gallery error: ${response.errorMessage}`));
        return;
      }

      if (response.assets && response.assets[0]) {
        resolve(response.assets[0]);
      } else {
        reject(new Error('No image selected'));
      }
    });
  });
};

// ambil foto dari galeri dengan kompresi optimal
export const pickImageWithCompression = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const asset = await pickImage();
      console.log('Gallery asset selected:', asset.uri);
      console.log('Asset fileSize:', asset.fileSize);

      // kompresi optimal dengan react-native-compressor
      const compressedResult = await compressImageOptimal(asset.uri);
      console.log('Gallery image compressed optimally:', compressedResult.uri);
      console.log('Compression ratio:', compressedResult.compressionRatio + '%');

      // convert ke base64
      const base64 = await convertImageToBase64(compressedResult.uri);
      console.log('Gallery image converted to base64');

      resolve({
        uri: compressedResult.uri,
        base64: base64,
        compressionInfo: {
          originalSize: compressedResult.originalSize,
          compressedSize: compressedResult.compressedSize,
          compressionRatio: compressedResult.compressionRatio,
          strategy: compressedResult.strategy
        }
      });
    } catch (error) {
      console.error('Error processing gallery image:', error);
      reject(error);
    }
  });
};

// resize image dan convert ke base64 (metode lama - tidak digunakan lagi)
export const resizeAndConvertToBase64 = async (imageUri) => {
  try {
    // resize image dengan settings optimal
    const resizedImage = await ImageResizer.createResizedImage(
      imageUri,
      MAX_SIZE,
      MAX_SIZE,
      CONFIG.IMAGE_FORMAT,
      CONFIG.IMAGE_QUALITY, // langsung pakai nilai 0-100
      0,
      undefined,
      false,
      {
        mode: 'contain',
        onlyScaleDown: true,
      }
    );

    // return URI dari hasil resize
    return resizedImage.uri;
  } catch (error) {
    throw new Error(`Error processing image: ${error.message}`);
  }
};

// fungsi untuk ambil foto, kompresi optimal, dan convert ke base64
export const takePhotoWithBase64 = () => {
  return new Promise(async (resolve, reject) => {
    // cek permission dulu
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      reject(new Error('Camera permission denied'));
      return;
    }

    // pastikan kamera belakang digunakan
    const options = {
      ...imagePickerOptions,
      cameraType: 'back',
      includeBase64: false, // tidak perlu base64 dari picker
    };

    launchCamera(options, async (response) => {
      console.log('Camera response:', response);

      if (response.didCancel) {
        reject(new Error('User cancelled camera'));
        return;
      }

      if (response.errorMessage) {
        reject(new Error(`Camera error: ${response.errorMessage}`));
        return;
      }

      if (response.assets && response.assets[0]) {
        try {
          const asset = response.assets[0];
          console.log('Asset URI:', asset.uri);
          console.log('Asset type:', asset.type);
          console.log('Asset fileSize:', asset.fileSize);

          // kompresi optimal dengan react-native-compressor
          const compressedResult = await compressImageOptimal(asset.uri);
          console.log('Image compressed optimally:', compressedResult.uri);
          console.log('Compression ratio:', compressedResult.compressionRatio + '%');

          // convert ke base64
          const base64 = await convertImageToBase64(compressedResult.uri);
          console.log('Image converted to base64');

          resolve({
            uri: compressedResult.uri,
            base64: base64,
            compressionInfo: {
              originalSize: compressedResult.originalSize,
              compressedSize: compressedResult.compressedSize,
              compressionRatio: compressedResult.compressionRatio,
              strategy: compressedResult.strategy
            }
          });
        } catch (error) {
          console.error('Error processing image:', error);
          reject(error);
        }
      } else {
        reject(new Error('No image selected'));
      }
    });
  });
};

// ambil foto dan langsung convert ke base64
export const takePhotoAndConvert = async () => {
  try {
    // gunakan metode baru yang lebih sederhana
    return await takePhotoWithBase64();
  } catch (error) {
    throw error;
  }
};

// fungsi alternatif untuk mengambil foto dengan konfigurasi yang lebih eksplisit
export const takePhotoWithOptions = (options = {}) => {
  return new Promise(async (resolve, reject) => {
    // cek permission dulu
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      reject(new Error('Camera permission denied'));
      return;
    }

    const cameraOptions = {
      ...imagePickerOptions,
      ...options,
    };

    launchCamera(cameraOptions, (response) => {
      console.log('Camera response with options:', response);

      if (response.didCancel) {
        reject(new Error('User cancelled camera'));
        return;
      }

      if (response.errorMessage) {
        reject(new Error(`Camera error: ${response.errorMessage}`));
        return;
      }

      if (response.assets && response.assets[0]) {
        resolve(response.assets[0]);
      } else {
        reject(new Error('No image selected'));
      }
    });
  });
};

// fungsi sederhana untuk cek permission kamera saja
export const checkCameraPermission = async () => {
  try {
    const hasPermission = await requestCameraPermission();
    console.log('Camera permission granted:', hasPermission);
    return hasPermission;
  } catch (error) {
    console.log('Camera permission check error:', error);
    return false;
  }
};

// convert image URI ke base64
export const convertImageToBase64 = async (imageUri) => {
  try {
    const base64 = await RNFS.readFile(imageUri, 'base64');
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error(`Error converting image to base64: ${error.message}`);
  }
};

// ambil foto dan tambahkan watermark dengan receipt ID (dengan kompresi optimal)
export const takePhotoWithWatermark = async () => {
  try {
    console.log('Starting photo capture with watermark and optimal compression...');

    // ambil foto terlebih dahulu
    const photoResult = await takePhotoWithBase64();
    console.log('Photo captured and compressed:', photoResult.uri);
    console.log('Compression info:', photoResult.compressionInfo);

    // tambahkan watermark dengan receipt ID di pojok kanan bawah
    const watermarkedResult = await addReceiptIdToImage(photoResult.uri);
    console.log('Watermark processing completed');

    // convert gambar watermarked ke base64 untuk API
    const watermarkedBase64 = await convertImageToBase64(watermarkedResult.uri);
    console.log('Base64 conversion completed');

    return {
      uri: watermarkedResult.uri,
      base64: watermarkedBase64, // gunakan base64 dari gambar yang sudah di-watermark
      randomId: watermarkedResult.randomId,
      hasWatermark: watermarkedResult.hasWatermark,
      compressionInfo: photoResult.compressionInfo // include info kompresi
    };
  } catch (error) {
    console.error('Error in takePhotoWithWatermark:', error);
    throw error;
  }
};
