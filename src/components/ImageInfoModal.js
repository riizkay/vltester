import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

const ImageInfoModal = ({ visible, onClose, infoData }) => {
    if (!infoData) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{infoData.title || 'Informasi Gambar'}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeIcon}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoContainer}>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Resolusi:</Text>
                            <Text style={styles.value}>
                                {infoData.width} x {infoData.height} px
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Ukuran File:</Text>
                            <Text style={styles.value}>
                                {infoData.fileSize} MB
                            </Text>
                        </View>

                        {infoData.hasWatermark && infoData.randomId && (
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Watermark ID:</Text>
                                <Text style={styles.value}>{infoData.randomId}</Text>
                            </View>
                        )}

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Status:</Text>
                            <Text style={styles.value}>
                                {infoData.hasWatermark ? '✓ Dengan Watermark' : 'Tanpa Watermark'}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.closeButtonBottom} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Tutup</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        width: '85%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
    },
    closeButton: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeIcon: {
        fontSize: 20,
        color: '#6b7280',
    },
    infoContainer: {
        padding: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    label: {
        fontSize: 14,
        color: '#6b7280',
        flex: 1,
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        textAlign: 'right',
        flex: 1,
    },
    closeButtonBottom: {
        backgroundColor: '#4F46E5',
        paddingVertical: 12,
        borderRadius: 8,
        margin: 20,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ImageInfoModal;
