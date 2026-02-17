/**
 * Dev Build Environment Layer
 * 
 * This module provides utilities for environment detection and native module
 * availability. The app targets EAS Development Builds exclusively — Expo Go
 * is not supported. All native modules and protocols are assumed available.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Expo Go environment types
 */
export type ExpoEnvironment = 'expo-go' | 'development-build' | 'standalone' | 'unknown';

/**
 * Feature availability status
 */
export interface FeatureAvailability {
  available: boolean;
  reason?: string;
  fallbackAvailable: boolean;
  fallbackDescription?: string;
}

/**
 * Native module availability map
 */
export interface NativeModuleStatus {
  nativeMediaBridge: FeatureAvailability;
  virtualCamera: FeatureAvailability;
  webrtcLoopback: FeatureAvailability;
  reactNativeWebrtc: FeatureAvailability;
}

/**
 * Protocol compatibility map
 */
export interface ProtocolCompatibility {
  protocol0: FeatureAvailability;
  protocol1: FeatureAvailability;
  protocol2: FeatureAvailability;
  protocol3: FeatureAvailability;
  advancedProtocol: FeatureAvailability;
  webrtcBridge: FeatureAvailability;
  websocketBridge: FeatureAvailability;
}

/**
 * Check if the app is running in Expo Go.
 * Always returns false — this app targets EAS Development Builds only.
 */
export function isExpoGo(): boolean {
  return false;
}

/**
 * Get the current Expo environment type.
 * Returns 'development-build' by default for EAS dev builds.
 */
export function getExpoEnvironment(): ExpoEnvironment {
  try {
    const executionEnvironment = Constants.executionEnvironment;
    
    if (executionEnvironment === 'standalone') {
      return 'standalone';
    }
    
    if (executionEnvironment === 'bare') {
      return 'development-build';
    }
    
    const appOwnership = Constants.appOwnership;
    if (appOwnership === 'standalone') {
      return 'standalone';
    }
    
    return 'development-build';
  } catch {
    return 'development-build';
  }
}

/**
 * Check if a specific native module is available
 */
export function isNativeModuleAvailable(moduleName: string): boolean {
  try {
    const { NativeModules } = require('react-native');
    return NativeModules[moduleName] != null;
  } catch {
    return false;
  }
}

/**
 * Check if react-native-webrtc is available
 */
