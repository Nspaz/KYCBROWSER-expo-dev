import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { CameraView } from 'expo-camera';
import { Play, Camera, CheckCircle, XCircle, ChevronRight, Loader, RotateCcw } from 'lucide-react-native';
import type { CaptureDevice } from '@/types/device';

interface TestStepProps {
  captureDevices: CaptureDevice[];
  testingDeviceId: string | null;
  showCameraPreview: boolean;
  cameraFacing: 'front' | 'back';
  onTestDevice: (device: CaptureDevice) => void;
  onTestAllDevices: () => void;
}

export default function TestStep({ 
  captureDevices, 
  testingDeviceId, 
  showCameraPreview, 
  cameraFacing,
  onTestDevice,
  onTestAllDevices,
}: TestStepProps) {
  return (
    <View style={styles.stepContent}>
      <View style={styles.iconContainer}>
        <Play size={48} color="#00ff88" />
      </View>
      <Text style={styles.stepTitle}>Test Cameras</Text>
      <Text style={styles.stepDescription}>
        Test each camera to verify functionality.
      </Text>

      {showCameraPreview && (
        <View style={styles.cameraPreview}>
          <CameraView style={styles.camera} facing={cameraFacing} />
          <View style={styles.cameraOverlay}>
            <Text style={styles.cameraOverlayText}>Testing {cameraFacing} camera...</Text>
          </View>
        </View>
      )}

      <ScrollView style={styles.devicesList} showsVerticalScrollIndicator={false}>
        {captureDevices.map((device) => (
          <TouchableOpacity
            key={device.id}
            style={[styles.testDeviceItem, testingDeviceId === device.id && styles.testDeviceItemActive]}
            onPress={() => onTestDevice(device)}
            disabled={testingDeviceId !== null}
          >
            <View style={styles.deviceIcon}>
              <Camera size={22} color="#00ff88" />
            </View>
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{device.name}</Text>
              <View style={styles.testDeviceMeta}>
                {device.zoomFactor && <Text style={styles.testDeviceMetaText}>{device.zoomFactor}</Text>}
                {device.hardwareInfo?.megapixels && <Text style={styles.testDeviceMetaText}>{device.hardwareInfo.megapixels}MP</Text>}
              </View>
              {device.tested && (
                <Text style={[
                  styles.testResultText,
                  device.testResult === 'success' && styles.testResultSuccess,
                  device.testResult === 'failed' && styles.testResultFailed,
                ]}>
                  {device.testResult === 'success' ? 'Test passed' : 'Test failed'}
                </Text>
              )}
            </View>
            {device.tested ? (
              device.testResult === 'success' ? (
                <CheckCircle size={22} color="#00ff88" />
              ) : (
                <XCircle size={22} color="#ff4757" />
              )
            ) : testingDeviceId === device.id ? (
              <Loader size={22} color="#00ff88" />
            ) : (
              <ChevronRight size={22} color="rgba(255,255,255,0.3)" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.testAllButton}
        onPress={onTestAllDevices}
        disabled={testingDeviceId !== null}
      >
        <RotateCcw size={18} color="#0a0a0a" />
        <Text style={styles.testAllButtonText}>Test All Cameras</Text>
      </TouchableOpacity>
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
  cameraPreview: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#1a1a1a',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    alignItems: 'center',
  },
  cameraOverlayText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500' as const,
  },
  devicesList: {
    width: '100%',
    maxHeight: 280,
  },
  testDeviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  testDeviceItemActive: {
    borderColor: '#00ff88',
    backgroundColor: 'rgba(0,255,136,0.08)',
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
  testDeviceMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  testDeviceMetaText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  testResultText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  testResultSuccess: {
    color: '#00ff88',
  },
  testResultFailed: {
    color: '#ff4757',
  },
  testAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    gap: 8,
    width: '100%',
  },
  testAllButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
});
