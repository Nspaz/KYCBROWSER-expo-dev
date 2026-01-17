import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Camera,
  Upload,
  FileVideo,
  Trash2,
  Info,
} from 'lucide-react-native';
import type { CaptureDevice } from '@/types/device';
import type { VideoSourceType } from '@/types/browser';

interface DeviceCardProps {
  device: CaptureDevice;
  isSelected: boolean;
  videoSourceType: VideoSourceType;
  videoUrlInput: string;
  onSelect: () => void;
  onCancel: () => void;
  onSourceTypeChange: (type: VideoSourceType) => void;
  onUrlChange: (url: string) => void;
  onApplyUrl: () => void;
  onPickVideo: () => void;
  onToggleSimulation: () => void;
  onClearVideo: () => void;
  onShowInfo: () => void;
}

export default function DeviceCard({
  device,
  isSelected,
  videoSourceType,
  videoUrlInput,
  onSelect,
  onCancel,
  onSourceTypeChange,
  onUrlChange,
  onApplyUrl,
  onPickVideo,
  onToggleSimulation,
  onClearVideo,
  onShowInfo,
}: DeviceCardProps) {
  return (
    <View style={styles.deviceCard}>
      <View style={styles.deviceCardHeader}>
        <View style={styles.deviceIconSmall}>
          <Camera size={18} color="#00ff88" />
        </View>
        <View style={styles.deviceCardInfo}>
          <Text style={styles.deviceCardName}>{device.name}</Text>
          <View style={styles.deviceCardMeta}>
            {device.zoomFactor && <Text style={styles.deviceCardMetaText}>{device.zoomFactor}</Text>}
            {device.hardwareInfo?.megapixels && <Text style={styles.deviceCardMetaText}>{device.hardwareInfo.megapixels}MP</Text>}
            {device.lensType && device.lensType !== 'wide' && <Text style={styles.deviceCardMetaText}>{device.lensType}</Text>}
          </View>
        </View>
        <TouchableOpacity style={styles.infoBtn} onPress={onShowInfo}>
          <Info size={16} color="#00aaff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.simToggle,
            device.simulationEnabled && styles.simToggleActive,
            !device.assignedVideoUri && styles.simToggleDisabled,
          ]}
          onPress={onToggleSimulation}
          disabled={!device.assignedVideoUri}
        >
          <Text style={[
            styles.simToggleText,
            device.simulationEnabled && styles.simToggleTextActive,
            !device.assignedVideoUri && styles.simToggleTextDisabled,
          ]}>
            {device.simulationEnabled ? 'SIM' : 'LIVE'}
          </Text>
        </TouchableOpacity>
      </View>

      {device.assignedVideoUri ? (
        <View style={styles.assignedVideoInfo}>
          <FileVideo size={14} color="#00ff88" />
          <Text style={styles.assignedVideoName} numberOfLines={1}>
            {device.assignedVideoName}
          </Text>
          <TouchableOpacity
            style={styles.clearVideoBtn}
            onPress={onClearVideo}
          >
            <Trash2 size={14} color="#ff4757" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.videoAssignSection}>
          <TouchableOpacity
            style={styles.assignVideoBtn}
            onPress={onPickVideo}
          >
            <Upload size={14} color="#00ff88" />
            <Text style={styles.assignVideoBtnText}>Upload Video from My Videos</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  deviceCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  deviceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIconSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,255,136,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceCardInfo: {
    flex: 1,
    marginLeft: 10,
  },
  deviceCardName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  deviceCardMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  deviceCardMetaText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  infoBtn: {
    padding: 8,
    marginRight: 4,
  },
  simToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  simToggleActive: {
    backgroundColor: '#ff6b35',
  },
  simToggleDisabled: {
    opacity: 0.4,
  },
  simToggleText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  simToggleTextActive: {
    color: '#ffffff',
  },
  simToggleTextDisabled: {
    color: 'rgba(255,255,255,0.5)',
  },
  assignedVideoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,255,136,0.08)',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    gap: 8,
  },
  assignedVideoName: {
    flex: 1,
    fontSize: 12,
    color: '#00ff88',
  },
  clearVideoBtn: {
    padding: 4,
  },
  videoAssignSection: {
    marginTop: 10,
  },
  assignVideoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,255,136,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.3)',
    borderStyle: 'dashed',
  },
  assignVideoBtnText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#00ff88',
  },
  videoSourceToggle: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  sourceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  sourceBtnActive: {
    backgroundColor: '#00ff88',
  },
  sourceBtnText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  sourceBtnTextActive: {
    color: '#0a0a0a',
  },
  uploadVideoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,255,136,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.3)',
  },
  uploadVideoBtnText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#00ff88',
  },
  urlInputRow: {
    flexDirection: 'row',
    gap: 6,
  },
  videoUrlInputSmall: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: '#ffffff',
  },
  applyUrlBtn: {
    backgroundColor: '#00ff88',
    borderRadius: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 6,
  },
  cancelBtnText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
});
