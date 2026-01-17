import type { CompatibilityCheckItem } from '../types';
import { IDEAL_WEBCAM_SPECS } from '../specs';

export const checkDuration = (duration: number | undefined): CompatibilityCheckItem => {
  if (duration === undefined || duration === 0) {
    return {
      name: 'Duration',
      status: 'warning',
      currentValue: 'Unknown',
      idealValue: `Under ${IDEAL_WEBCAM_SPECS.maxDurationSeconds}s`,
      message: 'Duration could not be determined',
    };
  }
  
  const maxDuration = IDEAL_WEBCAM_SPECS.maxDurationSeconds;
  const mins = Math.floor(duration / 60);
  const secs = Math.floor(duration % 60);
  const formatted = `${mins}:${secs.toString().padStart(2, '0')}`;
  
  if (duration <= 30) {
    return {
      name: 'Duration',
      status: 'perfect',
      currentValue: formatted,
      idealValue: `Under ${maxDuration}s`,
      message: 'Ideal short duration for looping',
    };
  }
  
  if (duration <= maxDuration) {
    return {
      name: 'Duration',
      status: 'compatible',
      currentValue: formatted,
      idealValue: `Under ${maxDuration}s`,
      message: 'Duration is acceptable',
    };
  }
  
  return {
    name: 'Duration',
    status: 'incompatible',
    currentValue: formatted,
    idealValue: `Under ${maxDuration}s`,
    message: 'Video is too long',
    fixSuggestion: `Trim video to under ${maxDuration} seconds`,
  };
};
