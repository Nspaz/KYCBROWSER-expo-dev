export type {
  IdealVideoSpecs,
  AcceptableSpecs,
  CompatibilityStatus,
  CompatibilityCheckItem,
  CompatibilityResult,
} from './types';

export { IDEAL_WEBCAM_SPECS, ACCEPTABLE_SPECS } from './specs';

export {
  getAspectRatioValue,
  isAspectRatioCompatible,
  getAspectRatioString,
  getStatusColor,
  getStatusIcon,
  getOverallStatusMessage,
} from './helpers';

export {
  checkResolution,
  checkOrientation,
  checkAspectRatio,
  checkFormat,
  checkFileSize,
  checkDuration,
} from './checks';

export { checkVideoCompatibility } from './checkVideoCompatibility';
export { checkVideoCompatibilityWithPlayback } from './webPlaybackCheck';
