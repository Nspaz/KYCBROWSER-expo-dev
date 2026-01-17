import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, ViewStyle } from 'react-native';
import { THEME, APP_CONFIG } from '@/constants/app';

type StatusType = 'active' | 'simulating' | 'inactive' | 'error' | 'warning';

interface StatusIndicatorProps {
  status: StatusType;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

const statusColors: Record<StatusType, string> = {
  active: THEME.colors.primary,
  simulating: THEME.colors.secondary,
  inactive: 'rgba(255,255,255,0.3)',
  error: THEME.colors.danger,
  warning: THEME.colors.warning,
};

const sizeValues: Record<'sm' | 'md' | 'lg', number> = {
  sm: 6,
  md: 8,
  lg: 10,
};

export function StatusIndicator({
  status,
  pulse = false,
  size = 'md',
  style,
}: StatusIndicatorProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (pulse && (status === 'active' || status === 'simulating')) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: APP_CONFIG.ANIMATION.PULSE_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: APP_CONFIG.ANIMATION.PULSE_DURATION,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [pulse, status, pulseAnim]);

  const sizeValue = sizeValues[size];
  const color = statusColors[status];

  return (
    <Animated.View
      style={[
        styles.indicator,
        {
          width: sizeValue,
          height: sizeValue,
          borderRadius: sizeValue / 2,
          backgroundColor: color,
          opacity: pulse ? pulseAnim : 1,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  indicator: {},
});

export default StatusIndicator;
