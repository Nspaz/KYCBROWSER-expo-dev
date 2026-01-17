import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import {
  Sliders,
  ChevronDown,
  ChevronUp,
  Activity,
  Smartphone,
  Camera,
  Radio,
} from 'lucide-react-native';
import type { AccelerometerData, GyroscopeData } from '@/hooks/useMotionSensors';
import type { SimulationConfig, SimulationPattern } from '@/types/browser';
import { PATTERN_PRESETS } from '@/constants/motionPatterns';

interface MotionPanelProps {
  showPanel: boolean;
  panelHeight: Animated.Value;
  activeTab: 'motion' | 'devices' | 'monitor';
  simulationActive: boolean;
  useRealSensors: boolean;
  hasSimulatedDevices: boolean;
  accelData: AccelerometerData;
  gyroData: GyroscopeData;
  simConfig: SimulationConfig;
  isMonitoring?: boolean;
  onTogglePanel: () => void;
  onSetActiveTab: (tab: 'motion' | 'devices' | 'monitor') => void;
  onToggleSimulation: () => void;
  onToggleRealSensors: () => void;
  onSetSimConfig: (config: SimulationConfig) => void;
  renderDevicesList: () => React.ReactNode;
  renderLiveMonitor?: () => React.ReactNode;
}

const MotionPanel = memo(function MotionPanel({
  showPanel,
  panelHeight,
  activeTab,
  simulationActive,
  useRealSensors,
  hasSimulatedDevices,
  accelData,
  gyroData,
  simConfig,
  isMonitoring,
  onTogglePanel,
  onSetActiveTab,
  onToggleSimulation,
  onToggleRealSensors,
  onSetSimConfig,
  renderDevicesList,
  renderLiveMonitor,
}: MotionPanelProps) {
  const formatValue = (value: number) => value.toFixed(2);

  return (
    <View style={styles.motionPanel}>
      <TouchableOpacity style={styles.panelHeader} onPress={onTogglePanel} activeOpacity={0.8}>
        <View style={styles.panelHeaderLeft}>
          <Sliders size={18} color="#00ff88" />
          <Text style={styles.panelTitle}>Dev Controls</Text>
          {(simulationActive || useRealSensors || hasSimulatedDevices) && (
            <View style={styles.liveIndicator}>
              <Text style={styles.liveText}>ACTIVE</Text>
            </View>
          )}
          {isMonitoring && (
            <View style={[styles.liveIndicator, styles.monitoringIndicator]}>
              <Radio size={10} color="#ffffff" />
              <Text style={styles.liveText}>MONITORING</Text>
            </View>
          )}
        </View>
        <View style={styles.panelHeaderRight}>
          <View style={styles.miniStats}>
            <Text style={styles.miniStatLabel}>X:</Text>
            <Text style={styles.miniStatValue}>{formatValue(accelData.x)}</Text>
            <Text style={styles.miniStatLabel}>Y:</Text>
            <Text style={styles.miniStatValue}>{formatValue(accelData.y)}</Text>
            <Text style={styles.miniStatLabel}>Z:</Text>
            <Text style={styles.miniStatValue}>{formatValue(accelData.z)}</Text>
          </View>
          {showPanel ? (
            <ChevronDown size={18} color="rgba(255,255,255,0.5)" />
          ) : (
            <ChevronUp size={18} color="rgba(255,255,255,0.5)" />
          )}
        </View>
      </TouchableOpacity>

      <Animated.View style={[
        styles.panelContent, 
        { 
          maxHeight: panelHeight.interpolate({ inputRange: [0, 1], outputRange: [0, 550] }), 
          opacity: panelHeight 
        }
      ]}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'motion' && styles.tabButtonActive]}
            onPress={() => onSetActiveTab('motion')}
          >
            <Activity size={14} color={activeTab === 'motion' ? '#0a0a0a' : '#ffffff'} />
            <Text style={[styles.tabButtonText, activeTab === 'motion' && styles.tabButtonTextActive]}>Motion</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'devices' && styles.tabButtonActive]}
            onPress={() => onSetActiveTab('devices')}
          >
            <Camera size={14} color={activeTab === 'devices' ? '#0a0a0a' : '#ffffff'} />
            <Text style={[styles.tabButtonText, activeTab === 'devices' && styles.tabButtonTextActive]}>Devices</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'monitor' && styles.tabButtonActive, isMonitoring && styles.tabButtonMonitoring]}
            onPress={() => onSetActiveTab('monitor')}
          >
            <Radio size={14} color={activeTab === 'monitor' ? '#0a0a0a' : (isMonitoring ? '#00aaff' : '#ffffff')} />
            <Text style={[styles.tabButtonText, activeTab === 'monitor' && styles.tabButtonTextActive, isMonitoring && activeTab !== 'monitor' && styles.tabButtonTextMonitoring]}>Monitor</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'motion' && (
          <>
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[styles.modeButton, useRealSensors && styles.modeButtonActive]}
                onPress={onToggleRealSensors}
              >
                <Smartphone size={16} color={useRealSensors ? '#0a0a0a' : '#ffffff'} />
                <Text style={[styles.modeButtonText, useRealSensors && styles.modeButtonTextActive]}>
                  Real Sensors
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, simulationActive && styles.modeButtonActive]}
                onPress={onToggleSimulation}
              >
                <Activity size={16} color={simulationActive ? '#0a0a0a' : '#ffffff'} />
                <Text style={[styles.modeButtonText, simulationActive && styles.modeButtonTextActive]}>
                  Simulate
                </Text>
              </TouchableOpacity>
            </View>

            {simulationActive && (
              <>
                <View style={styles.patternGrid}>
                  {(Object.keys(PATTERN_PRESETS) as SimulationPattern[]).map((pattern) => (
                    <TouchableOpacity
                      key={pattern}
                      style={[
                        styles.patternChip,
                        simConfig.pattern === pattern && styles.patternChipActive,
                      ]}
                      onPress={() => onSetSimConfig({ ...simConfig, pattern })}
                    >
                      <Text style={[
                        styles.patternChipText,
                        simConfig.pattern === pattern && styles.patternChipTextActive,
                      ]}>
                        {PATTERN_PRESETS[pattern].label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.controlsRow}>
                  <View style={styles.controlGroup}>
                    <Text style={styles.controlLabel}>Intensity</Text>
                    <View style={styles.controlButtons}>
                      {[0.5, 1.0, 1.5, 2.0].map((val) => (
                        <TouchableOpacity
                          key={val}
                          style={[styles.controlBtn, simConfig.intensity === val && styles.controlBtnActive]}
                          onPress={() => onSetSimConfig({ ...simConfig, intensity: val })}
                        >
                          <Text style={[styles.controlBtnText, simConfig.intensity === val && styles.controlBtnTextActive]}>
                            {val}x
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <View style={styles.controlGroup}>
                    <Text style={styles.controlLabel}>Speed</Text>
                    <View style={styles.controlButtons}>
                      {[0.5, 1.0, 1.5, 2.0].map((val) => (
                        <TouchableOpacity
                          key={val}
                          style={[styles.controlBtn, simConfig.frequency === val && styles.controlBtnActive]}
                          onPress={() => onSetSimConfig({ ...simConfig, frequency: val })}
                        >
                          <Text style={[styles.controlBtnText, simConfig.frequency === val && styles.controlBtnTextActive]}>
                            {val}x
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </>
            )}

            <View style={styles.sensorReadout}>
              <View style={styles.sensorColumn}>
                <Text style={styles.sensorTitle}>Accelerometer</Text>
                <View style={styles.sensorValues}>
                  <View style={styles.sensorItem}>
                    <View style={[styles.sensorDot, { backgroundColor: '#ff0066' }]} />
                    <Text style={styles.sensorLabel}>X</Text>
                    <Text style={styles.sensorValue}>{formatValue(accelData.x)}</Text>
                  </View>
                  <View style={styles.sensorItem}>
                    <View style={[styles.sensorDot, { backgroundColor: '#00ff88' }]} />
                    <Text style={styles.sensorLabel}>Y</Text>
                    <Text style={styles.sensorValue}>{formatValue(accelData.y)}</Text>
                  </View>
                  <View style={styles.sensorItem}>
                    <View style={[styles.sensorDot, { backgroundColor: '#00aaff' }]} />
                    <Text style={styles.sensorLabel}>Z</Text>
                    <Text style={styles.sensorValue}>{formatValue(accelData.z)}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.sensorColumn}>
                <Text style={styles.sensorTitle}>Gyroscope</Text>
                <View style={styles.sensorValues}>
                  <View style={styles.sensorItem}>
                    <View style={[styles.sensorDot, { backgroundColor: '#ff0066' }]} />
                    <Text style={styles.sensorLabel}>X</Text>
                    <Text style={styles.sensorValue}>{formatValue(gyroData.x)}</Text>
                  </View>
                  <View style={styles.sensorItem}>
                    <View style={[styles.sensorDot, { backgroundColor: '#00ff88' }]} />
                    <Text style={styles.sensorLabel}>Y</Text>
                    <Text style={styles.sensorValue}>{formatValue(gyroData.y)}</Text>
                  </View>
                  <View style={styles.sensorItem}>
                    <View style={[styles.sensorDot, { backgroundColor: '#00aaff' }]} />
                    <Text style={styles.sensorLabel}>Z</Text>
                    <Text style={styles.sensorValue}>{formatValue(gyroData.z)}</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {activeTab === 'devices' && renderDevicesList()}

        {activeTab === 'monitor' && renderLiveMonitor && renderLiveMonitor()}
      </Animated.View>
    </View>
  );
});

export default MotionPanel;

const styles = StyleSheet.create({
  motionPanel: {
    backgroundColor: '#151515',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 255, 136, 0.3)',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  panelHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  panelHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00ff88',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  monitoringIndicator: {
    backgroundColor: '#00aaff',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#0a0a0a',
    letterSpacing: 1,
  },
  miniStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  miniStatValue: {
    fontSize: 11,
    color: '#00ff88',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    width: 40,
  },
  panelContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabButtonActive: {
    backgroundColor: '#00ff88',
    borderColor: '#00ff88',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  tabButtonTextActive: {
    color: '#0a0a0a',
  },
  tabButtonMonitoring: {
    borderColor: 'rgba(0, 170, 255, 0.5)',
  },
  tabButtonTextMonitoring: {
    color: '#00aaff',
  },
  modeToggle: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeButtonActive: {
    backgroundColor: '#00ff88',
    borderColor: '#00ff88',
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  modeButtonTextActive: {
    color: '#0a0a0a',
  },
  patternGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  patternChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  patternChipActive: {
    backgroundColor: '#ff6b35',
    borderColor: '#ff6b35',
  },
  patternChipText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  patternChipTextActive: {
    color: '#ffffff',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  controlGroup: {
    flex: 1,
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 6,
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  controlBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  controlBtnActive: {
    backgroundColor: '#00aaff',
  },
  controlBtnText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  controlBtnTextActive: {
    color: '#ffffff',
  },
  sensorReadout: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
  },
  sensorColumn: {
    flex: 1,
  },
  sensorTitle: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  sensorValues: {
    gap: 6,
  },
  sensorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sensorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sensorLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    width: 14,
  },
  sensorValue: {
    fontSize: 12,
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
