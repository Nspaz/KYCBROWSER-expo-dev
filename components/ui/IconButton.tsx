import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { THEME } from '@/constants/app';

type IconButtonVariant = 'default' | 'primary' | 'secondary' | 'danger' | 'ghost';
type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const sizeStyles: Record<IconButtonSize, { container: number; padding: number }> = {
  sm: { container: 32, padding: 6 },
  md: { container: 40, padding: 8 },
  lg: { container: 48, padding: 10 },
};

const variantStyles: Record<IconButtonVariant, { bg: string; border: string }> = {
  default: { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.1)' },
  primary: { bg: 'rgba(0,255,136,0.15)', border: 'rgba(0,255,136,0.3)' },
  secondary: { bg: 'rgba(0,170,255,0.15)', border: 'rgba(0,170,255,0.3)' },
  danger: { bg: 'rgba(255,71,87,0.15)', border: 'rgba(255,71,87,0.3)' },
  ghost: { bg: 'transparent', border: 'transparent' },
};

export function IconButton({
  icon,
  onPress,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  testID,
}: IconButtonProps) {
  const sizeConfig = sizeStyles[size];
  const variantConfig = variantStyles[variant];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: sizeConfig.container,
          height: sizeConfig.container,
          borderRadius: sizeConfig.container / 2,
          padding: sizeConfig.padding,
          backgroundColor: variantConfig.bg,
          borderColor: variantConfig.border,
        },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator size="small" color={THEME.colors.primary} />
      ) : (
        icon
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.4,
  },
});

export default IconButton;