export function isWebRTCAvailable(): boolean {
  try {
    require('react-native-webrtc');
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the availability status of all native modules
 */
export function getNativeModuleStatus(): NativeModuleStatus {
  return {
    nativeMediaBridge: {
      available: isNativeModuleAvailable('NativeMediaBridge'),
      fallbackAvailable: true,
      fallbackDescription: 'WebView-based injection (Protocol 0) provides equivalent functionality',
    },
    virtualCamera: {
      available: isNativeModuleAvailable('VirtualCamera'),
      fallbackAvailable: true,
      fallbackDescription: 'WebView-based canvas rendering provides equivalent functionality',
    },
    webrtcLoopback: {
      available: isNativeModuleAvailable('WebRtcLoopback'),
      fallbackAvailable: true,
      fallbackDescription: 'WebView-based WebRTC injection provides equivalent functionality',
    },
    reactNativeWebrtc: {
      available: isWebRTCAvailable(),
      fallbackAvailable: true,
      fallbackDescription: 'WebView-based WebRTC APIs work as fallback',
    },
  };
}

/**
 * Get the compatibility status of all protocols.
 * All protocols are fully available in the dev build.
 */
export function getProtocolCompatibility(): ProtocolCompatibility {
  return {
    protocol0: {
      available: true,
      fallbackAvailable: true,
      fallbackDescription: 'Primary injection method - works in all environments',
    },
    protocol1: {
      available: true,
      fallbackAvailable: true,
      fallbackDescription: 'WebView-based MediaStream override - works in all environments',
    },
    protocol2: {
      available: true,
      fallbackAvailable: true,
      fallbackDescription: 'WebView-based property descriptor override - works in all environments',
    },
    protocol3: {
      available: true,
      fallbackAvailable: true,
      fallbackDescription: 'WebView-based Proxy intercept - works in all environments',
    },
    advancedProtocol: {
      available: true,
      fallbackAvailable: true,
      fallbackDescription: 'Full native acceleration with JavaScript fallback',
    },
    webrtcBridge: {
      available: true,
      fallbackAvailable: true,
      fallbackDescription: 'Native WebRTC bridge with WebView fallback',
    },
    websocketBridge: {
      available: true,
      fallbackAvailable: true,
      fallbackDescription: 'Works in all environments',
    },
  };
}

/**
 * Get a summary of environment compatibility for display
 */
export function getCompatibilitySummary(): {
  environment: ExpoEnvironment;
  isExpoGo: boolean;
  recommendedProtocol: string;
  availableFeatures: string[];
  unavailableFeatures: string[];
  warnings: string[];
} {
  const env = getExpoEnvironment();
  const moduleStatus = getNativeModuleStatus();
  const protocolCompat = getProtocolCompatibility();
  
  const availableFeatures: string[] = [];
  const unavailableFeatures: string[] = [];
  const warnings: string[] = [];
  
  if (protocolCompat.protocol0.available) {
    availableFeatures.push('Protocol 0 (Primary WebView Injection)');
  }
  if (protocolCompat.protocol1.available) {
    availableFeatures.push('Protocol 1 (MediaStream Override)');
  }
  if (protocolCompat.protocol2.available) {
    availableFeatures.push('Protocol 2 (Descriptor Hook)');
  }
  if (protocolCompat.protocol3.available) {
    availableFeatures.push('Protocol 3 (Proxy Intercept)');
  }
  if (protocolCompat.webrtcBridge.available) {
    availableFeatures.push('Native WebRTC Bridge');
  }
  if (protocolCompat.websocketBridge.available) {
    availableFeatures.push('WebSocket Video Bridge');
  }
  
  if (!moduleStatus.nativeMediaBridge.available) {
    unavailableFeatures.push('Native Media Bridge (use Protocol 0 instead)');
  } else {
    availableFeatures.push('Native Media Bridge');
  }
  if (!moduleStatus.virtualCamera.available) {
    unavailableFeatures.push('Virtual Camera (use WebView injection instead)');
  } else {
    availableFeatures.push('Virtual Camera');
  }
  if (!moduleStatus.webrtcLoopback.available) {
    unavailableFeatures.push('Native WebRTC Loopback (use Protocol 0 instead)');
  } else {
    availableFeatures.push('Native WebRTC Loopback');
  }
  if (!moduleStatus.reactNativeWebrtc.available) {
    unavailableFeatures.push('react-native-webrtc (use WebView WebRTC instead)');
  } else {
    availableFeatures.push('react-native-webrtc');
  }
  
  return {
    environment: env,
    isExpoGo: false,
    recommendedProtocol: 'stealth',
    availableFeatures,
    unavailableFeatures,
    warnings,
  };
}

/**
 * Log compatibility information to console
 */
export function logCompatibilityInfo(): void {
  const summary = getCompatibilitySummary();
  
  console.log('====================================');
  console.log('EAS Dev Build Environment Check');
  console.log('====================================');
  console.log(`Environment: ${summary.environment}`);
  console.log(`Platform: ${Platform.OS}`);
  console.log(`Recommended Protocol: ${summary.recommendedProtocol}`);
  console.log('');
  
  console.log('✓ Available Features:');
  summary.availableFeatures.forEach(f => console.log(`  - ${f}`));
  console.log('');
  
  if (summary.unavailableFeatures.length > 0) {
    console.log('✗ Unavailable Features:');
    summary.unavailableFeatures.forEach(f => console.log(`  - ${f}`));
    console.log('');
  }
  
  console.log('====================================');
}

/**
 * Helper to safely require a native module with fallback
 */
export function safeRequireNativeModule<T>(
  moduleName: string,
  fallback: T
): T {
  try {
    const { NativeModules } = require('react-native');
    const module = NativeModules[moduleName];
    
    if (module) {
      return module as T;
    }
    
    console.warn(`[DevBuild] Native module "${moduleName}" not found, using fallback`);
    return fallback;
  } catch (error) {
    console.warn(`[DevBuild] Failed to require "${moduleName}":`, error);
    return fallback;
  }
}

/**
 * Helper to safely require react-native-webrtc with fallback
 */
export function safeRequireWebRTC(): any | null {
  try {
    return require('react-native-webrtc');
  } catch {
    console.warn('[DevBuild] react-native-webrtc not installed');
    return null;
  }
}

/**
 * Wrap a function — in dev build mode all functions execute directly.
 */
export function requireDevelopmentBuild<T extends (...args: any[]) => any>(
  fn: T
): T {
  return fn;
}

// Export default for convenient importing
export default {
  isExpoGo,
  getExpoEnvironment,
  isNativeModuleAvailable,
  isWebRTCAvailable,
  getNativeModuleStatus,
  getProtocolCompatibility,
  getCompatibilitySummary,
  logCompatibilityInfo,
  safeRequireNativeModule,
  safeRequireWebRTC,
  requireDevelopmentBuild,
};
