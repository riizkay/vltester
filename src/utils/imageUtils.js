import ImageResizer from '@bam.tech/react-native-image-resizer';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { CONFIG } from '../config/appConfig';
import { Platform, PermissionsAndroid } from 'react-native';

// konfigurasi resize image
const MAX_SIZE = CONFIG.MAX_IMAGE_SIZE;

// pilihan untuk image picker
const imagePickerOptions = {
  mediaType: 'photo',
  includeBase64: true, // langsung ambil base64 dari image picker
  maxHeight: 2000,
  maxWidth: 2000,
  quality: 0.8,
  cameraType: 'back',
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

    launchCamera(imagePickerOptions, (response) => {
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

// resize image dan convert ke base64 (metode lama - tidak digunakan lagi)
export const resizeAndConvertToBase64 = async (imageUri) => {
  try {
    // resize image
    const resizedImage = await ImageResizer.createResizedImage(
      imageUri,
      MAX_SIZE,
      MAX_SIZE,
      CONFIG.IMAGE_FORMAT,
      CONFIG.IMAGE_QUALITY,
      0,
      undefined,
      false,
      {
        mode: 'contain',
        onlyScaleDown: true,
      }
    );

    // untuk sekarang, return URI saja karena base64 sudah diambil langsung dari image picker
    return resizedImage.uri;
  } catch (error) {
    throw new Error(`Error processing image: ${error.message}`);
  }
};

// fungsi baru yang lebih sederhana - ambil base64 langsung dari image picker
export const takePhotoWithBase64 = () => {
  return new Promise(async (resolve, reject) => {
    // cek permission dulu
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      reject(new Error('Camera permission denied'));
      return;
    }

    launchCamera(imagePickerOptions, (response) => {
      console.log('Camera response with base64:', response);
      
      if (response.didCancel) {
        reject(new Error('User cancelled camera'));
        return;
      }
      
      if (response.errorMessage) {
        reject(new Error(`Camera error: ${response.errorMessage}`));
        return;
      }
      
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        resolve({
          uri: asset.uri,
          base64: asset.base64, // langsung ambil base64 dari response
        });
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
