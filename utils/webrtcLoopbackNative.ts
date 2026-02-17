import { Platform } from 'react-native';
import { safeRequireNativeModule } from './expoGoCompat';

const LoopbackModule = safeRequireNativeModule<{ exportRingBufferToPhotos?: () => Promise<void> } | null>('WebRtcLoopback', null);

/**
 * Check if the native WebRTC loopback module is available
 */
export const isWebRtcLoopbackAvailable = (): boolean => {
  return LoopbackModule !== null;
};

/**
 * Export ring buffer to Photos
 */
export const exportRingBufferToPhotos = async (): Promise<void> => {
  if (Platform.OS !== 'ios') {
    throw new Error('Ring buffer export is only supported on iOS.');
  }
  
  if (!LoopbackModule?.exportRingBufferToPhotos) {
    throw new Error(
      'Native WebRtcLoopback module not available. ' +
      'Make sure you are using a development build with the webrtc-loopback package installed.'
    );
  }
  
  await LoopbackModule.exportRingBufferToPhotos();
};
