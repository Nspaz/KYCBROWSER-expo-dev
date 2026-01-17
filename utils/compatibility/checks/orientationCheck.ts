import type { CompatibilityCheckItem } from '../types';

export const checkOrientation = (
  width: number | undefined,
  height: number | undefined
): CompatibilityCheckItem => {
  const w = width || 0;
  const h = height || 0;
  
  if (w === 0 || h === 0) {
    return {
      name: 'Orientation',
      status: 'warning',
      currentValue: 'Unknown',
      idealValue: 'Portrait (9:16)',
      message: 'Orientation could not be determined',
    };
  }
  
  const isPortrait = h > w;
  
  if (isPortrait) {
    return {
      name: 'Orientation',
      status: 'perfect',
      currentValue: 'Portrait',
      idealValue: 'Portrait (9:16)',
      message: 'Correct portrait orientation',
    };
  }
  
  return {
    name: 'Orientation',
    status: 'incompatible',
    currentValue: 'Landscape',
    idealValue: 'Portrait (9:16)',
    message: 'Video must be in portrait orientation',
    fixSuggestion: 'Rotate or crop video to 9:16 portrait format',
  };
};
