import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle, Info } from 'lucide-react-native';
import type { DeviceModelInfo, CaptureDevice, PermissionStatus } from '@/types/device';

interface CompleteStepProps {
  templateName: string;
  deviceInfo: DeviceModelInfo | null;
  captureDevices: CaptureDevice[];
  permissions: PermissionStatus[];
}

export default function CompleteStep({ 
  templateName, 
  deviceInfo, 
  captureDevices, 
  permissions 
}: CompleteStepProps) {
  return (
    <View style={styles.stepContent}>
      <View style={[styles.iconContainer, styles.iconContainerSuccess]}>
        <CheckCircle size={48} color="#00ff88" />
      </View>
      <Text style={styles.stepTitle}>Profile Complete!</Text>
      <Text style={styles.stepDescription}>
        Your camera profile has been saved with all lenses, modes, and capabilities.
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>{templateName}</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Model</Text>
          <Text style={styles.summaryValue}>{deviceInfo?.model || 'Unknown'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Cameras</Text>
          <Text style={styles.summaryValue}>{captureDevices.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Rear Cameras</Text>
          <Text style={styles.summaryValue}>{captureDevices.filter(d => d.facing === 'back').length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Front Cameras</Text>
          <Text style={styles.summaryValue}>{captureDevices.filter(d => d.facing === 'front').length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Permissions</Text>
          <Text style={styles.summaryValue}>{permissions.filter(p => p.status === 'granted').length}/{permissions.length} granted</Text>
        </View>
      </View>

      <View style={styles.shareableNote}>
        <Info size={16} color="#00aaff" />
        <Text style={styles.shareableNoteText}>
          This template can be used on any {deviceInfo?.model || 'similar'} device
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0,255,136,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(0,255,136,0.3)',
  },
  iconContainerSuccess: {
    backgroundColor: 'rgba(0,255,136,0.15)',
    borderColor: '#00ff88',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: 'rgba(0,255,136,0.08)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.3)',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#00ff88',
  },
  shareableNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0,170,255,0.08)',
    borderRadius: 10,
  },
  shareableNoteText: {
    fontSize: 13,
    color: '#00aaff',
    flex: 1,
  },
});
