import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import { Check, X } from 'lucide-react-native';
import { formatDuration, type SampleVideo, type SampleVideoResolution } from '@/constants/sampleVideos';

interface VideoPreviewModalProps {
  visible: boolean;
  videoItem: { video: SampleVideo; resolution: SampleVideoResolution } | null;
  isLoading: boolean;
  onLoadStart: () => void;
  onLoad: () => void;
  onClose: () => void;
  onApply: () => void;
}

export default function VideoPreviewModal({ 
  visible, 
  videoItem, 
  isLoading, 
  onLoadStart, 
  onLoad, 
  onClose, 
  onApply 
}: VideoPreviewModalProps) {
  if (!videoItem) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.previewModalContent}>
          <View style={styles.previewHeader}>
            <View>
              <Text style={styles.previewTitle}>{videoItem.video.name}</Text>
              <Text style={styles.previewResolution}>{videoItem.resolution.label}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.videoContainer}>
            <ExpoVideo
              source={{ uri: videoItem.resolution.url }}
              style={styles.videoPlayer}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping={videoItem.video.isLooping}
              onLoadStart={onLoadStart}
              onLoad={onLoad}
            />
            {isLoading && (
              <View style={styles.videoLoadingOverlay}>
                <ActivityIndicator size="large" color="#00ff88" />
                <Text style={styles.videoLoadingText}>Loading video...</Text>
              </View>
            )}
          </View>

          <View style={styles.previewDetails}>
            <View style={styles.previewDetailRow}>
              <Text style={styles.previewDetailLabel}>Resolution</Text>
              <Text style={styles.previewDetailValue}>{videoItem.resolution.width}x{videoItem.resolution.height}</Text>
            </View>
            <View style={styles.previewDetailRow}>
              <Text style={styles.previewDetailLabel}>Frame Rate</Text>
              <Text style={styles.previewDetailValue}>{videoItem.resolution.fps} fps</Text>
            </View>
            {videoItem.video.duration && (
              <View style={styles.previewDetailRow}>
                <Text style={styles.previewDetailLabel}>Duration</Text>
                <Text style={styles.previewDetailValue}>{formatDuration(videoItem.video.duration)}</Text>
              </View>
            )}
            {videoItem.resolution.fileSize && (
              <View style={styles.previewDetailRow}>
                <Text style={styles.previewDetailLabel}>File Size</Text>
                <Text style={styles.previewDetailValue}>{videoItem.resolution.fileSize}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.previewApplyBtn} onPress={onApply}>
            <Check size={18} color="#0a0a0a" />
            <Text style={styles.previewApplyBtnText}>Apply to All Cameras</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  previewModalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#ffffff',
  },
  previewResolution: {
    fontSize: 12,
    color: '#00aaff',
    marginTop: 2,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: 16,
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  videoLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoLoadingText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
  },
  previewDetails: {
    padding: 16,
  },
  previewDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  previewDetailLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  previewDetailValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  previewApplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00ff88',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  previewApplyBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#0a0a0a',
  },
});
