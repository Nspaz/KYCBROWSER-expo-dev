import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { AlertTriangle, XCircle, RefreshCw } from 'lucide-react-native';
import { type VideoValidationResult, DEFAULT_VALIDATION_CONFIG } from '@/utils/videoValidation';

interface VideoValidationModalProps {
  visible: boolean;
  isValidating: boolean;
  validationResult: VideoValidationResult | null;
  videoUrl: string;
  onClose: () => void;
  onRetry: () => void;
}

export default function VideoValidationModal({ 
  visible, 
  isValidating, 
  validationResult, 
  videoUrl,
  onClose,
  onRetry,
}: VideoValidationModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {isValidating ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00ff88" />
              <Text style={styles.loadingTitle}>Validating Video</Text>
              <Text style={styles.loadingSubtitle}>Checking format, size, and duration...</Text>
            </View>
          ) : validationResult && !validationResult.isValid ? (
            <>
              <View style={styles.errorHeader}>
                <View style={styles.errorIconContainer}>
                  <XCircle size={32} color="#ff4757" />
                </View>
                <Text style={styles.errorTitle}>Video Not Compatible</Text>
                <Text style={styles.errorSubtitle}>This video cannot be used for camera simulation</Text>
              </View>

              <View style={styles.errorList}>
                {validationResult.errors.map((error, index) => (
                  <View key={index} style={styles.errorItem}>
                    <AlertTriangle size={16} color="#ff6b35" />
                    <View style={styles.errorItemInfo}>
                      <Text style={styles.errorItemTitle}>{error.message}</Text>
                      {error.details && (
                        <Text style={styles.errorItemDetails}>{error.details}</Text>
                      )}
                      {error.currentValue && error.requiredValue && (
                        <View style={styles.errorValues}>
                          <Text style={styles.errorValueText}>Got: {error.currentValue}</Text>
                          <Text style={styles.errorValueText}>Required: {error.requiredValue}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.requirementsBox}>
                <Text style={styles.requirementsTitle}>Video Requirements</Text>
                <Text style={styles.requirementsText}>• Maximum duration: {DEFAULT_VALIDATION_CONFIG.maxDurationSeconds}s ({Math.floor(DEFAULT_VALIDATION_CONFIG.maxDurationSeconds / 60)}min)</Text>
                <Text style={styles.requirementsText}>• Maximum file size: {DEFAULT_VALIDATION_CONFIG.maxFileSizeMB}MB</Text>
                <Text style={styles.requirementsText}>• Formats: {DEFAULT_VALIDATION_CONFIG.allowedFormats.join(', ')}</Text>
                <Text style={styles.requirementsText}>• Min resolution: {DEFAULT_VALIDATION_CONFIG.minWidth}x{DEFAULT_VALIDATION_CONFIG.minHeight}</Text>
                <Text style={styles.requirementsText}>• Any aspect ratio accepted</Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
                  <RefreshCw size={16} color="#ffffff" />
                  <Text style={styles.retryBtnText}>Retry</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Text style={styles.closeBtnText}>Choose Different Video</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#ffffff',
    marginTop: 16,
  },
  loadingSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 6,
  },
  errorHeader: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  errorIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,71,87,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#ffffff',
  },
  errorSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
    textAlign: 'center' as const,
  },
  errorList: {
    padding: 16,
    gap: 12,
  },
  errorItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,107,53,0.1)',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.2)',
  },
  errorItemInfo: {
    flex: 1,
  },
  errorItemTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  errorItemDetails: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  errorValues: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  errorValueText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requirementsBox: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(0,170,255,0.1)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,170,255,0.2)',
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#00aaff',
    marginBottom: 8,
  },
  requirementsText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
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
