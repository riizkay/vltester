import React from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import ViewShot from 'react-native-view-shot';

const WatermarkImage = ({ imageUri, watermarkText, onCapture }) => {
    const viewShotRef = React.useRef(null);
    const [imageLoaded, setImageLoaded] = React.useState(false);
    const [imageDimensions, setImageDimensions] = React.useState({ width: 800, height: 600 });

    // ambil dimensi image asli
    React.useEffect(() => {
        if (imageUri) {
            Image.getSize(
                imageUri,
                (width, height) => {
                    console.log('Image dimensions:', { width, height });
                    // max width 800px untuk hasil yang compact tapi tetap bagus
                    const maxWidth = 800;
                    const aspectRatio = height / width;
                    const finalWidth = Math.min(width, maxWidth);
                    const finalHeight = finalWidth * aspectRatio;

                    setImageDimensions({ width: finalWidth, height: finalHeight });
                },
                (error) => {
                    console.error('Error getting image size:', error);
                    // fallback ke ukuran default
                    setImageDimensions({ width: 800, height: 600 });
                }
            );
        }
    }, [imageUri]);

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
                style={[styles.container, {
                    width: imageDimensions.width,
                    height: imageDimensions.height
                }]}
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
        position: 'relative',
        backgroundColor: '#000000', // background hitam agar tidak ada gap putih
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover', // cover untuk compact, tidak ada gap
    },
    watermarkContainer: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 4,
    },
    watermarkText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default WatermarkImage;