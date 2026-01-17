import type { CompatibilityCheckItem } from '../types';
import { IDEAL_WEBCAM_SPECS, ACCEPTABLE_SPECS } from '../specs';

export const checkResolution = (
  width: number | undefined,
  height: number | undefined
): CompatibilityCheckItem => {
  const w = width || 0;
  const h = height || 0;
  
  if (w === 0 || h === 0) {
    return {
      name: 'Resolution',
      status: 'warning',
      currentValue: 'Unknown',
      idealValue: `${IDEAL_WEBCAM_SPECS.width}x${IDEAL_WEBCAM_SPECS.height}`,
      message: 'Resolution could not be determined',
      fixSuggestion: 'Re-upload video or check file integrity',
    };
  }
  
  const isIdeal = w === IDEAL_WEBCAM_SPECS.width && h === IDEAL_WEBCAM_SPECS.height;
  const isAcceptable = w >= ACCEPTABLE_SPECS.minWidth && 
                       h >= ACCEPTABLE_SPECS.minHeight &&
                       w <= ACCEPTABLE_SPECS.maxWidth &&
                       h <= ACCEPTABLE_SPECS.maxHeight;
  
  if (isIdeal) {
    return {
      name: 'Resolution',
      status: 'perfect',
      currentValue: `${w}x${h}`,
      idealValue: `${IDEAL_WEBCAM_SPECS.width}x${IDEAL_WEBCAM_SPECS.height}`,
      message: 'Perfect resolution match!',
    };
  }
  
  if (isAcceptable) {
    return {
      name: 'Resolution',
      status: 'compatible',
      currentValue: `${w}x${h}`,
      idealValue: `${IDEAL_WEBCAM_SPECS.width}x${IDEAL_WEBCAM_SPECS.height}`,
      message: 'Resolution is acceptable but not ideal',
      fixSuggestion: `For best results, resize to ${IDEAL_WEBCAM_SPECS.width}x${IDEAL_WEBCAM_SPECS.height}`,
    };
  }
  
  return {
    name: 'Resolution',
    status: 'incompatible',
    currentValue: `${w}x${h}`,
    idealValue: `${IDEAL_WEBCAM_SPECS.width}x${IDEAL_WEBCAM_SPECS.height}`,
    message: 'Resolution is outside acceptable range',
    fixSuggestion: `Resize video to ${IDEAL_WEBCAM_SPECS.width}x${IDEAL_WEBCAM_SPECS.height}`,
  };
};
