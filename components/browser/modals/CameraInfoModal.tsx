import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Video, Maximize, Check, X } from 'lucide-react-native';
import type { CaptureDevice, CameraCapabilities } from '@/types/device';

interface CameraInfoModalProps {
  visible: boolean;
  camera: CaptureDevice | null;
  onClose: () => void;
}

function FeatureBadge({ label, active }: { label: string; active: boolean }) {
  if (!active) return null;
  return (
    <View style={styles.featureBadge}>
      <Check size={10} color="#00ff88" />
      <Text style={styles.featureBadgeText}>{label}</Text>
    </View>
  );
}

export default function CameraInfoModal({ visible, camera, onClose }: CameraInfoModalProps) {
  if (!camera) return null;

  const caps = camera.capabilities as CameraCapabilities | undefined;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{camera.name}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            <View style={styles.infoSection}>
              <Text style={styles.infoSectionTitle}>Hardware Info</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Lens Type</Text>
                <Text style={styles.infoValue}>{camera.lensType}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Facing</Text>
                <Text style={styles.infoValue}>{camera.facing}</Text>
              </View>
              {camera.zoomFactor && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Zoom Factor</Text>
                  <Text style={styles.infoValue}>{camera.zoomFactor}</Text>
                </View>
              )}
              {camera.equivalentFocalLength && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Focal Length</Text>
                  <Text style={styles.infoValue}>{camera.equivalentFocalLength}</Text>
                </View>
              )}
              {camera.hardwareInfo?.megapixels && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Megapixels</Text>
                  <Text style={styles.infoValue}>{camera.hardwareInfo.megapixels}MP</Text>
                </View>
              )}
              {camera.hardwareInfo?.aperture && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Aperture</Text>
                  <Text style={styles.infoValue}>{camera.hardwareInfo.aperture}</Text>
                </View>
              )}
              {camera.hardwareInfo?.sensorModel && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Sensor</Text>
                  <Text style={styles.infoValue}>{camera.hardwareInfo.sensorModel}</Text>
                </View>
              )}
            </View>

            {caps?.photoResolutions && caps.photoResolutions.length > 0 && (
              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>Photo Resolutions</Text>
                {caps.photoResolutions.map((res, idx) => (
                  <View key={idx} style={styles.resolutionItem}>
                    <Maximize size={12} color="#00aaff" />
                    <Text style={styles.resolutionText}>{res.label}</Text>
                    <Text style={styles.resolutionDims}>{res.width}x{res.height}</Text>
                  </View>
                ))}
              </View>
            )}

            {caps?.videoResolutions && caps.videoResolutions.length > 0 && (
              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>Video Resolutions</Text>
                {caps.videoResolutions.map((res, idx) => (
                  <View key={idx} style={styles.resolutionItem}>
                    <Video size={12} color="#ff6b35" />
                    <Text style={styles.resolutionText}>{res.label}</Text>
                    <Text style={styles.resolutionDims}>{res.maxFps}fps</Text>
                  </View>
                ))}
              </View>
            )}

            {caps?.supportedModes && caps.supportedModes.length > 0 && (
              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>Supported Modes</Text>
                <View style={styles.modesContainer}>
                  {caps.supportedModes.map((mode, idx) => (
                    <View key={idx} style={styles.modeBadge}>
                      <Text style={styles.modeBadgeText}>{mode}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.infoSection}>
              <Text style={styles.infoSectionTitle}>Features</Text>
              <View style={styles.featuresGrid}>
                {caps?.hasOIS && <FeatureBadge label="OIS" active />}
                {caps?.hasAutoFocus && <FeatureBadge label="AutoFocus" active />}
                {caps?.hasFlash && <FeatureBadge label="Flash" active />}
                {caps?.supportsHDR && <FeatureBadge label="HDR" active />}
                {caps?.supportsNightMode && <FeatureBadge label="Night Mode" active />}
                {caps?.supportsPortrait && <FeatureBadge label="Portrait" active />}
                {caps?.supportsCinematic && <FeatureBadge label="Cinematic" active />}
                {caps?.supportsProRAW && <FeatureBadge label="ProRAW" active />}
                {caps?.supportsProRes && <FeatureBadge label="ProRes" active />}
                {caps?.supportsSlowMo && <FeatureBadge label="SlowMo" active />}
                {caps?.supportsMacro && <FeatureBadge label="Macro" active />}
                {caps?.supportsLivePhoto && <FeatureBadge label="Live Photo" active />}
              </View>
            </View>
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
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#ffffff',
  },
  modalScroll: {
    padding: 16,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoSectionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#00ff88',
    marginBottom: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  infoLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  resolutionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  resolutionText: {
    flex: 1,
    fontSize: 12,
    color: '#ffffff',
  },
  resolutionDims: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  modesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modeBadge: {
    backgroundColor: 'rgba(0,255,136,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modeBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#00ff88',
    textTransform: 'capitalize' as const,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,255,136,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.2)',
  },
  featureBadgeText: {
    fontSize: 10,
    color: '#00ff88',
  },
});
