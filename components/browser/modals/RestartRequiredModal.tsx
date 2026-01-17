import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Check, AlertTriangle, RefreshCw } from 'lucide-react-native';

interface RestartRequiredModalProps {
  visible: boolean;
  onRestart: () => void;
}

export default function RestartRequiredModal({ visible, onRestart }: RestartRequiredModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Check size={40} color="#00ff88" />
          </View>
          
          <Text style={styles.title}>Video Applied Successfully</Text>
          <Text style={styles.subtitle}>
            The video has been assigned to your camera(s) and simulation mode has been automatically enabled.
          </Text>

          <View style={styles.infoBox}>
            <AlertTriangle size={18} color="#ff6b35" />
            <Text style={styles.infoText}>
              To ensure the simulated video properly replaces the camera source, the page must be refreshed.
            </Text>
          </View>

          <Text style={styles.noteText}>
            The real camera feed has been completely replaced. Websites will only see the simulated video.
          </Text>

          <TouchableOpacity style={styles.restartBtn} onPress={onRestart}>
            <RefreshCw size={18} color="#0a0a0a" />
            <Text style={styles.restartBtnText}>Refresh Page Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,255,136,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#ffffff',
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center' as const,
    marginTop: 8,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,107,53,0.1)',
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.25)',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#ff6b35',
    lineHeight: 18,
  },
  noteText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center' as const,
    marginTop: 16,
    paddingHorizontal: 10,
  },
  restartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00ff88',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 24,
    width: '100%',
  },
  restartBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#0a0a0a',
  },
});
