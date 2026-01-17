import type { CompatibilityCheckItem } from '../types';
import { IDEAL_WEBCAM_SPECS, ACCEPTABLE_SPECS } from '../specs';

export const checkFormat = (uri: string, name: string): CompatibilityCheckItem => {
  const extension = name.split('.').pop()?.toLowerCase() || 
                    uri.split('.').pop()?.toLowerCase()?.split('?')[0] || '';
  
  if (!extension) {
    return {
      name: 'Format',
      status: 'warning',
      currentValue: 'Unknown',
      idealValue: IDEAL_WEBCAM_SPECS.format.toUpperCase(),
      message: 'File format could not be determined',
    };
  }
  
  const isIdeal = extension === IDEAL_WEBCAM_SPECS.format;
  const isAcceptable = ACCEPTABLE_SPECS.acceptableFormats.includes(extension);
  
  if (isIdeal) {
    return {
      name: 'Format',
      status: 'perfect',
      currentValue: extension.toUpperCase(),
      idealValue: IDEAL_WEBCAM_SPECS.format.toUpperCase(),
      message: 'Perfect MP4 format',
    };
  }
  
  if (isAcceptable) {
    return {
      name: 'Format',
      status: 'compatible',
      currentValue: extension.toUpperCase(),
      idealValue: IDEAL_WEBCAM_SPECS.format.toUpperCase(),
      message: `${extension.toUpperCase()} is acceptable but MP4 is preferred`,
      fixSuggestion: 'Convert to MP4 (H.264) for best compatibility',
    };
  }
  
  return {
    name: 'Format',
    status: 'incompatible',
    currentValue: extension.toUpperCase(),
    idealValue: IDEAL_WEBCAM_SPECS.format.toUpperCase(),
    message: 'Unsupported video format',
    fixSuggestion: 'Convert video to MP4 (H.264)',
  };
};
