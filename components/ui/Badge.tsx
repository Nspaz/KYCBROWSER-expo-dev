import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { THEME } from '@/constants/app';

type BadgeVariant = 'default' | 'lens' | 'facing' | 'zoom' | 'mic' | 'sim' | 'success' | 'warning' | 'error';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: 'rgba(255,255,255,0.1)', text: 'rgba(255,255,255,0.8)' },
  lens: { bg: THEME.colors.badge.lens, text: '#ffa500' },
  facing: { bg: THEME.colors.badge.facing, text: THEME.colors.primary },
  zoom: { bg: THEME.colors.badge.zoom, text: '#8a2be2' },
  mic: { bg: THEME.colors.badge.mic, text: '#ff6464' },
  sim: { bg: THEME.colors.badge.sim, text: THEME.colors.secondary },
  success: { bg: 'rgba(0,255,136,0.15)', text: THEME.colors.primary },
  warning: { bg: 'rgba(255,165,2,0.15)', text: THEME.colors.warning },
  error: { bg: 'rgba(255,71,87,0.15)', text: THEME.colors.danger },
};

export function Badge({ label, variant = 'default', icon, size = 'sm', style, textStyle }: BadgeProps) {
  const colors = variantStyles[variant];
  const isSmall = size === 'sm';

  return (
    <View style={[
      styles.badge,
      { backgroundColor: colors.bg },
      isSmall ? styles.badgeSm : styles.badgeMd,
      style,
    ]}>
      {icon}
      <Text style={[
        styles.badgeText,
        { color: colors.text },
        isSmall ? styles.badgeTextSm : styles.badgeTextMd,
        textStyle,
      ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: THEME.borderRadius.sm,
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  badgeMd: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  badgeText: {
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
  },
  badgeTextSm: {
    fontSize: THEME.fontSize.xs,
  },
  badgeTextMd: {
    fontSize: THEME.fontSize.sm,
  },
});

export default Badge;
