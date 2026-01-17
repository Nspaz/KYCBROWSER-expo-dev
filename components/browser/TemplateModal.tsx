import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { X, Check, Plus } from 'lucide-react-native';
import type { DeviceTemplate } from '@/types/device';

interface TemplateModalProps {
  visible: boolean;
  templates: DeviceTemplate[];
  activeTemplateId: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
}

const TemplateModal = memo(function TemplateModal({
  visible,
  templates,
  activeTemplateId,
  onClose,
  onSelect,
  onCreateNew,
}: TemplateModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Device Templates</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.templateList}>
            {templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.templateItem,
                  activeTemplateId === template.id && styles.templateItemActive,
                ]}
                onPress={() => {
                  onSelect(template.id);
                  onClose();
                }}
              >
                <View style={styles.templateInfo}>
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateMeta}>
                    {template.captureDevices.length} cameras ({template.captureDevices.filter(d => d.facing === 'back').length} rear, {template.captureDevices.filter(d => d.facing === 'front').length} front)
                  </Text>
                </View>
                {activeTemplateId === template.id && (
                  <Check size={20} color="#00ff88" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity
            style={styles.newTemplateBtn}
            onPress={() => {
              onClose();
              onCreateNew();
            }}
          >
            <Plus size={18} color="#0a0a0a" />
            <Text style={styles.newTemplateBtnText}>Create New Template</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

export default TemplateModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#ffffff',
  },
  templateList: {
    maxHeight: 300,
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  templateItemActive: {
    borderColor: '#00ff88',
    backgroundColor: 'rgba(0,255,136,0.08)',
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  templateMeta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  newTemplateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00ff88',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 12,
  },
  newTemplateBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#0a0a0a',
  },
});
