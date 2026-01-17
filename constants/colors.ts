import { THEME } from './app';

export const Colors = {
  primary: THEME.colors.primary,
  secondary: THEME.colors.secondary,
  danger: THEME.colors.danger,
  warning: THEME.colors.warning,
  background: THEME.colors.background,
  text: THEME.colors.text,
  border: THEME.colors.border,
  badge: THEME.colors.badge,
} as const;

export type ColorScheme = typeof Colors;

export default Colors;
