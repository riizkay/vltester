import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import ImageInfoModal from './ImageInfoModal';

const ImagePreviewModal = ({
    visible,
    onClose,
    imageUri,
    title = 'Preview Gambar',
    showHeader = true,
    showFooter = true,
    infoData = null,
}) => {
    const [showInfoModal, setShowInfoModal] = useState(false);
    if (!imageUri) return null;

    const images = [{
        url: imageUri,
        props: {
            source: { uri: imageUri }
        }
    }];

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.modalContainer}>
                {showHeader && (
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{title}</Text>
                        {infoData ? (
                            <TouchableOpacity 
                                style={styles.infoButton} 
                                onPress={() => setShowInfoModal(true)}
                            >
                                <Text style={styles.infoButtonText}>ℹ️</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.placeholder} />
                        )}
                    </View>
                )}

                <View style={styles.imageContainer}>
                    <ImageViewer
                        imageUrls={images}
                        enableSwipeDown={true}
                        onSwipeDown={onClose}
                        renderIndicator={() => null}
                        backgroundColor="rgba(0,0,0,0.9)"
                        saveToLocalByLongPress={false}
                        style={styles.imageViewer}
                    />
                </View>

                {showFooter && (
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.actionButton} onPress={onClose}>
                            <Text style={styles.actionButtonText}>Tutup</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Info Modal */}
                <ImageInfoModal
                    visible={showInfoModal}
                    onClose={() => setShowInfoModal(false)}
                    infoData={infoData}
                />
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    closeButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerTitle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    placeholder: {
        width: 40,
    },
    infoButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoButtonText: {
        fontSize: 20,
    },
    imageContainer: {
        flex: 1,
    },
    imageViewer: {
        flex: 1,
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'rgba(0,0,0,0.8)',
        alignItems: 'center',
    },
    actionButton: {
        backgroundColor: '#4F46E5',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
    },
    actionButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ImagePreviewModal;
