import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  CheckCircle,
  Check,
  AlertTriangle,
  XCircle,
  Shield,
  Info,
  Wrench,
} from 'lucide-react-native';
import type { CompatibilityResult, CompatibilityCheckItem, CompatibilityStatus } from '@/utils/videoCompatibilityChecker';
import { getStatusColor, getOverallStatusMessage, IDEAL_WEBCAM_SPECS } from '@/utils/videoCompatibilityChecker';

interface CompatibilityCheckModalProps {
  visible: boolean;
  onClose: () => void;
  result: CompatibilityResult | null;
  isChecking: boolean;
  videoName?: string;
  onApply?: () => void;
}

const StatusIcon = ({ status, size = 18 }: { status: CompatibilityStatus; size?: number }) => {
  const color = getStatusColor(status);
  
  switch (status) {
    case 'perfect':
      return <CheckCircle size={size} color={color} />;
    case 'compatible':
      return <Check size={size} color={color} />;
    case 'warning':
      return <AlertTriangle size={size} color={color} />;
    case 'incompatible':
      return <XCircle size={size} color={color} />;
    default:
      return <Info size={size} color="#888" />;
  }
};

const CheckItemRow = ({ item }: { item: CompatibilityCheckItem }) => {
  const statusColor = getStatusColor(item.status);
  
  return (
    <View style={styles.checkItem}>
      <View style={styles.checkItemHeader}>
        <View style={styles.checkItemLeft}>
          <StatusIcon status={item.status} size={16} />
          <Text style={styles.checkItemName}>{item.name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
          <Text style={[styles.statusBadgeText, { color: statusColor }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.checkItemValues}>
        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>Current:</Text>
          <Text style={[styles.valueText, { color: statusColor }]}>{item.currentValue}</Text>
        </View>
        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>Ideal:</Text>
          <Text style={styles.valueText}>{item.idealValue}</Text>
        </View>
      </View>
      
      <Text style={styles.checkItemMessage}>{item.message}</Text>
      
      {item.fixSuggestion && (
        <View style={styles.fixSuggestion}>
          <Wrench size={12} color="#ffaa00" />
          <Text style={styles.fixSuggestionText}>{item.fixSuggestion}</Text>
        </View>
      )}
    </View>
  );
};

export default function CompatibilityCheckModal({
  visible,
  onClose,
  result,
  isChecking,
  videoName,
  onApply,
}: CompatibilityCheckModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Shield size={20} color="#00ff88" />
              <Text style={styles.title}>Compatibility Check</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {videoName && (
            <Text style={styles.videoName} numberOfLines={1}>{videoName}</Text>
          )}
          
          {isChecking ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00ff88" />
              <Text style={styles.loadingText}>Analyzing video...</Text>
              <Text style={styles.loadingSubtext}>Checking against ideal specifications</Text>
            </View>
          ) : result ? (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={[styles.overallStatus, { borderColor: getStatusColor(result.overallStatus) }]}>
                <View style={styles.overallStatusHeader}>
                  <StatusIcon status={result.overallStatus} size={32} />
                  <View style={styles.overallStatusText}>
                    <Text style={[styles.overallStatusTitle, { color: getStatusColor(result.overallStatus) }]}>
                      {getOverallStatusMessage(result.overallStatus)}
                    </Text>
                    <Text style={styles.overallStatusScore}>Score: {result.score}%</Text>
                  </View>
                </View>
                <Text style={styles.overallStatusSummary}>{result.summary}</Text>
                
                {result.readyForSimulation ? (
                  <View style={styles.readyBadge}>
                    <CheckCircle size={14} color="#00ff88" />
                    <Text style={styles.readyBadgeText}>Ready for simulation</Text>
                  </View>
                ) : (
                  <View style={[styles.readyBadge, styles.notReadyBadge]}>
                    <XCircle size={14} color="#ff4444" />
                    <Text style={[styles.readyBadgeText, styles.notReadyText]}>
                      Requires modification
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.specsReference}>
                <Text style={styles.specsTitle}>Ideal Specifications</Text>
                <View style={styles.specsGrid}>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Resolution</Text>
                    <Text style={styles.specValue}>{IDEAL_WEBCAM_SPECS.width}x{IDEAL_WEBCAM_SPECS.height}</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Aspect Ratio</Text>
                    <Text style={styles.specValue}>{IDEAL_WEBCAM_SPECS.aspectRatio}</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Format</Text>
                    <Text style={styles.specValue}>{IDEAL_WEBCAM_SPECS.format.toUpperCase()}</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Max Size</Text>
                    <Text style={styles.specValue}>{IDEAL_WEBCAM_SPECS.maxFileSizeMB}MB</Text>
                  </View>
                </View>
              </View>
              
              <Text style={styles.sectionTitle}>Detailed Analysis</Text>
              
              {result.items.map((item, index) => (
                <CheckItemRow key={index} item={item} />
              ))}
              
              {result.modifications.length > 0 && (
                <View style={styles.modificationsSection}>
                  <Text style={styles.modificationsTitle}>Required Modifications</Text>
                  {result.modifications.map((mod, index) => (
                    <View key={index} style={styles.modificationItem}>
                      <Text style={styles.modificationNumber}>{index + 1}.</Text>
                      <Text style={styles.modificationText}>{mod}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              <View style={styles.bottomPadding} />
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Info size={48} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyText}>No results available</Text>
            </View>
          )}
          
          <View style={styles.bottomButtons}>
            {result && result.readyForSimulation && onApply ? (
              <>
                <TouchableOpacity style={styles.closeBtn2} onPress={onClose}>
                  <Text style={styles.closeBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyBtn} onPress={onApply}>
                  <CheckCircle size={16} color="#0a0a0a" />
                  <Text style={styles.applyBtnText}>Apply to Cameras</Text>
                </TouchableOpacity>
              </>
            ) : result && !result.readyForSimulation ? (
              <TouchableOpacity style={styles.notCompatibleBtn} onPress={onClose}>
                <XCircle size={16} color="#ff4444" />
                <Text style={styles.notCompatibleBtnText}>Video Not Compatible - Fix & Re-upload</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
  },
  closeBtn: {
    padding: 8,
  },
  videoName: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  loadingSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  overallStatus: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    marginBottom: 16,
  },
  overallStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  overallStatusText: {
    flex: 1,
  },
  overallStatusTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  overallStatusScore: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  overallStatusSummary: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
    marginBottom: 12,
  },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,255,136,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  notReadyBadge: {
    backgroundColor: 'rgba(255,68,68,0.15)',
  },
  readyBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#00ff88',
  },
  notReadyText: {
    color: '#ff4444',
  },
  specsReference: {
    backgroundColor: 'rgba(0,170,255,0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  specsTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#00aaff',
    marginBottom: 10,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    padding: 10,
  },
  specLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 2,
    textTransform: 'uppercase' as const,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 12,
  },
  checkItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  checkItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  checkItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkItemName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  checkItemValues: {
    gap: 4,
    marginBottom: 8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    width: 60,
  },
  valueText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500' as const,
  },
  checkItemMessage: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 18,
  },
  fixSuggestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 10,
    backgroundColor: 'rgba(255,170,0,0.1)',
    padding: 10,
    borderRadius: 8,
  },
  fixSuggestionText: {
    flex: 1,
    fontSize: 12,
    color: '#ffaa00',
    lineHeight: 18,
  },
  modificationsSection: {
    backgroundColor: 'rgba(255,68,68,0.1)',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
  },
  modificationsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#ff4444',
    marginBottom: 12,
  },
  modificationItem: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  modificationNumber: {
    fontSize: 13,
    color: '#ff4444',
    fontWeight: '600' as const,
    width: 20,
  },
  modificationText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  bottomPadding: {
    height: 20,
  },
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
  },
  doneBtn: {
    flex: 1,
    backgroundColor: '#00ff88',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#0a0a0a',
  },
  closeBtn2: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  applyBtn: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: '#00ff88',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  applyBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#0a0a0a',
  },
  notCompatibleBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,68,68,0.15)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.3)',
  },
  notCompatibleBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#ff4444',
  },
});
