import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Camera, X } from 'lucide-react-native';
import type { DeviceTemplate } from '@/types/device';

interface TemplateInfoModalProps {
  visible: boolean;
  template: DeviceTemplate;
  onClose: () => void;
}

export default function TemplateInfoModal({ visible, template, onClose }: TemplateInfoModalProps) {
  const backCameras = template.captureDevices.filter(d => d.facing === 'back');
  const frontCameras = template.captureDevices.filter(d => d.facing === 'front');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Camera System Info</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            <View style={styles.infoSection}>
              <Text style={styles.infoSectionTitle}>Device</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Model</Text>
                <Text style={styles.infoValue}>{template.deviceInfo.model || 'Unknown'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Platform</Text>
                <Text style={styles.infoValue}>{template.deviceInfo.platform.toUpperCase()} {template.deviceInfo.osVersion}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total Cameras</Text>
                <Text style={styles.infoValue}>{template.captureDevices.length}</Text>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoSectionTitle}>Rear Cameras ({backCameras.length})</Text>
              {backCameras.map((cam) => (
                <View key={cam.id} style={styles.cameraInfoItem}>
                  <View style={styles.cameraInfoHeader}>
                    <Camera size={14} color="#00ff88" />
                    <Text style={styles.cameraInfoName}>{cam.name}</Text>
                  </View>
                  <View style={styles.cameraInfoDetails}>
                    {cam.zoomFactor && <Text style={styles.cameraInfoDetail}>Zoom: {cam.zoomFactor}</Text>}
                    {cam.hardwareInfo?.megapixels && <Text style={styles.cameraInfoDetail}>{cam.hardwareInfo.megapixels}MP</Text>}
                    {cam.hardwareInfo?.aperture && <Text style={styles.cameraInfoDetail}>{cam.hardwareInfo.aperture}</Text>}
                    {cam.lensType && <Text style={styles.cameraInfoDetail}>{cam.lensType}</Text>}
                  </View>
                  {cam.capabilities?.photoResolutions?.[0] && (
                    <Text style={styles.cameraInfoResolution}>
                      Max Photo: {cam.capabilities.photoResolutions[0].width}x{cam.capabilities.photoResolutions[0].height}
                    </Text>
                  )}
                  {cam.capabilities?.videoResolutions?.[0] && (
                    <Text style={styles.cameraInfoResolution}>
                      Max Video: {cam.capabilities.videoResolutions[0].label}
                    </Text>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoSectionTitle}>Front Cameras ({frontCameras.length})</Text>
              {frontCameras.map((cam) => (
                <View key={cam.id} style={styles.cameraInfoItem}>
                  <View style={styles.cameraInfoHeader}>
                    <Camera size={14} color="#00ff88" />
                    <Text style={styles.cameraInfoName}>{cam.name}</Text>
                  </View>
                  <View style={styles.cameraInfoDetails}>
                    {cam.hardwareInfo?.megapixels && <Text style={styles.cameraInfoDetail}>{cam.hardwareInfo.megapixels}MP</Text>}
                    {cam.hardwareInfo?.aperture && <Text style={styles.cameraInfoDetail}>{cam.hardwareInfo.aperture}</Text>}
                    {cam.lensType && <Text style={styles.cameraInfoDetail}>{cam.lensType}</Text>}
                  </View>
                </View>
              ))}
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
  cameraInfoItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  cameraInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  cameraInfoName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  cameraInfoDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  cameraInfoDetail: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cameraInfoResolution: {
    fontSize: 11,
    color: '#00aaff',
    marginTop: 2,
  },
});
