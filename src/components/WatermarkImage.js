import React from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import ViewShot from 'react-native-view-shot';

const WatermarkImage = ({ imageUri, watermarkText, onCapture }) => {
    const viewShotRef = React.useRef(null);
    const [imageLoaded, setImageLoaded] = React.useState(false);

    React.useLayoutEffect(() => {
        if (imageUri && watermarkText && onCapture && imageLoaded) {
            console.log('WatermarkImage mounted with:', { imageUri, watermarkText });

            // gunakan useLayoutEffect untuk timing yang lebih tepat
            const timer = setTimeout(() => {
                captureImage();
            }, 500); // delay untuk memastikan gambar ter-load

            return () => clearTimeout(timer);
        }
    }, [imageUri, watermarkText, imageLoaded]);

    const handleImageLoad = () => {
        console.log('Image loaded successfully');
        setImageLoaded(true);
    };

    const captureImage = async () => {
        try {
            console.log('Auto capturing watermarked image...');
            console.log('Image URI:', imageUri);
            console.log('Watermark Text:', watermarkText);

            if (viewShotRef.current) {
                const uri = await viewShotRef.current.capture();
                console.log('Captured URI:', uri);
                onCapture(uri);
            } else {
                console.error('ViewShot ref is null');
                onCapture(null);
            }
        } catch (error) {
            console.error('Error capturing watermarked image:', error);
            onCapture(null);
        }
    };

    return (
        <View style={styles.invisibleContainer}>
            <ViewShot
                ref={viewShotRef}
                options={{
                    format: 'jpg',
                    quality: 0.9,
                    fileName: `watermarked_${Date.now()}`
                }}
                style={styles.container}
            >
                <Image
                    source={{ uri: imageUri }}
                    style={styles.image}
                    onLoad={handleImageLoad}
                />
                <View style={styles.watermarkContainer}>
                    <Text style={styles.watermarkText}>{watermarkText}</Text>
                </View>
            </ViewShot>
        </View>
    );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    invisibleContainer: {
        position: 'absolute',
        top: -20000, // posisi sangat jauh di luar layar
        left: -20000,
        width: 1,
        height: 1,
        opacity: 0, // benar-benar tidak terlihat
        zIndex: -99999, // di belakang semua elemen
        pointerEvents: 'none', // tidak bisa di-interact
        overflow: 'hidden', // pastikan tidak ada overflow
    },
    container: {
        width: width * 0.8,
        height: height * 0.6,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    watermarkContainer: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 3,
    },
    watermarkText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default WatermarkImage;