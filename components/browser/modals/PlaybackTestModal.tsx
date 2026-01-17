import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Check, XCircle, AlertTriangle, RefreshCw } from 'lucide-react-native';

interface PlaybackTestModalProps {
  visible: boolean;
  status: 'testing' | 'success' | 'failed';
  error: string | null;
  videoUrl: string;
  onClose: () => void;
  onRetry: () => void;
}

export default function PlaybackTestModal({ 
  visible, 
  status, 
  error, 
  videoUrl, 
  onClose, 
  onRetry 
}: PlaybackTestModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {status === 'testing' && (
            <>
              <View style={styles.iconContainer}>
                <ActivityIndicator size="large" color="#00ff88" />
              </View>
              <Text style={styles.title}>Testing Video Playback</Text>
              <Text style={styles.subtitle}>
                Verifying the video can be played in the webview...
              </Text>
              <View style={styles.urlBox}>
                <Text style={styles.urlText} numberOfLines={2}>{videoUrl}</Text>
              </View>
            </>
          )}
          
          {status === 'success' && (
            <>
              <View style={[styles.iconContainer, styles.successIcon]}>
                <Check size={40} color="#00ff88" />
              </View>
              <Text style={styles.title}>Video Playback Verified</Text>
              <Text style={styles.subtitle}>
                The video is compatible and ready for simulation
              </Text>
            </>
          )}
          
          {status === 'failed' && (
            <>
              <View style={[styles.iconContainer, styles.errorIcon]}>
                <XCircle size={40} color="#ff4757" />
              </View>
              <Text style={styles.title}>Playback Test Failed</Text>
              <Text style={styles.subtitle}>
                This video cannot be played in the webview
              </Text>
              
              {error && (
                <View style={styles.errorBox}>
                  <AlertTriangle size={16} color="#ff6b35" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              
              <View style={styles.tipsBox}>
                <Text style={styles.tipsTitle}>Recommended Video Sources:</Text>
                <Text style={styles.tipText}>• catbox.moe - Free, CORS-friendly hosting</Text>
                <Text style={styles.tipText}>• Use .webm or .mp4 files directly</Text>
                <Text style={styles.tipText}>• Videos must be in 9:16 portrait format</Text>
                <Text style={styles.tipText}>• Avoid streaming URLs (YouTube, etc.)</Text>
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
                  <RefreshCw size={16} color="#ffffff" />
                  <Text style={styles.retryBtnText}>Retry</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Text style={styles.closeBtnText}>Try Different Video</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
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
    backgroundColor: 'rgba(0,255,136,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successIcon: {
    backgroundColor: 'rgba(0,255,136,0.15)',
  },
  errorIcon: {
    backgroundColor: 'rgba(255,71,87,0.15)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#ffffff',
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center' as const,
    marginTop: 6,
    lineHeight: 18,
  },
  urlBox: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    width: '100%',
  },
  urlText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center' as const,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(255,107,53,0.1)',
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.25)',
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#ff6b35',
    lineHeight: 18,
  },
  tipsBox: {
    backgroundColor: 'rgba(0,170,255,0.08)',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#00aaff',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    width: '100%',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  closeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#ff6b35',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#ffffff',
  },
});
