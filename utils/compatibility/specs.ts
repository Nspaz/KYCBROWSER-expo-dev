import type { IdealVideoSpecs, AcceptableSpecs } from './types';

export const IDEAL_WEBCAM_SPECS: IdealVideoSpecs = {
  width: 1080,
  height: 1920,
  aspectRatio: '9:16',
  fps: 30,
  format: 'mp4',
  codec: 'H.264',
  maxFileSizeMB: 50,
  maxDurationSeconds: 120,
};

export const ACCEPTABLE_SPECS: AcceptableSpecs = {
  minWidth: 720,
  minHeight: 1280,
  maxWidth: 2160,
  maxHeight: 3840,
  aspectRatioTolerance: 0.05,
  acceptableFormats: ['mp4', 'mov', 'webm', 'm4v'],
  acceptableFps: [24, 25, 29.97, 30, 60],
};
