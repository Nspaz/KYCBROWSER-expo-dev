import type { CameraLensType, CameraCapabilities, CameraMode, PhotoResolution, VideoResolution } from '@/types/device';
import { DEFAULT_PHOTO_RESOLUTIONS, DEFAULT_VIDEO_RESOLUTIONS, DEFAULT_CAMERA_MODES } from '@/constants/cameraResolutions';

export function detectCameraType(label: string): CameraLensType {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes('ultra') || lowerLabel.includes('wide angle') || lowerLabel.includes('0.5x')) {
    return 'ultrawide';
  }
  if (lowerLabel.includes('periscope') || lowerLabel.includes('5x') || lowerLabel.includes('10x')) {
    return 'periscope';
  }
  if (lowerLabel.includes('tele') || lowerLabel.includes('zoom') || lowerLabel.includes('2x') || lowerLabel.includes('3x')) {
    return 'telephoto';
  }
  if (lowerLabel.includes('macro')) {
    return 'macro';
  }
  if (lowerLabel.includes('depth') || lowerLabel.includes('tof')) {
    return 'depth';
  }
  if (lowerLabel.includes('lidar')) {
    return 'lidar';
  }
  if (lowerLabel.includes('truedepth')) {
    return 'truedepth';
  }
  if (lowerLabel.includes('infrared') || lowerLabel.includes('ir ')) {
    return 'infrared';
  }
  return 'wide';
}

export function detectCameraFacing(label: string, index: number): 'front' | 'back' | 'external' {
  const lowerLabel = label.toLowerCase();
  
  if (lowerLabel.includes('front') || lowerLabel.includes('facetime') || lowerLabel.includes('selfie') || lowerLabel.includes('user')) {
    return 'front';
  }
  if (lowerLabel.includes('back') || lowerLabel.includes('rear') || lowerLabel.includes('environment') || lowerLabel.includes('main')) {
    return 'back';
  }
  if (lowerLabel.includes('external') || lowerLabel.includes('usb') || lowerLabel.includes('webcam')) {
    return 'external';
  }
  
  if (index === 1) return 'back';
  if (index === 2) return 'front';
  return 'external';
}

export function createDefaultCapabilities(
  photoRes: PhotoResolution[] = DEFAULT_PHOTO_RESOLUTIONS,
  videoRes: VideoResolution[] = DEFAULT_VIDEO_RESOLUTIONS,
  modes: CameraMode[] = DEFAULT_CAMERA_MODES
): CameraCapabilities {
  return {
    photoResolutions: photoRes,
    videoResolutions: videoRes,
    supportedModes: modes,
  };
}
