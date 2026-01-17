import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  Smartphone,
  Shield,
  ChevronRight,
  AlertTriangle,
  Scan,
  Cpu,
} from 'lucide-react-native';
import { router } from 'expo-router';
import type { DeviceModelInfo, DeviceTemplate } from '@/types/device';

interface SetupRequiredProps {
  currentDeviceInfo: DeviceModelInfo | null;
  templates: DeviceTemplate[];
  isLoading: boolean;
}

export default function SetupRequired({
  currentDeviceInfo,
  templates,
  isLoading,
}: SetupRequiredProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [fadeAnim, slideAnim, pulseAnim]);

  const handleStartSetup = () => {
    console.log('[SetupRequired] Navigating to device check');
    router.push('/device-check');
  };

  const similarTemplates = templates.filter(t => 
    t.deviceInfo.platform === currentDeviceInfo?.platform
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.iconContainer,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <View style={styles.iconInner}>
                <Camera size={56} color="#00ff88" />
              </View>
              <View style={styles.alertBadge}>
                <AlertTriangle size={18} color="#0a0a0a" />
              </View>
            </Animated.View>

            <Text style={styles.title}>Device Setup Required</Text>
            <Text style={styles.subtitle}>
              Before using the browser, your device&apos;s camera system must be profiled to ensure accurate simulation.
            </Text>

            {currentDeviceInfo && (
              <View style={styles.deviceInfoCard}>
                <View style={styles.deviceInfoHeader}>
                  <Smartphone size={18} color="#00ff88" />
                  <Text style={styles.deviceInfoTitle}>Your Device</Text>
                </View>
                <View style={styles.deviceInfoRow}>
                  <Text style={styles.deviceInfoLabel}>Model</Text>
                  <Text style={styles.deviceInfoValue}>
                    {currentDeviceInfo.model || currentDeviceInfo.deviceName}
                  </Text>
                </View>
                <View style={styles.deviceInfoRow}>
                  <Text style={styles.deviceInfoLabel}>Platform</Text>
                  <Text style={styles.deviceInfoValue}>
                    {currentDeviceInfo.platform.toUpperCase()} {currentDeviceInfo.osVersion}
                  </Text>
                </View>
                {currentDeviceInfo.brand && (
                  <View style={styles.deviceInfoRow}>
                    <Text style={styles.deviceInfoLabel}>Brand</Text>
                    <Text style={styles.deviceInfoValue}>{currentDeviceInfo.brand}</Text>
                  </View>
                )}
              </View>
            )}

            {similarTemplates.length > 0 && (
              <View style={styles.existingTemplatesCard}>
                <View style={styles.existingTemplatesHeader}>
                  <Cpu size={14} color="#ffa502" />
                  <Text style={styles.existingTemplatesTitle}>
                    {similarTemplates.length} Similar Template{similarTemplates.length > 1 ? 's' : ''} Found
                  </Text>
                </View>
                <Text style={styles.existingTemplatesHint}>
                  None match your exact device model. Create a new profile for best results.
                </Text>
              </View>
            )}

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Scan size={16} color="#00aaff" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Camera Detection</Text>
                  <Text style={styles.featureDesc}>Identifies all cameras, lenses, and modes</Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Shield size={16} color="#00aaff" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Resolution Mapping</Text>
                  <Text style={styles.featureDesc}>Maps supported photo & video resolutions</Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Camera size={16} color="#00aaff" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Capability Testing</Text>
                  <Text style={styles.featureDesc}>Tests each camera for functionality</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
        
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartSetup}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Start Camera Check</Text>
            <ChevronRight size={20} color="#0a0a0a" />
          </TouchableOpacity>
          <Text style={styles.timeEstimate}>Takes about 2-3 minutes</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0,255,136,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  iconInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0,255,136,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,255,136,0.3)',
  },
  alertBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffa502',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0a0a0a',
  },
  title: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  deviceInfoCard: {
    width: '100%',
    backgroundColor: 'rgba(0,255,136,0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.2)',
  },
  deviceInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  deviceInfoTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#00ff88',
  },
  deviceInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  deviceInfoLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  deviceInfoValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  existingTemplatesCard: {
    width: '100%',
    backgroundColor: 'rgba(255,165,2,0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,165,2,0.25)',
  },
  existingTemplatesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  existingTemplatesTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#ffa502',
  },
  existingTemplatesHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginLeft: 22,
  },
  featuresList: {
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 14,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,170,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    marginLeft: 14,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  featureDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#00ff88',
    borderRadius: 14,
    paddingVertical: 18,
    gap: 8,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#0a0a0a',
  },
  timeEstimate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 10,
    textAlign: 'center',
  },
});
