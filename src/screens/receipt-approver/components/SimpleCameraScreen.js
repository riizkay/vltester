import React, { useRef } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { Camera } from 'react-native-camera-kit';

const SimpleCameraScreen = ({ onTakePhoto, onCancel }) => {
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

            {/* Controls */}
            <View style={styles.controls}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onCancel}
                >
                    <View style={styles.cancelButtonInner}>
                        <View style={styles.cancelIcon} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.captureButton}
                    onPress={handleTakePhoto}
                >
                    <View style={styles.captureButtonInner} />
                </TouchableOpacity>

                <View style={styles.placeholderButton} />
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
    controls: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 40,
        paddingVertical: 30,
        paddingBottom: 50,
    },
    cancelButton: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButtonInner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelIcon: {
        width: 20,
        height: 3,
        backgroundColor: '#ffffff',
        borderRadius: 2,
        transform: [{ rotate: '45deg' }],
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ffffff',
        borderWidth: 5,
        borderColor: '#4F46E5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#4F46E5',
    },
    placeholderButton: {
        width: 60,
        height: 60,
    },
});

export default SimpleCameraScreen;
