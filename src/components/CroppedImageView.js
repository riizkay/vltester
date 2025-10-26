import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import ViewShot from 'react-native-view-shot';

const CroppedImageView = ({ imageUri, cropParams, onCapture }) => {
    const viewShotRef = React.useRef(null);
    const [imageLoaded, setImageLoaded] = React.useState(false);
    const { cropX, cropY, cropWidth, cropHeight, imageWidth, imageHeight } = cropParams;

    // Calculate dimensions for the ViewShot
    // ViewShot will capture only the visible portion (due to overflow: 'hidden')
    const viewShotWidth = cropWidth;
    const viewShotHeight = cropHeight;

    React.useLayoutEffect(() => {
        if (imageUri && imageLoaded && onCapture) {
            console.log('CroppedImageView ready to capture');
            const timer = setTimeout(() => {
                captureCroppedImage();
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [imageUri, imageLoaded]);

    const handleImageLoad = () => {
        console.log('Image loaded in CroppedImageView');
        setImageLoaded(true);
    };

    const captureCroppedImage = async () => {
        try {
            console.log('Capturing cropped image...');
            console.log('Crop params:', { cropX, cropY, cropWidth, cropHeight });

            if (viewShotRef.current) {
                const uri = await viewShotRef.current.capture();
                console.log('Captured cropped image URI:', uri);
                onCapture(uri);
            } else {
                console.error('ViewShot ref is null');
                onCapture(null);
            }
        } catch (error) {
            console.error('Error capturing cropped image:', error);
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
                    fileName: `cropped_${Date.now()}`
                }}
                style={[
                    styles.container,
                    {
                        width: viewShotWidth,
                        height: viewShotHeight
                    }
                ]}
            >
                <View
                    style={[
                        styles.imageContainer,
                        {
                            width: imageWidth,
                            height: imageHeight,
                            marginLeft: -cropX,
                            marginTop: -cropY
                        }
                    ]}
                >
                    <Image
                        source={{ uri: imageUri }}
                        style={styles.image}
                        onLoad={handleImageLoad}
                    />
                </View>
            </ViewShot>
        </View>
    );
};

const styles = StyleSheet.create({
    invisibleContainer: {
        position: 'absolute',
        top: -20000,
        left: -20000,
        width: 1,
        height: 1,
        opacity: 0,
        zIndex: -99999,
        pointerEvents: 'none',
        overflow: 'hidden',
    },
    container: {
        overflow: 'hidden',
        backgroundColor: '#000000',
    },
    imageContainer: {
        position: 'absolute',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
});

export default CroppedImageView;
