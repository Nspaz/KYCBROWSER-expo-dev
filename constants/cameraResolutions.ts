import type { PhotoResolution, VideoResolution, CameraMode } from '@/types/device';

export const DEFAULT_PHOTO_RESOLUTIONS: PhotoResolution[] = [
  { width: 4032, height: 3024, megapixels: 12, label: '12MP 4:3' },
  { width: 4032, height: 2268, megapixels: 9, label: '9MP 16:9' },
];

export const DEFAULT_VIDEO_RESOLUTIONS: VideoResolution[] = [
  { width: 3840, height: 2160, label: '4K UHD', maxFps: 60 },
  { width: 1920, height: 1080, label: '1080p FHD', maxFps: 60 },
  { width: 1280, height: 720, label: '720p HD', maxFps: 30 },
];

export const ULTRA_PHOTO_RESOLUTIONS: PhotoResolution[] = [
  { width: 16320, height: 12240, megapixels: 200, label: '200MP Full' },
  { width: 8160, height: 6120, megapixels: 50, label: '50MP Binned' },
  { width: 4080, height: 3060, megapixels: 12, label: '12MP 4:3' },
];

export const ULTRA_VIDEO_RESOLUTIONS: VideoResolution[] = [
  { width: 7680, height: 4320, label: '8K UHD', maxFps: 30 },
  { width: 3840, height: 2160, label: '4K UHD', maxFps: 120 },
  { width: 1920, height: 1080, label: '1080p Super SlowMo', maxFps: 960 },
  { width: 1920, height: 1080, label: '1080p FHD', maxFps: 60 },
];

export const PRO_PHOTO_RESOLUTIONS: PhotoResolution[] = [
  { width: 8064, height: 6048, megapixels: 48, label: '48MP ProRAW Max' },
  { width: 6048, height: 4032, megapixels: 24, label: '24MP HEIF' },
  { width: 4032, height: 3024, megapixels: 12, label: '12MP Standard' },
];

export const PRO_VIDEO_RESOLUTIONS: VideoResolution[] = [
  { width: 3840, height: 2160, label: '4K Cinematic', maxFps: 30 },
  { width: 3840, height: 2160, label: '4K ProRes HQ', maxFps: 60 },
  { width: 3840, height: 2160, label: '4K HDR', maxFps: 60 },
  { width: 1920, height: 1080, label: '1080p SlowMo', maxFps: 240 },
  { width: 1920, height: 1080, label: '1080p', maxFps: 60 },
];

export const FRONT_PHOTO_RESOLUTIONS: PhotoResolution[] = [
  { width: 4032, height: 3024, megapixels: 12, label: '12MP 4:3' },
  { width: 3088, height: 2316, megapixels: 7, label: '7MP Standard' },
];

export const FRONT_VIDEO_RESOLUTIONS: VideoResolution[] = [
  { width: 3840, height: 2160, label: '4K', maxFps: 60 },
  { width: 1920, height: 1080, label: '1080p SlowMo', maxFps: 120 },
  { width: 1920, height: 1080, label: '1080p', maxFps: 60 },
];

export const DEFAULT_CAMERA_MODES: CameraMode[] = ['photo', 'video'];

export const PRO_CAMERA_MODES: CameraMode[] = [
  'photo', 'video', 'portrait', 'night', 'cinematic', 
  'slowmo', 'timelapse', 'pano', 'proraw', 'prores'
];

export const STANDARD_CAMERA_MODES: CameraMode[] = [
  'photo', 'video', 'portrait', 'night', 'slowmo', 'timelapse', 'pano'
];
