import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import {
  Film,
  Trash2,
  Clock,
  HardDrive,
  Check,
  Link,
  Upload,
  Smartphone,
  Shield,
} from 'lucide-react-native';
import { formatFileSize } from '@/utils/videoManager';
import type { SavedVideo } from '@/utils/videoManager';
import { styles } from './styles';
import { formatDate } from './utils';

interface VideoListItemProps {
  video: SavedVideo;
  isSelected: boolean;
  onSelect: () => void;
  onUse: () => void;
  onCheck: () => void;
  onDelete: () => void;
}

export const VideoListItem = React.memo(function VideoListItem({
  video,
  isSelected,
  onSelect,
  onUse,
  onCheck,
  onDelete,
}: VideoListItemProps) {
  return (
    <TouchableOpacity
      style={[styles.listItem, isSelected && styles.listItemSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={styles.listThumbnail}>
        {video.thumbnailUri ? (
          <Image
            source={{ uri: video.thumbnailUri }}
            style={styles.listThumbnailImage}
            contentFit="cover"
          />
        ) : (
          <View style={styles.listThumbnailPlaceholder}>
            <Film size={20} color="rgba(255,255,255,0.3)" />
          </View>
        )}
        <View style={styles.listTypeBadge}>
          {video.sourceType === 'url' ? (
            <Link size={10} color="#00aaff" />
          ) : (
            <Upload size={10} color="#00ff88" />
          )}
        </View>
      </View>

      <View style={styles.listInfo}>
        <Text style={styles.listName} numberOfLines={1}>{video.name}</Text>
        {video.originalName !== video.name && (
          <Text style={styles.listOriginalName} numberOfLines={1}>{video.originalName}</Text>
        )}
        <View style={styles.listMeta}>
          <View style={styles.listMetaItem}>
            <HardDrive size={10} color="rgba(255,255,255,0.4)" />
            <Text style={styles.listMetaText}>{formatFileSize(video.fileSize)}</Text>
          </View>
          <View style={styles.listMetaItem}>
            <Clock size={10} color="rgba(255,255,255,0.4)" />
            <Text style={styles.listMetaText}>{formatDate(video.createdAt)}</Text>
          </View>
          {video.metadata?.aspectRatio && (
            <View style={styles.listMetaItem}>
              <Smartphone size={10} color="rgba(255,255,255,0.4)" />
              <Text style={styles.listMetaText}>{video.metadata.aspectRatio}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.listActions}>
        {isSelected ? (
          <>
            <TouchableOpacity style={styles.listUseBtn} onPress={onUse}>
              <Check size={14} color="#0a0a0a" />
              <Text style={styles.listUseBtnText}>Use</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.listCheckBtn} onPress={onCheck}>
              <Shield size={14} color="#00ff88" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.listDeleteBtn} onPress={onDelete}>
              <Trash2 size={14} color="#ff4444" />
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.listSelectHint}>Tap to select</Text>
        )}
      </View>
    </TouchableOpacity>
  );
});
