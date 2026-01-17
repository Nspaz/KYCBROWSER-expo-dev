export type {
  IdealVideoSpecs,
  AcceptableSpecs,
  CompatibilityStatus,
  CompatibilityCheckItem,
  CompatibilityResult,
} from './compatibility';

export {
  IDEAL_WEBCAM_SPECS,
  ACCEPTABLE_SPECS,
  getAspectRatioValue,
  isAspectRatioCompatible,
  getAspectRatioString,
  getStatusColor,
  getStatusIcon,
  getOverallStatusMessage,
  checkResolution,
  checkOrientation,
  checkAspectRatio,
  checkFormat,
  checkFileSize,
  checkDuration,
  checkVideoCompatibility,
  checkVideoCompatibilityWithPlayback,
} from './compatibility';
