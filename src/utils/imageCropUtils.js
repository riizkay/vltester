import { Image } from 'react-native';
import { Dimensions } from 'react-native';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import ImageEditor from '@react-native-community/image-editor';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ukuran mask KTP di layar
const KTP_MASK_WIDTH = SCREEN_WIDTH * 0.9;
const KTP_MASK_HEIGHT = KTP_MASK_WIDTH * 0.63;

// posisi mask di layar (center)
const MASK_LEFT = (SCREEN_WIDTH - KTP_MASK_WIDTH) / 2;
const MASK_TOP = (SCREEN_HEIGHT - KTP_MASK_HEIGHT) / 2;

// Padding untuk crop - bisa berbeda untuk horizontal dan vertical
const CROP_PADDING_HORIZONTAL = 0.03; // 3% gap horizontal (lebih kecil)
const CROP_PADDING_VERTICAL = 0.05; // 5% gap vertical (lebih besar)

/**
 * Crop gambar sesuai dengan area mask KTP
 * @param {string} imageUri - URI gambar yang akan di-crop
 * @returns {Promise<string>} URI gambar yang sudah di-crop
 */
export const cropKtpMask = async (imageUri) => {
    try {
        // validasi URI
        if (!imageUri || imageUri.trim() === '') {
            throw new Error('URI gambar kosong');
        }

        console.log('Cropping image with URI:', imageUri);

        // hitung scale ratio antara kamera dan gambar asli
        const imageInfo = await new Promise((resolve, reject) => {
            Image.getSize(
                imageUri,
                (width, height) => {
                    resolve({ width, height });
                },
                (error) => {
                    console.error('Error getting image size:', error);
                    reject(new Error(`Gagal mendapatkan ukuran gambar: ${error.message}`));
                }
            );
        });

        console.log('Image info:', imageInfo);
        console.log('Screen dimensions:', { SCREEN_WIDTH, SCREEN_HEIGHT });

        // Note: Kamera menyimpan gambar dalam satu orientasi, tapi ukuran yang dikembalikan
        // oleh camera kit mungkin sudah swapped (portrait menjadi landscape)
        // Kita perlu cek dari dimensi asli file

        // Image actual dimensions: 2288x4080 (portrait)
        // Screen: 384x752 (portrait)
        // Jadi keduanya portrait, tapi hasil crop jadi landscape

        // Kemungkinan masalah: Image actual ter-rotate 90 derajat saat disimpan
        // atau kalkulasi crop area salah

        console.log('Detailed analysis:');
        console.log('Screen aspect ratio:', SCREEN_WIDTH / SCREEN_HEIGHT);
        console.log('Image aspect ratio:', imageInfo.width / imageInfo.height);
        console.log('Mask dimensions:', { KTP_MASK_WIDTH, KTP_MASK_HEIGHT });
        console.log('Mask position:', { MASK_LEFT, MASK_TOP });

        // tentukan apakah image orientation berbeda dengan screen orientation
        const isImageLandscape = imageInfo.width > imageInfo.height;
        const isScreenLandscape = SCREEN_WIDTH > SCREEN_HEIGHT;
        const orientationMismatch = isImageLandscape !== isScreenLandscape;

        console.log('Orientation check:', {
            isImageLandscape,
            isScreenLandscape,
            orientationMismatch
        });

        let cropX, cropY, cropWidthMask, cropHeightMask;

        if (orientationMismatch) {
            // Image orientation berbeda dengan screen
            // Jika screen portrait tapi image landscape (atau sebaliknya)
            // Kita perlu menukar scale X dan Y
            const scaleX = imageInfo.height / SCREEN_WIDTH;  // swap
            const scaleY = imageInfo.width / SCREEN_HEIGHT;  // swap

            // Calculate base crop dimensions
            const baseWidth = KTP_MASK_HEIGHT * scaleY;
            const baseHeight = KTP_MASK_WIDTH * scaleX;

            // Calculate padding in pixels (outset - expand outward)
            const paddingX = baseWidth * CROP_PADDING_HORIZONTAL;
            const paddingY = baseHeight * CROP_PADDING_VERTICAL;

            // Adjust crop with padding (outset - expand outward)
            cropX = Math.max(0, Math.floor(MASK_TOP * scaleX - paddingX)); // move left
            cropY = Math.max(0, Math.floor(MASK_LEFT * scaleY - paddingY)); // move up
            cropWidthMask = Math.min(
                imageInfo.width - cropX,
                Math.floor(baseWidth + paddingX * 2) // add padding to both sides
            );
            cropHeightMask = Math.min(
                imageInfo.height - cropY,
                Math.floor(baseHeight + paddingY * 2) // add padding to both sides
            );

            console.log('Crop with padding (mismatched orientation):', {
                baseWidth,
                baseHeight,
                paddingX,
                paddingY,
                finalWidth: cropWidthMask,
                finalHeight: cropHeightMask
            });
        } else {
            // Orientasi sama
            const scaleX = imageInfo.width / SCREEN_WIDTH;
            const scaleY = imageInfo.height / SCREEN_HEIGHT;

            console.log('Scale factors (normal):', { scaleX, scaleY });

            // Calculate base crop dimensions
            const baseWidth = KTP_MASK_WIDTH * scaleX;
            const baseHeight = KTP_MASK_HEIGHT * scaleY;

            // Calculate padding in pixels (outset - expand outward)
            const paddingX = baseWidth * CROP_PADDING_HORIZONTAL;
            const paddingY = baseHeight * CROP_PADDING_VERTICAL;

            // Adjust crop with padding (outset - expand outward)
            cropX = Math.max(0, Math.floor(MASK_LEFT * scaleX - paddingX)); // move left
            cropY = Math.max(0, Math.floor(MASK_TOP * scaleY - paddingY)); // move up
            cropWidthMask = Math.min(
                imageInfo.width - cropX,
                Math.floor(baseWidth + paddingX * 2) // add padding to both sides
            );
            cropHeightMask = Math.min(
                imageInfo.height - cropY,
                Math.floor(baseHeight + paddingY * 2) // add padding to both sides
            );

            console.log('Crop with padding:', {
                baseWidth,
                baseHeight,
                paddingX,
                paddingY,
                finalWidth: cropWidthMask,
                finalHeight: cropHeightMask,
                aspectRatio: cropWidthMask / cropHeightMask
            });

            console.log('Expected crop result dimensions:', {
                width: cropWidthMask,
                height: cropHeightMask,
                aspectRatio: cropWidthMask / cropHeightMask,
                expectedAspectRatio: '~1.6 (KTP landscape card with padding)'
            });
        }

        console.log('Crop parameters:', {
            cropX,
            cropY,
            cropWidthMask,
            cropHeightMask,
            imageWidth: imageInfo.width,
            imageHeight: imageInfo.height,
        });

        // crop menggunakan @react-native-community/image-editor
        console.log('Attempting crop with @react-native-community/image-editor...');

        try {
            const cropData = {
                offset: { x: cropX, y: cropY },
                size: { width: cropWidthMask, height: cropHeightMask },
            };

            console.log('Crop data:', cropData);

            const croppedImage = await ImageEditor.cropImage(imageUri, cropData);

            console.log('Cropped image result:', croppedImage);

            // Handle the result - cropImage returns an object with uri property
            const croppedUri = typeof croppedImage === 'string' ? croppedImage : croppedImage.uri;

            console.log('Cropped image URI:', croppedUri);
            return croppedUri;
        } catch (error) {
            console.error('ImageEditor crop failed:', error);
            console.warn('⚠️ WARNING: Crop failed, returning original image');
            return imageUri;
        }
    } catch (error) {
        console.error('Error cropping KTP image:', error);
        throw new Error(`Gagal crop gambar: ${error.message}`);
    }
};

