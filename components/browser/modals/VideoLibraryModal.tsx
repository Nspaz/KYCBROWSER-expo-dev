import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Film, Play, Check, X } from 'lucide-react-native';
import {
  getResolutionLabel,
  formatDuration,
  type SampleVideo,
  type SampleVideoResolution,
} from '@/constants/sampleVideos';

interface VideoLibraryModalProps {
  visible: boolean;
  videos: { video: SampleVideo; resolution: SampleVideoResolution }[];
  detectedResolution: { width: number; height: number; fps: number };
  onClose: () => void;
  onSelect: (item: { video: SampleVideo; resolution: SampleVideoResolution }) => void;
  onPreview: (item: { video: SampleVideo; resolution: SampleVideoResolution }) => void;
}

export default function VideoLibraryModal({ 
  visible, 
  videos, 
  detectedResolution, 
  onClose, 
  onSelect, 
  onPreview 
}: VideoLibraryModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.libraryModalContent}>
          <View style={styles.libraryHeader}>
            <View>
              <Text style={styles.libraryTitle}>Sample Video Library</Text>
              <Text style={styles.librarySubtitle}>
                {videos.length} videos matched to {getResolutionLabel(detectedResolution.width, detectedResolution.height)}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {videos.map((item) => (
              <View key={item.video.id} style={styles.videoItem}>
                <View style={styles.videoItemIcon}>
                  <Film size={20} color="#00ff88" />
                </View>
                <View style={styles.videoItemInfo}>
                  <Text style={styles.videoItemName}>{item.video.name}</Text>
                  <Text style={styles.videoItemDesc}>{item.video.description}</Text>
                  <View style={styles.videoItemMeta}>
                    <View style={styles.videoItemBadge}>
                      <Text style={styles.videoItemBadgeText}>{item.resolution.label}</Text>
                    </View>
                    {item.video.duration && (
                      <View style={styles.videoItemBadge}>
                        <Text style={styles.videoItemBadgeText}>{formatDuration(item.video.duration)}</Text>
                      </View>
                    )}
                    {item.video.isLooping && (
                      <View style={[styles.videoItemBadge, styles.loopBadge]}>
                        <Text style={[styles.videoItemBadgeText, styles.loopBadgeText]}>LOOP</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.videoItemActions}>
                  <TouchableOpacity style={styles.previewBtnLarge} onPress={() => onPreview(item)}>
                    <Play size={16} color="#00aaff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.applyBtnLarge} onPress={() => onSelect(item)}>
                    <Check size={16} color="#0a0a0a" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
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
  modalScroll: {
    padding: 16,
  },
  libraryModalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  libraryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  libraryTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#ffffff',
  },
  librarySubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  videoItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,255,136,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  videoItemName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  videoItemDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  videoItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  videoItemBadge: {
    backgroundColor: 'rgba(0,170,255,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoItemBadgeText: {
    fontSize: 9,
    fontWeight: '600' as const,
    color: '#00aaff',
  },
  loopBadge: {
    backgroundColor: 'rgba(0,255,136,0.15)',
  },
  loopBadgeText: {
    color: '#00ff88',
  },
  videoItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewBtnLarge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,170,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnLarge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00ff88',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
