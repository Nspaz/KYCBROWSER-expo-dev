import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Camera } from 'lucide-react-native';
import type { CaptureDevice } from '@/types/device';

interface DevicesStepProps {
  captureDevices: CaptureDevice[];
  enumerationDetails: string[];
}

export default function DevicesStep({ captureDevices, enumerationDetails }: DevicesStepProps) {
  return (
    <View style={styles.stepContent}>
      <View style={styles.iconContainer}>
        <Camera size={48} color="#00ff88" />
      </View>
      <Text style={styles.stepTitle}>Camera System</Text>
      <Text style={styles.stepDescription}>
        Detected {captureDevices.length} cameras/sensors on your device.
      </Text>

      {enumerationDetails.length > 0 && (
        <View style={styles.enumerationDetailsCard}>
          <Text style={styles.enumerationTitle}>Detection Log</Text>
          {enumerationDetails.map((detail, index) => (
            <Text key={index} style={styles.enumerationDetail}>{detail}</Text>
          ))}
        </View>
      )}

      <ScrollView style={styles.devicesList} showsVerticalScrollIndicator={false}>
        {captureDevices.map((device) => (
          <View key={device.id} style={styles.deviceItem}>
            <View style={styles.deviceIcon}>
              <Camera size={22} color="#00ff88" />
            </View>
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{device.name}</Text>
              <Text style={styles.deviceId}>{device.id}</Text>
              <View style={styles.deviceBadgesRow}>
                {device.facing && (
                  <View style={styles.deviceBadge}>
                    <Text style={styles.deviceBadgeText}>{device.facing}</Text>
                  </View>
                )}
                {device.capabilities?.photoResolutions?.[0] && (
                  <View style={[styles.deviceBadge, styles.capsBadge]}>
                    <Text style={styles.deviceBadgeText}>
                      {device.capabilities.photoResolutions[0].megapixels}MP
                    </Text>
                  </View>
                )}
                {device.lensType && device.lensType !== 'standard' && device.lensType !== 'wide' && (
                  <View style={[styles.deviceBadge, styles.lensBadge]}>
                    <Text style={styles.deviceBadgeText}>{device.lensType}</Text>
                  </View>
                )}
                {device.zoomFactor && (
                  <View style={[styles.deviceBadge, styles.zoomBadge]}>
                    <Text style={styles.deviceBadgeText}>{device.zoomFactor}</Text>
                  </View>
                )}
                {device.hardwareInfo?.aperture && (
                  <View style={[styles.deviceBadge, styles.apertureBadge]}>
                    <Text style={styles.deviceBadgeText}>{device.hardwareInfo.aperture}</Text>
                  </View>
                )}
              </View>
            </View>
            {device.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>DEFAULT</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
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
  enumerationDetailsCard: {
    width: '100%',
    backgroundColor: 'rgba(0,170,255,0.08)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,170,255,0.2)',
  },
  enumerationTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#00aaff',
    marginBottom: 8,
  },
  enumerationDetail: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
  devicesList: {
    width: '100%',
    maxHeight: 280,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,255,136,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 14,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  deviceId: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 2,
  },
  deviceBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  deviceBadge: {
    backgroundColor: 'rgba(0,255,136,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  capsBadge: {
    backgroundColor: 'rgba(0,170,255,0.15)',
  },
  lensBadge: {
    backgroundColor: 'rgba(255,165,0,0.15)',
  },
  zoomBadge: {
    backgroundColor: 'rgba(138,43,226,0.15)',
  },
  apertureBadge: {
    backgroundColor: 'rgba(255,100,100,0.15)',
  },
  deviceBadgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: '#00ff88',
    textTransform: 'uppercase' as const,
  },
  defaultBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
  },
});
