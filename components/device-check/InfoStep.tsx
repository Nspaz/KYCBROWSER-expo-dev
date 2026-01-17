import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Smartphone, Cpu, Shield, Info } from 'lucide-react-native';
import type { DeviceModelInfo } from '@/types/device';

interface InfoStepProps {
  deviceInfo: DeviceModelInfo | null;
  templateName: string;
  onTemplateNameChange: (name: string) => void;
}

export default function InfoStep({ deviceInfo, templateName, onTemplateNameChange }: InfoStepProps) {
  return (
    <View style={styles.stepContent}>
      <View style={styles.iconContainer}>
        <Smartphone size={48} color="#00ff88" />
      </View>
      <Text style={styles.stepTitle}>Camera Profiling</Text>
      <Text style={styles.stepDescription}>
        This will create a detailed profile of your device&apos;s camera capabilities including all lenses, modes, and resolutions.
      </Text>

      {deviceInfo && (
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Cpu size={18} color="rgba(255,255,255,0.5)" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Platform</Text>
              <Text style={styles.infoValue}>{deviceInfo.platform.toUpperCase()} {deviceInfo.osVersion}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Smartphone size={18} color="rgba(255,255,255,0.5)" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Model</Text>
              <Text style={styles.infoValue}>{deviceInfo.model || 'Unknown'}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Info size={18} color="rgba(255,255,255,0.5)" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Device Name</Text>
              <Text style={styles.infoValue}>{deviceInfo.deviceName}</Text>
            </View>
          </View>
          {deviceInfo.brand && (
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Shield size={18} color="rgba(255,255,255,0.5)" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Brand</Text>
                <Text style={styles.infoValue}>{deviceInfo.brand}</Text>
              </View>
            </View>
          )}
        </View>
      )}

      <View style={styles.templateNameContainer}>
        <Text style={styles.inputLabel}>Template Name</Text>
        <TextInput
          style={styles.templateInput}
          value={templateName}
          onChangeText={onTemplateNameChange}
          placeholder="Enter template name"
          placeholderTextColor="rgba(255,255,255,0.3)"
        />
        <Text style={styles.templateHint}>
          Templates can be shared with devices of the same model
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
  infoCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  infoText: {
    marginLeft: 14,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '600' as const,
  },
  templateNameContainer: {
    width: '100%',
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
    fontWeight: '500' as const,
  },
  templateInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  templateHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
