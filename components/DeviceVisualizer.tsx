import React from 'react';
import { View, StyleSheet } from 'react-native';
import { OrientationData } from '@/hooks/useMotionSensors';

interface DeviceVisualizerProps {
  orientation: OrientationData;
}

export default function DeviceVisualizer({ orientation }: DeviceVisualizerProps) {
  const { alpha, beta, gamma } = orientation;
  
  const rotateX = beta;
  const rotateY = gamma;
  const rotateZ = alpha;

  return (
    <View style={styles.container}>
      <View style={[styles.deviceOuter, {
        transform: [
          { perspective: 1000 },
          { rotateX: `${rotateX}deg` },
          { rotateY: `${rotateY}deg` },
          { rotateZ: `${rotateZ}deg` },
        ],
      }]}>
        <View style={styles.device}>
          <View style={styles.screen} />
          <View style={styles.notch} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  deviceOuter: {
    width: 120,
    height: 200,
  },
  device: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#333',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  screen: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#444',
  },
  notch: {
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 6,
    backgroundColor: '#000',
    borderRadius: 3,
  },
});
