import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface DataGraphProps {
  value: number;
  color: string;
  maxValue?: number;
}

export default function DataGraph({ value, color, maxValue = 10 }: DataGraphProps) {
  const animatedHeight = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const normalizedValue = Math.abs(value) / maxValue;
    const clampedValue = Math.min(Math.max(normalizedValue, 0), 1);
    
    Animated.spring(animatedHeight, {
      toValue: clampedValue,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  }, [value, maxValue, animatedHeight]);

  const heightPercentage = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.barBackground}>
        <Animated.View 
          style={[
            styles.barFill, 
            { 
              height: heightPercentage,
              backgroundColor: color,
            }
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barBackground: {
    width: 40,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
});
