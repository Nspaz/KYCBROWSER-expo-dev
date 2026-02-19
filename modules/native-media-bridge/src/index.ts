/**
 * Native Media Bridge Module
 * 
 * This module provides native media bridge functionality for WebRTC-based
 * video injection at the native level.
 * 
 * Requires an EAS Development Build with native modules.
 */

let NativeMediaBridgeModule: any = null;

try {
  const { requireNativeModule } = require('expo-modules-core');
  NativeMediaBridgeModule = requireNativeModule('NativeMediaBridge');
} catch (e) {
  console.warn('[NativeMediaBridge] Native module not available:', e);
}

/**
 * Check if the native media bridge is available
 */
export function isAvailable(): boolean {
  return NativeMediaBridgeModule !== null;
}

/**
 * Check if running in Expo Go (always false — dev build only)
 */
export function isExpoGo(): boolean {
  return false;
}

/**
 * Get a message explaining why the module is unavailable
 */
export function getUnavailableReason(): string | null {
  if (!NativeMediaBridgeModule) {
    return 'Native Media Bridge module is not installed. Ensure the native module is linked in your dev build.';
  }
  return null;
}

export default NativeMediaBridgeModule;