/**
 * Crop dan resize gambar KTP ke ukuran optimal untuk OCR
 * @param {string} imageUri - URI gambar yang akan diproses
 * @returns {Promise<string>} URI gambar yang sudah diproses
 */
export const processKtpImage = async (imageUri) => {
    try {
        console.log('Processing KTP image:', imageUri);

        // validasi URI
        if (!imageUri || imageUri.trim() === '') {
            throw new Error('URI gambar kosong');
        }

        // dapatkan ukuran gambar
        const imageInfo = await new Promise((resolve, reject) => {
            Image.getSize(
                imageUri,
                (width, height) => {
                    resolve({ width, height });
                },
                (error) => {
                    console.error('Error getting image size:', error);
                    reject(new Error(`Gagal mendapatkan ukuran gambar: ${error.message}`));
                }
            );
        });

        console.log('Original image size:', imageInfo);

        // crop sesuai mask
        const croppedUri = await cropKtpMask(imageUri);

        // dapatkan ukuran setelah crop
        const croppedImageInfo = await new Promise((resolve, reject) => {
            Image.getSize(
                croppedUri,
                (width, height) => {
                    resolve({ width, height });
                },
                (error) => {
                    console.error('Error getting cropped image size:', error);
                    reject(
                        new Error(`Gagal mendapatkan ukuran gambar hasil crop: ${error.message}`)
                    );
                }
            );
        });

        console.log('Cropped image size:', croppedImageInfo);

        // resize ke ukuran optimal untuk OCR (max 2000px width, maintain ratio)
        const maxWidth = 2000;
        let targetWidth = croppedImageInfo.width;
        let targetHeight = croppedImageInfo.height;

        if (targetWidth > maxWidth) {
            const ratio = maxWidth / targetWidth;
            targetWidth = maxWidth;
            targetHeight = Math.round(targetHeight * ratio);
        }

        console.log('Resizing to:', { targetWidth, targetHeight });

        const finalImage = await ImageResizer.createResizedImage(
            croppedUri,
            targetWidth,
            targetHeight,
            'JPEG',
            85,
            0,
            undefined,
            false,
            { onlyScaleDown: false }
        );

        console.log('Final processed image URI:', finalImage.uri);
        return finalImage.uri;
    } catch (error) {
        console.error('Error processing KTP image:', error);
        throw error;
    }
};
