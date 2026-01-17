import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import {
  Film,
  Trash2,
  Check,
  Link,
  Upload,
  Play,
  Smartphone,
  RotateCcw,
  Shield,
} from 'lucide-react-native';
import { formatFileSize } from '@/utils/videoManager';
import type { SavedVideo } from '@/utils/videoManager';
import { styles } from './styles';
import { formatDate } from './utils';

interface VideoGridItemProps {
  video: SavedVideo;
  isSelected: boolean;
  isRegenerating: boolean;
  onSelect: () => void;
  onUse: () => void;
  onCheck: () => void;
  onRegenerate: () => void;
  onDelete: () => void;
}

export const VideoGridItem = React.memo(function VideoGridItem({
  video,
  isSelected,
  isRegenerating,
  onSelect,
  onUse,
  onCheck,
  onRegenerate,
  onDelete,
}: VideoGridItemProps) {
  const aspectRatio = video.metadata?.aspectRatio || 'unknown';
  const isPortrait = video.metadata?.isVertical === true;

  return (
    <TouchableOpacity
      style={[styles.gridItem, isSelected && styles.gridItemSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
      testID={`video-item-${video.id}`}
    >
      <View style={styles.gridThumbnail}>
        {video.thumbnailUri ? (
          <Image
            source={{ uri: video.thumbnailUri }}
            style={styles.gridThumbnailImage}
            contentFit="cover"
          />
        ) : (
          <View style={styles.gridThumbnailPlaceholder}>
            <Film size={28} color="rgba(255,255,255,0.3)" />
          </View>
        )}
        
        <View style={styles.gridOverlay}>
          <View style={styles.gridTypeBadge}>
            {video.sourceType === 'url' ? (
              <Link size={10} color="#00aaff" />
            ) : (
              <Upload size={10} color="#00ff88" />
            )}
          </View>
          
          {isPortrait && (
            <View style={styles.portraitBadge}>
              <Smartphone size={8} color="#00ff88" />
            </View>
          )}
        </View>
        
        {aspectRatio !== 'unknown' && (
          <View style={styles.aspectRatioBadge}>
            <Text style={styles.aspectRatioText}>{aspectRatio}</Text>
          </View>
        )}

        {isSelected && (
          <View style={styles.gridSelectedOverlay}>
            <Check size={24} color="#00ff88" />
          </View>
        )}
      </View>

      <View style={styles.gridInfo}>
        <Text style={styles.gridName} numberOfLines={1}>{video.name}</Text>
        <View style={styles.gridMeta}>
          <Text style={styles.gridMetaText}>{formatFileSize(video.fileSize)}</Text>
          <Text style={styles.gridMetaDot}>•</Text>
          <Text style={styles.gridMetaText}>{formatDate(video.createdAt)}</Text>
          {video.metadata?.width && video.metadata?.height && (
            <>
              <Text style={styles.gridMetaDot}>•</Text>
              <Text style={styles.gridMetaText}>{video.metadata.width}x{video.metadata.height}</Text>
            </>
          )}
        </View>
      </View>

      {isSelected && (
        <View style={styles.gridActions}>
          <TouchableOpacity style={styles.gridUseBtn} onPress={onUse}>
            <Play size={14} color="#0a0a0a" />
            <Text style={styles.gridUseBtnText}>Use</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.gridActionBtn, styles.gridCheckBtn]}
            onPress={onCheck}
          >
            <Shield size={14} color="#00ff88" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.gridActionBtn}
            onPress={onRegenerate}
            disabled={isRegenerating}
          >
            {isRegenerating ? (
              <ActivityIndicator size="small" color="#00aaff" />
            ) : (
              <RotateCcw size={14} color="#00aaff" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.gridActionBtn, styles.gridDeleteBtn]}
            onPress={onDelete}
          >
            <Trash2 size={14} color="#ff4444" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
});
