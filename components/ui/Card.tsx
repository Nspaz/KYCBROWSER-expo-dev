import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { THEME } from '@/constants/app';

type CardVariant = 'default' | 'active' | 'simulating' | 'error';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

const variantStyles: Record<CardVariant, { bg: string; border: string }> = {
  default: { 
    bg: 'rgba(255,255,255,0.05)', 
    border: THEME.colors.border.default 
  },
  active: { 
    bg: 'rgba(0,255,136,0.08)', 
    border: THEME.colors.border.active 
  },
  simulating: { 
    bg: 'rgba(0,170,255,0.05)', 
    border: THEME.colors.border.simulating 
  },
  error: { 
    bg: 'rgba(255,71,87,0.08)', 
    border: 'rgba(255,71,87,0.3)' 
  },
};

export function Card({ children, variant = 'default', onPress, style, testID }: CardProps) {
  const variantConfig = variantStyles[variant];

  const content = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantConfig.bg,
          borderColor: variantConfig.border,
        },
        style,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
  },
});

export default Card;
