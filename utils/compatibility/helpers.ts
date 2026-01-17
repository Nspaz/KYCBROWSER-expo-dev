import type { CompatibilityStatus } from './types';

export const getAspectRatioValue = (aspectRatio: string): number => {
  switch (aspectRatio) {
    case '9:16': return 9 / 16;
    case '16:9': return 16 / 9;
    case '4:3': return 4 / 3;
    case '3:4': return 3 / 4;
    case '1:1': return 1;
    default: {
      const parts = aspectRatio.split(':');
      if (parts.length === 2) {
        return parseInt(parts[0], 10) / parseInt(parts[1], 10);
      }
      return 0;
    }
  }
};

export const isAspectRatioCompatible = (
  actual: string,
  target: string,
  tolerance: number
): boolean => {
  const actualValue = getAspectRatioValue(actual);
  const targetValue = getAspectRatioValue(target);
  
  if (actualValue === 0 || targetValue === 0) return false;
  
  return Math.abs(actualValue - targetValue) <= tolerance;
};

export const getAspectRatioString = (width: number, height: number): string => {
  const ratio = width / height;
  if (Math.abs(ratio - 9/16) < 0.05) return '9:16';
  if (Math.abs(ratio - 16/9) < 0.05) return '16:9';
  if (Math.abs(ratio - 4/3) < 0.05) return '4:3';
  if (Math.abs(ratio - 3/4) < 0.05) return '3:4';
  if (Math.abs(ratio - 1) < 0.05) return '1:1';
  return `${width}:${height}`;
};

export const getStatusColor = (status: CompatibilityStatus): string => {
  switch (status) {
    case 'perfect': return '#00ff88';
    case 'compatible': return '#00aaff';
    case 'warning': return '#ffaa00';
    case 'incompatible': return '#ff4444';
    default: return '#888888';
  }
};

export const getStatusIcon = (status: CompatibilityStatus): string => {
  switch (status) {
    case 'perfect': return 'check-circle';
    case 'compatible': return 'check';
    case 'warning': return 'alert-triangle';
    case 'incompatible': return 'x-circle';
    default: return 'help-circle';
  }
};

export const getOverallStatusMessage = (status: CompatibilityStatus): string => {
  switch (status) {
    case 'perfect': return 'Perfect Match';
    case 'compatible': return 'Compatible';
    case 'warning': return 'Needs Review';
    case 'incompatible': return 'Not Compatible';
    default: return 'Unknown';
  }
};
