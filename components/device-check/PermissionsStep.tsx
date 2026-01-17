import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shield, Camera, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react-native';
import type { PermissionStatus } from '@/types/device';

interface PermissionsStepProps {
  permissions: PermissionStatus[];
}

export default function PermissionsStep({ permissions }: PermissionsStepProps) {
  return (
    <View style={styles.stepContent}>
      <View style={styles.iconContainer}>
        <Shield size={48} color="#00ff88" />
      </View>
      <Text style={styles.stepTitle}>Camera Permission</Text>
      <Text style={styles.stepDescription}>
        Grant camera permission to detect all available cameras and their capabilities.
      </Text>

      <View style={styles.permissionsList}>
        {permissions.length === 0 ? (
          <View style={styles.waitingCard}>
            <Loader size={24} color="#00ff88" />
            <Text style={styles.waitingText}>Tap continue to request permission</Text>
          </View>
        ) : (
          permissions.map((perm, index) => (
            <View key={index} style={styles.permissionItem}>
              <View style={styles.permissionIcon}>
                <Camera size={20} color="#00ff88" />
              </View>
              <View style={styles.permissionInfo}>
                <Text style={styles.permissionName}>{perm.name}</Text>
                <Text style={[
                  styles.permissionStatus,
                  perm.status === 'granted' && styles.permissionGranted,
                  perm.status === 'denied' && styles.permissionDenied,
                ]}>
                  {perm.status.charAt(0).toUpperCase() + perm.status.slice(1)}
                </Text>
              </View>
              {perm.status === 'granted' ? (
                <CheckCircle size={20} color="#00ff88" />
              ) : perm.status === 'denied' ? (
                <XCircle size={20} color="#ff4757" />
              ) : (
                <AlertCircle size={20} color="#ffa502" />
              )}
            </View>
          ))
        )}
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
  permissionsList: {
    width: '100%',
    gap: 10,
  },
  waitingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 20,
    gap: 12,
  },
  waitingText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  permissionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,255,136,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionInfo: {
    flex: 1,
    marginLeft: 14,
  },
  permissionName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  permissionStatus: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  permissionGranted: {
    color: '#00ff88',
  },
  permissionDenied: {
    color: '#ff4757',
  },
});
