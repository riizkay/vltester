import React, { useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Alert,
} from 'react-native';
import { Camera } from 'react-native-camera-kit';

const { width, height } = Dimensions.get('window');

const KTP_MASK_WIDTH = width * 0.9;
const KTP_MASK_HEIGHT = KTP_MASK_WIDTH * 0.63;

const CameraScreen = ({ onTakePhoto, onCancel }) => {
    const cameraRef = useRef(null);

    const handleTakePhoto = async () => {
        try {
            // delay kecil untuk memastikan kamera siap
            await new Promise(resolve => setTimeout(resolve, 100));

            const image = await cameraRef.current?.capture();

            console.log('Camera captured image:', JSON.stringify(image, null, 2));

            if (image) {
                // react-native-camera-kit returns image dengan format: { path, uri, width, height }
                // pastikan kita mendapatkan path/uri yang benar
                let imageUri = image.uri || image.path || image.filePath;

                console.log('Extracted image URI:', imageUri);

                if (!imageUri) {
                    console.error('No valid URI/path found in image object:', image);
                    Alert.alert('Error', 'URI gambar tidak ditemukan');
                    return;
                }

                // tambahkan prefix file:// jika path belum ada prefix
                if (!imageUri.startsWith('file://') && !imageUri.startsWith('content://')) {
                    imageUri = `file://${imageUri}`;
                    console.log('Added file:// prefix, final URI:', imageUri);
                }

                const imageData = {
                    uri: imageUri,
                    width: image.width,
                    height: image.height,
                };

                console.log('Image data to pass:', imageData);
                onTakePhoto(imageData);
            } else {
                Alert.alert('Error', 'Gagal mengambil foto');
            }
        } catch (error) {
            console.error('Error capturing photo:', error);
            Alert.alert('Error', `Gagal mengambil foto: ${error.message}`);
        }
    };

    return (
        <View style={styles.container}>
            <Camera
                ref={cameraRef}
                style={styles.camera}
                cameraType="back"
                flashMode="off"
                focusMode="on"
                zoomMode="off"
            />

            {/* Overlay untuk masking area */}
            <View style={styles.overlay}>
                {/* Top overlay */}
                <View style={[styles.overlaySection, { flex: (height - KTP_MASK_HEIGHT) / 2 }]} />

                {/* Middle section dengan mask hole */}
                <View style={styles.middleSection}>
                    {/* Left overlay */}
                    <View style={[styles.overlaySection, { width: (width - KTP_MASK_WIDTH) / 2 }]} />

                    {/* Card mask area */}
                    <View style={styles.cardMaskContainer}>
                        <View style={styles.cardMask} />

                        {/* Guidelines untuk membantu user */}
                        <View style={styles.guidelines}>
                            <View style={styles.guidelineLine} />
                            <View style={styles.guidelineText}>
                                <Text style={styles.guidelineTextStyle}>
                                    Posisikan KTP di dalam area ini
                                </Text>
                            </View>
                        </View>

                        {/* Corner indicators */}
                        <View style={[styles.corner, styles.cornerTopLeft]} />
                        <View style={[styles.corner, styles.cornerTopRight]} />
                        <View style={[styles.corner, styles.cornerBottomLeft]} />
                        <View style={[styles.corner, styles.cornerBottomRight]} />
                    </View>

                    {/* Right overlay */}
                    <View style={[styles.overlaySection, { width: (width - KTP_MASK_WIDTH) / 2 }]} />
                </View>

                {/* Bottom overlay dengan button */}
                <View style={[styles.overlaySection, { flex: (height - KTP_MASK_HEIGHT) / 2 }]}>
                    <View style={styles.bottomControls}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onCancel}
                        >
                            <Text style={styles.cancelButtonText}>Batal</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.captureButton}
                            onPress={handleTakePhoto}
                        >
                            <View style={styles.captureButtonInner} />
                        </TouchableOpacity>

                        <View style={styles.cancelButton} />
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
    },
    overlaySection: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    middleSection: {
        height: KTP_MASK_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardMaskContainer: {
        width: KTP_MASK_WIDTH,
        height: KTP_MASK_HEIGHT,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardMask: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#4F46E5',
        backgroundColor: 'transparent',
    },
    guidelines: {
        position: 'absolute',
        bottom: -30,
        alignItems: 'center',
    },
    guidelineLine: {
        width: 60,
        height: 2,
        backgroundColor: '#4F46E5',
    },
    guidelineText: {
        marginTop: 8,
    },
    guidelineTextStyle: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#4F46E5',
        borderWidth: 3,
    },
    cornerTopLeft: {
        top: -2,
        left: -2,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderTopLeftRadius: 12,
    },
    cornerTopRight: {
        top: -2,
        right: -2,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        borderTopRightRadius: 12,
    },
    cornerBottomLeft: {
        bottom: -2,
        left: -2,
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomLeftRadius: 12,
    },
    cornerBottomRight: {
        bottom: -2,
        right: -2,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderBottomRightRadius: 12,
    },
    bottomControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 40,
        paddingTop: 20,
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#ffffff',
        borderWidth: 5,
        borderColor: '#4F46E5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonInner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#4F46E5',
    },
    cancelButton: {
        padding: 10,
        width: 70,
    },
    cancelButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CameraScreen;
