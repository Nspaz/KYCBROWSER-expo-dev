import type { CompatibilityCheckItem } from '../types';
import { IDEAL_WEBCAM_SPECS } from '../specs';

export const checkFileSize = (fileSize: number): CompatibilityCheckItem => {
  const sizeMB = fileSize / (1024 * 1024);
  const maxMB = IDEAL_WEBCAM_SPECS.maxFileSizeMB;
  
  if (fileSize === 0) {
    return {
      name: 'File Size',
      status: 'warning',
      currentValue: 'Unknown',
      idealValue: `Under ${maxMB}MB`,
      message: 'File size could not be determined',
    };
  }
  
  const formattedSize = sizeMB >= 1 
    ? `${sizeMB.toFixed(1)}MB` 
    : `${(fileSize / 1024).toFixed(1)}KB`;
  
  if (sizeMB <= maxMB * 0.5) {
    return {
      name: 'File Size',
      status: 'perfect',
      currentValue: formattedSize,
      idealValue: `Under ${maxMB}MB`,
      message: 'Optimal file size for streaming',
    };
  }
  
  if (sizeMB <= maxMB) {
    return {
      name: 'File Size',
      status: 'compatible',
      currentValue: formattedSize,
      idealValue: `Under ${maxMB}MB`,
      message: 'File size is acceptable',
    };
  }
  
  return {
    name: 'File Size',
    status: 'incompatible',
    currentValue: formattedSize,
    idealValue: `Under ${maxMB}MB`,
    message: 'File is too large for optimal streaming',
    fixSuggestion: `Compress video to under ${maxMB}MB`,
  };
};
