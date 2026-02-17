/**
 * Native Media Bridge Module
 * 
 * This module provides native media bridge functionality for WebRTC-based
 * video injection at the native level.
 * 
 * This module requires a development build (Expo Go is not supported).
 */

let NativeMediaBridgeModule: any = null;

try {
  const { requireNativeModule } = require('expo-modules-core');
  NativeMediaBridgeModule = requireNativeModule('NativeMediaBridge');
} catch (e) {
  // Module not available in this build
  console.warn('[NativeMediaBridge] Native module not available:', e);
}

/**
 * Check if the native media bridge is available
 */
export function isAvailable(): boolean {
  return NativeMediaBridgeModule !== null;
}

/**
 * Always returns false – this app only runs as a development build.
 */
export function isExpoGo(): boolean {
  return false;
}

/**
 * Get a message explaining why the module is unavailable
 */
export function getUnavailableReason(): string | null {
  if (!NativeMediaBridgeModule) {
    return 'Native Media Bridge module is not installed.';
  }
  return null;
}

export default NativeMediaBridgeModule;
