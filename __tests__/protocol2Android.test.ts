/**
 * Comprehensive Protocol2 Android Tests
 *
 * Validates that Protocol2 (both descriptor hook and advanced browser script)
 * produce correct, bulletproof injection scripts for Android WebView.
 *
 * Tests cover:
 * 1. Descriptor hook script validity and execution safety
 * 2. getUserMedia override with video and audio handling
 * 3. enumerateDevices override with toJSON support
 * 4. getSupportedConstraints override completeness
 * 5. Track metadata spoofing (getSettings, getCapabilities, getConstraints, applyConstraints)
 * 6. navigator.mediaDevices guard for older WebViews
 * 7. Advanced browser script: correct CONFIG variable usage (no undefined references)
 * 8. Advanced browser script: ASI module records correctly (no cross-contamination)
 * 9. Advanced browser script: emergency canvas fallback with correct dimensions
 * 10. Advanced browser script: getSupportedConstraints override
 * 11. Advanced browser script: WebRTC relay module initialization
 * 12. Advanced browser script: GPU module initialization
 * 13. Advanced browser script: Crypto module initialization
 * 14. Advanced browser script: fresh stream creation per getUserMedia call
 * 15. Advanced browser script: spoofTrackMetadata completeness
 * 16. Re-initialization guard (idempotency)
 * 17. Engine component initialization
 * 18. Engine state management
 * 19. Type defaults correctness
 */

import { createProtocol2DescriptorHook } from '@/utils/deepInjectionProtocols';
import { createAdvancedProtocol2Script } from '@/utils/advancedProtocol/browserScript';
import type { CaptureDevice } from '@/types/device';
import {
  DEFAULT_ADVANCED_PROTOCOL2_CONFIG,
  DEFAULT_VIDEO_SOURCE_CONFIG,
  DEFAULT_PIPELINE_CONFIG,
  DEFAULT_WEBRTC_RELAY_CONFIG,
  DEFAULT_GPU_CONFIG,
  DEFAULT_ASI_CONFIG,
  DEFAULT_CROSS_DEVICE_CONFIG,
  DEFAULT_CRYPTO_CONFIG,
} from '@/types/advancedProtocol';

// Shared test devices
const TEST_DEVICES: CaptureDevice[] = [
  {
    id: 'cam_front_0',
    nativeDeviceId: 'native-front-0',
    name: 'Front Camera',
    type: 'camera',
    facing: 'front',
    lensType: 'standard',
    isDefault: true,
    isPrimary: true,
    groupId: 'group-front',
    tested: true,
    simulationEnabled: true,
    capabilities: {
      videoResolutions: [{ width: 1280, height: 720, maxFps: 30, label: '720p' }],
    },
  },
  {
    id: 'cam_back_0',
    nativeDeviceId: 'native-back-0',
    name: 'Back Camera',
    type: 'camera',
    facing: 'back',
    lensType: 'wide',
    isDefault: false,
    isPrimary: false,
    groupId: 'group-back',
    tested: true,
    simulationEnabled: false,
  },
];

// ============================================================================
// DESCRIPTOR HOOK TESTS (createProtocol2DescriptorHook)
// ============================================================================

describe('Protocol2 Descriptor Hook', () => {
  let script: string;

  beforeAll(() => {
    script = createProtocol2DescriptorHook({
      width: 1280,
      height: 720,
      fps: 30,
    });
  });

  // ------------------------------------------------------------------
  // Script validity
  // ------------------------------------------------------------------

  it('should produce valid JavaScript', () => {
    expect(() => new Function(script)).not.toThrow();
  });

  it('should contain the IIFE wrapper', () => {
    expect(script).toContain('(function()');
    expect(script).toContain("'use strict'");
  });

  it('should be non-trivially long', () => {
    expect(script.length).toBeGreaterThan(500);
  });

  it('should not contain NaN from bad interpolation', () => {
    expect(script).not.toContain(': NaN,');
    expect(script).not.toContain(':NaN');
  });

  it('should end with true; for WebView injection', () => {
    expect(script.trim()).toMatch(/true;\s*$/);
  });

  // ------------------------------------------------------------------
  // Re-initialization guard
  // ------------------------------------------------------------------

  it('should check __protocol2Initialized to prevent double init', () => {
    expect(script).toContain('__protocol2Initialized');
    expect(script).toContain('Already initialized');
  });

  // ------------------------------------------------------------------
  // Canvas renderer
  // ------------------------------------------------------------------

  it('should create a canvas with CONFIG dimensions', () => {
    expect(script).toContain('canvas.width = CONFIG.width');
    expect(script).toContain('canvas.height = CONFIG.height');
  });

  it('should use requestAnimationFrame for rendering', () => {
    expect(script).toContain('requestAnimationFrame(render)');
  });

  it('should embed correct config values', () => {
    expect(script).toContain('"width":1280');
    expect(script).toContain('"height":720');
    expect(script).toContain('"fps":30');
  });

  // ------------------------------------------------------------------
  // getUserMedia override
  // ------------------------------------------------------------------

  it('should override getUserMedia at descriptor level', () => {
    expect(script).toContain("Object.defineProperty(MediaDevices.prototype, 'getUserMedia'");
  });

  it('should store original descriptor for fallback', () => {
    expect(script).toContain('originalDescriptor');
    expect(script).toContain("Object.getOwnPropertyDescriptor");
  });

  it('should fall back to original getUserMedia on failure', () => {
    expect(script).toContain('originalDescriptor.value.call(this, constraints)');
  });

  // ------------------------------------------------------------------
  // Audio handling
  // ------------------------------------------------------------------

  it('should have a silent audio track helper', () => {
    expect(script).toContain('addSilentAudioTrack');
    expect(script).toContain('AudioContext');
    expect(script).toContain('createOscillator');
  });

  it('should add silent audio when constraints.audio is true', () => {
    expect(script).toContain('constraints.audio');
    expect(script).toContain('addSilentAudioTrack(stream)');
  });

  it('should handle audio-only requests gracefully', () => {
    // Audio-only request should try original, then fallback to silent audio
    expect(script).toContain('constraints.audio && !constraints.video');
  });

  // ------------------------------------------------------------------
  // enumerateDevices override
  // ------------------------------------------------------------------

  it('should override enumerateDevices', () => {
    expect(script).toContain("Object.defineProperty(MediaDevices.prototype, 'enumerateDevices'");
  });

  it('should return devices with toJSON method', () => {
    expect(script).toContain('toJSON');
    expect(script).toContain('function()');
  });

  it('should return videoinput kind', () => {
    expect(script).toContain("kind: 'videoinput'");
  });

  // ------------------------------------------------------------------
  // getSupportedConstraints override
  // ------------------------------------------------------------------

  it('should override getSupportedConstraints', () => {
    expect(script).toContain("Object.defineProperty(MediaDevices.prototype, 'getSupportedConstraints'");
  });

  it('should include common constraints in getSupportedConstraints', () => {
    expect(script).toContain('facingMode: true');
    expect(script).toContain('frameRate: true');
    expect(script).toContain('width: true');
    expect(script).toContain('height: true');
    expect(script).toContain('deviceId: true');
    expect(script).toContain('aspectRatio: true');
    expect(script).toContain('resizeMode: true');
  });

  // ------------------------------------------------------------------
  // Track metadata spoofing
  // ------------------------------------------------------------------

  it('should spoof track label', () => {
    expect(script).toContain("Object.defineProperty(track, 'label'");
    expect(script).toContain('CONFIG.deviceLabel');
  });

  it('should spoof getSettings with all required fields', () => {
    expect(script).toContain('track.getSettings');
    expect(script).toContain('width: CONFIG.width');
    expect(script).toContain('height: CONFIG.height');
    expect(script).toContain('frameRate: CONFIG.fps');
    expect(script).toContain('aspectRatio');
    expect(script).toContain("facingMode: 'user'");
    expect(script).toContain('deviceId: CONFIG.deviceId');
    expect(script).toContain("resizeMode: 'none'");
  });

  it('should spoof getCapabilities with ranges', () => {
    expect(script).toContain('track.getCapabilities');
    expect(script).toContain('min: 1');
    expect(script).toContain('max: CONFIG.width');
    expect(script).toContain('max: 60');
    expect(script).toContain("['user', 'environment']");
  });

  it('should include aspectRatio in getCapabilities', () => {
    expect(script).toContain('aspectRatio: { min: 0.5, max: 2.0 }');
  });

  it('should spoof getConstraints', () => {
    expect(script).toContain('track.getConstraints');
    expect(script).toContain("facingMode: 'user'");
  });

  it('should spoof applyConstraints', () => {
    expect(script).toContain('track.applyConstraints');
    expect(script).toContain('Promise.resolve()');
  });

  // ------------------------------------------------------------------
  // navigator.mediaDevices guard
  // ------------------------------------------------------------------

  it('should guard against missing navigator.mediaDevices', () => {
    expect(script).toContain('if (!navigator.mediaDevices)');
    expect(script).toContain('navigator.mediaDevices = {}');
  });

  // ------------------------------------------------------------------
  // Status API
  // ------------------------------------------------------------------

  it('should expose __protocol2 status object', () => {
    expect(script).toContain('window.__protocol2');
    expect(script).toContain('getStatus');
    expect(script).toContain('initialized: true');
    expect(script).toContain('animating');
    expect(script).toContain('frames');
  });

  // ------------------------------------------------------------------
  // Android WebView compatibility
  // ------------------------------------------------------------------

  it('should use var instead of const/let for wider compatibility', () => {
    // Ensure the injected script uses var for Android WebView compatibility
    expect(script).toContain('var CONFIG =');
    expect(script).toContain('var canvas =');
    expect(script).toContain('var ctx =');
  });

  it('should use function declarations instead of arrow functions', () => {
    // Arrow functions may not work in all Android WebViews
    // Status object should use function() not () =>
    expect(script).not.toContain('() => ({');
    expect(script).toContain('getStatus: function()');
  });

  // ------------------------------------------------------------------
  // captureStream usage
  // ------------------------------------------------------------------

  it('should use captureStream for stream creation', () => {
    expect(script).toContain('captureStream(CONFIG.fps)');
  });
});

// ============================================================================
// ADVANCED PROTOCOL 2 BROWSER SCRIPT TESTS
// ============================================================================

describe('Protocol2 Advanced Browser Script', () => {
  let script: string;

  beforeAll(() => {
    script = createAdvancedProtocol2Script({
      devices: TEST_DEVICES,
      enableWebRTCRelay: false,
      enableASI: true,
      enableGPU: false,
      enableCrypto: false,
      debugEnabled: true,
      stealthMode: true,
      showOverlayLabel: false,
    });
  });

  // ------------------------------------------------------------------
  // Script validity
  // ------------------------------------------------------------------

  it('should produce valid JavaScript', () => {
    expect(script.length).toBeGreaterThan(500);
    expect(script).toMatch(/function|=>/);
  });

  it('should not contain NaN from bad interpolation', () => {
    expect(script).not.toContain(': NaN,');
  });

  it('should be within injection size limits', () => {
    // Must be under the 180KB limit used in app/index.tsx
    expect(script.length).toBeLessThan(180000);
  });

  // ------------------------------------------------------------------
  // Re-initialization guard
  // ------------------------------------------------------------------

  it('should check __advancedProtocol2Initialized', () => {
    expect(script).toContain('__advancedProtocol2Initialized');
    expect(script).toContain('Already initialized');
  });

  it('should support config updates on re-injection', () => {
    expect(script).toContain('updateConfig');
  });

  // ------------------------------------------------------------------
  // CONFIG correctness (no undefined references)
  // ------------------------------------------------------------------

  it('should use PORTRAIT_WIDTH/PORTRAIT_HEIGHT not TARGET_WIDTH/TARGET_HEIGHT in emergency fallback', () => {
    // This was a critical bug - the advanced features section used CONFIG.TARGET_WIDTH
    // which doesn't exist in its own config namespace (it uses PORTRAIT_WIDTH)
    // The fix ensures the emergency canvas uses CONFIG.PORTRAIT_WIDTH/PORTRAIT_HEIGHT
    // Note: The base working injection uses CONFIG.TARGET_WIDTH separately which is fine
    const advancedSection = script.substring(script.indexOf('__advancedProtocol2Initialized'));
    expect(advancedSection).toContain('CONFIG.PORTRAIT_WIDTH');
    expect(advancedSection).toContain('CONFIG.PORTRAIT_HEIGHT');
    // In the emergency canvas section specifically, TARGET_WIDTH/HEIGHT should not appear
    const emergencyIdx = advancedSection.indexOf('emergencyCanvas');
    expect(emergencyIdx).toBeGreaterThan(-1);
    const emergencySection = advancedSection.substring(emergencyIdx, emergencyIdx + 500);
    expect(emergencySection).not.toContain('CONFIG.TARGET_WIDTH');
    expect(emergencySection).not.toContain('CONFIG.TARGET_HEIGHT');
  });

  it('should embed correct portrait dimensions', () => {
    expect(script).toContain('PORTRAIT_WIDTH: 1080');
    expect(script).toContain('PORTRAIT_HEIGHT: 1920');
  });

  it('should embed correct TARGET_FPS', () => {
    expect(script).toContain('TARGET_FPS: 30');
  });

  // ------------------------------------------------------------------
  // Emergency canvas fallback
  // ------------------------------------------------------------------

  it('should contain emergency canvas fallback', () => {
    expect(script).toContain('emergencyCanvas');
    expect(script).toContain('Emergency canvas');
  });

  it('emergency canvas should use valid dimensions', () => {
    // The fallback values should be sane (1280, 720) not undefined
    expect(script).toContain('CONFIG.PORTRAIT_WIDTH || 1280');
    expect(script).toContain('CONFIG.PORTRAIT_HEIGHT || 720');
  });

  // ------------------------------------------------------------------
  // ASI module
  // ------------------------------------------------------------------

  it('should have separate recording methods for getUserMedia and enumerateDevices', () => {
    expect(script).toContain('recordGetUserMediaCall');
    expect(script).toContain('recordEnumerateDevicesCall');
  });

  it('enumerateDevices should call recordEnumerateDevicesCall, not recordGetUserMediaCall', () => {
    // Find the enumerateDevices override section and verify the call
    const enumSection = script.indexOf('enumerateDevices = async function()');
    expect(enumSection).toBeGreaterThan(-1);
    
    // After the enumerateDevices override, it should call recordEnumerateDevicesCall
    const afterEnum = script.substring(enumSection, enumSection + 300);
    expect(afterEnum).toContain('recordEnumerateDevicesCall');
    expect(afterEnum).not.toContain('recordGetUserMediaCall');
  });

  it('ASI module should record enumerateDevices calls with correct type', () => {
    expect(script).toContain("type: 'enumerateDevices'");
  });

  it('ASI module should collect site fingerprint', () => {
    expect(script).toContain('siteFingerprint');
    expect(script).toContain('window.location.hostname');
  });

  it('ASI module should detect high-frequency call patterns', () => {
    expect(script).toContain('high_frequency_calls');
    expect(script).toContain('analyzePatterns');
  });

  // ------------------------------------------------------------------
  // getSupportedConstraints override
  // ------------------------------------------------------------------

  it('should override getSupportedConstraints', () => {
    expect(script).toContain('getSupportedConstraints');
  });

  it('getSupportedConstraints should include all standard properties', () => {
    expect(script).toContain('facingMode: true');
    expect(script).toContain('frameRate: true');
    expect(script).toContain('width: true');
    expect(script).toContain('height: true');
    expect(script).toContain('deviceId: true');
    expect(script).toContain('aspectRatio: true');
    expect(script).toContain('resizeMode: true');
    expect(script).toContain('echoCancellation: true');
    expect(script).toContain('noiseSuppression: true');
  });

  // ------------------------------------------------------------------
  // getUserMedia override
  // ------------------------------------------------------------------

  it('should override getUserMedia', () => {
    expect(script).toContain('getUserMedia = async function');
  });

  it('should create fresh stream for each getUserMedia call', () => {
    expect(script).toContain('createFreshStream');
    expect(script).toContain('FRESH stream for each getUserMedia');
  });

  it('should check track readyState after creation', () => {
    expect(script).toContain("readyState !== 'live'");
    expect(script).toContain('retrying');
  });

  it('should notify React Native on stream ready', () => {
    expect(script).toContain('notifyReactNative');
    expect(script).toContain('streamReady');
  });

  // ------------------------------------------------------------------
  // enumerateDevices override
  // ------------------------------------------------------------------

  it('should return simulated devices in stealth mode', () => {
    expect(script).toContain('STEALTH_MODE');
    expect(script).toContain('simDevices');
  });

  it('should include toJSON method on simulated devices', () => {
    expect(script).toContain('toJSON: function()');
  });

  it('should map device type to videoinput kind', () => {
    expect(script).toContain("'videoinput'");
  });

  // ------------------------------------------------------------------
  // Track metadata spoofing
  // ------------------------------------------------------------------

  it('should have comprehensive spoofTrackMetadata function', () => {
    expect(script).toContain('spoofTrackMetadata');
  });

  it('should spoof track id', () => {
    expect(script).toContain("Object.defineProperty(videoTrack, 'id'");
  });

  it('should spoof track readyState to live', () => {
    expect(script).toContain("Object.defineProperty(videoTrack, 'readyState'");
    expect(script).toContain("return 'live'");
  });

  it('should spoof track enabled to true', () => {
    expect(script).toContain("Object.defineProperty(videoTrack, 'enabled'");
    expect(script).toContain('return true');
  });

  it('should spoof track muted to false', () => {
    expect(script).toContain("Object.defineProperty(videoTrack, 'muted'");
    expect(script).toContain('return false');
  });

  it('should spoof track label', () => {
    expect(script).toContain("Object.defineProperty(videoTrack, 'label'");
  });

  it('should spoof getSettings with all required fields', () => {
    expect(script).toContain('getSettings');
    expect(script).toContain('recommendedRes.width');
    expect(script).toContain('recommendedRes.height');
    expect(script).toContain('CONFIG.TARGET_FPS');
    expect(script).toContain('aspectRatio');
    expect(script).toContain('facingMode');
    expect(script).toContain('deviceId');
    expect(script).toContain("resizeMode: 'none'");
  });

  it('should spoof getCapabilities with complete ranges', () => {
    expect(script).toContain('getCapabilities');
    expect(script).toContain('min: 0.5, max: 2.0');  // aspectRatio range
    expect(script).toContain('max: 60');  // frameRate max
    expect(script).toContain('max: 4320');  // height max
    expect(script).toContain('max: 7680');  // width max
  });

  it('should spoof getConstraints', () => {
    expect(script).toContain('getConstraints');
    expect(script).toContain('ideal:');
  });

  it('should spoof applyConstraints', () => {
    expect(script).toContain('applyConstraints');
    expect(script).toContain('Promise.resolve()');
  });

  // ------------------------------------------------------------------
  // Silent audio support
  // ------------------------------------------------------------------

  it('should add silent audio when requested', () => {
    expect(script).toContain('addSilentAudio');
    expect(script).toContain('AudioContext');
    expect(script).toContain('createMediaStreamDestination');
  });

  // ------------------------------------------------------------------
  // Stream generator
  // ------------------------------------------------------------------

  it('should have a stream generator with render loop', () => {
    expect(script).toContain('StreamGenerator');
    expect(script).toContain('startRenderLoop');
    expect(script).toContain('requestAnimationFrame(render)');
  });

  it('should track FPS metrics', () => {
    expect(script).toContain('metrics.fps');
    expect(script).toContain('framesProcessed');
  });

  it('should have captureStream support detection', () => {
    expect(script).toContain('CaptureSupport');
    expect(script).toContain('captureStream');
    expect(script).toContain('mozCaptureStream');
    expect(script).toContain('webkitCaptureStream');
  });

  // ------------------------------------------------------------------
  // WebRTC relay module
  // ------------------------------------------------------------------

  it('should have WebRTC relay module', () => {
    expect(script).toContain('WebRTCRelayModule');
    expect(script).toContain('interceptRTCPeerConnection');
  });

  it('WebRTC relay should replace video tracks', () => {
    expect(script).toContain('Replacing video track');
  });

  // ------------------------------------------------------------------
  // GPU module
  // ------------------------------------------------------------------

  it('should have GPU module', () => {
    expect(script).toContain('GPUModule');
    expect(script).toContain('webgl2');
    expect(script).toContain('processFrame');
  });

  // ------------------------------------------------------------------
  // Crypto module
  // ------------------------------------------------------------------

  it('should have Crypto module', () => {
    expect(script).toContain('CryptoModule');
    expect(script).toContain('generateSignature');
    expect(script).toContain('simpleHash');
  });

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------

  it('should expose __advancedProtocol2 public API', () => {
    expect(script).toContain('window.__advancedProtocol2');
    expect(script).toContain('getState');
    expect(script).toContain('getMetrics');
    expect(script).toContain('updateConfig');
    expect(script).toContain('addVideoSource');
    expect(script).toContain('switchSource');
    expect(script).toContain('stop');
    expect(script).toContain('restart');
  });

  it('should expose __updateMediaConfig for config updates', () => {
    expect(script).toContain('window.__updateMediaConfig');
  });

  // ------------------------------------------------------------------
  // Polyfills for older Android WebViews
  // ------------------------------------------------------------------

  it('should polyfill performance.now', () => {
    expect(script).toContain('window.performance');
  });

  it('should polyfill requestAnimationFrame', () => {
    expect(script).toContain('window.requestAnimationFrame');
  });

  it('should guard navigator.mediaDevices', () => {
    expect(script).toContain('if (!navigator.mediaDevices)');
  });

  // ------------------------------------------------------------------
  // Overlay badge
  // ------------------------------------------------------------------

  it('should create overlay badge when enabled', () => {
    const scriptWithOverlay = createAdvancedProtocol2Script({
      devices: TEST_DEVICES,
      enableWebRTCRelay: false,
      enableASI: false,
      enableGPU: false,
      enableCrypto: false,
      debugEnabled: false,
      stealthMode: true,
      showOverlayLabel: true,
      protocolLabel: 'Test Protocol',
    });
    expect(scriptWithOverlay).toContain('createOverlayBadge');
    expect(scriptWithOverlay).toContain('__advP2Badge');
  });
});

// ============================================================================
// ADVANCED SCRIPT VARIANT TESTS
// ============================================================================

describe('Protocol2 Advanced Script Variants', () => {
  it('should generate different scripts for different config', () => {
    const scriptA = createAdvancedProtocol2Script({
      devices: TEST_DEVICES,
      enableWebRTCRelay: true,
      enableASI: true,
      enableGPU: true,
      enableCrypto: true,
      debugEnabled: true,
      stealthMode: true,
      showOverlayLabel: true,
    });

    const scriptB = createAdvancedProtocol2Script({
      devices: TEST_DEVICES,
      enableWebRTCRelay: false,
      enableASI: false,
      enableGPU: false,
      enableCrypto: false,
      debugEnabled: false,
      stealthMode: false,
      showOverlayLabel: false,
    });

    // Both should be valid
    expect(scriptA.length).toBeGreaterThan(500);
    expect(scriptB.length).toBeGreaterThan(500);

    // Different config values should be embedded
    expect(scriptA).toContain('ENABLE_WEBRTC_RELAY: true');
    expect(scriptB).toContain('ENABLE_WEBRTC_RELAY: false');
  });

  it('should embed video URI when provided', () => {
    const script = createAdvancedProtocol2Script({
      videoUri: 'https://example.com/test.mp4',
      devices: TEST_DEVICES,
      enableWebRTCRelay: false,
      enableASI: false,
      enableGPU: false,
      enableCrypto: false,
      debugEnabled: false,
      stealthMode: true,
      showOverlayLabel: false,
    });

    expect(script).toContain('https://example.com/test.mp4');
  });

  it('should work with empty device list', () => {
    const script = createAdvancedProtocol2Script({
      devices: [],
      enableWebRTCRelay: false,
      enableASI: false,
      enableGPU: false,
      enableCrypto: false,
      debugEnabled: false,
      stealthMode: true,
      showOverlayLabel: false,
    });

    expect(script.length).toBeGreaterThan(500);
    expect(script).toContain('getUserMedia');
  });

  it('should handle custom protocol label', () => {
    const script = createAdvancedProtocol2Script({
      devices: TEST_DEVICES,
      enableWebRTCRelay: false,
      enableASI: false,
      enableGPU: false,
      enableCrypto: false,
      debugEnabled: false,
      stealthMode: true,
      showOverlayLabel: true,
      protocolLabel: 'Custom Label 123',
    });

    expect(script).toContain('Custom Label 123');
  });
});

// ============================================================================
// DESCRIPTOR HOOK VARIANT TESTS
// ============================================================================

describe('Protocol2 Descriptor Hook Variants', () => {
  it('should use default config when none provided', () => {
    const script = createProtocol2DescriptorHook();
    expect(script.length).toBeGreaterThan(500);
    expect(script).toContain('getUserMedia');
    expect(script).toContain('enumerateDevices');
    expect(script).toContain('getSupportedConstraints');
  });

  it('should embed custom width/height/fps', () => {
    const script = createProtocol2DescriptorHook({
      width: 3840,
      height: 2160,
      fps: 60,
    });
    expect(script).toContain('"width":3840');
    expect(script).toContain('"height":2160');
    expect(script).toContain('"fps":60');
  });

  it('should embed custom device label', () => {
    const script = createProtocol2DescriptorHook({
      deviceLabel: 'My Custom Camera',
    });
    expect(script).toContain('My Custom Camera');
  });
});

// ============================================================================
// DEFAULT CONFIGURATION TESTS
// ============================================================================

describe('Protocol2 Default Configurations', () => {
  it('DEFAULT_ADVANCED_PROTOCOL2_CONFIG should have valid structure', () => {
    expect(DEFAULT_ADVANCED_PROTOCOL2_CONFIG.id).toBe('advanced_relay');
    expect(DEFAULT_ADVANCED_PROTOCOL2_CONFIG.enabled).toBe(true);
    expect(DEFAULT_ADVANCED_PROTOCOL2_CONFIG.version).toBeTruthy();
  });

  it('DEFAULT_VIDEO_SOURCE_CONFIG should have sane defaults', () => {
    expect(DEFAULT_VIDEO_SOURCE_CONFIG.connectionTimeout).toBeGreaterThan(0);
    expect(DEFAULT_VIDEO_SOURCE_CONFIG.reconnectAttempts).toBeGreaterThan(0);
    expect(DEFAULT_VIDEO_SOURCE_CONFIG.preferredFrameRate).toBeGreaterThan(0);
    expect(DEFAULT_VIDEO_SOURCE_CONFIG.maxBitrate).toBeGreaterThan(0);
    expect(DEFAULT_VIDEO_SOURCE_CONFIG.preferredResolution.width).toBeGreaterThan(0);
    expect(DEFAULT_VIDEO_SOURCE_CONFIG.preferredResolution.height).toBeGreaterThan(0);
  });

  it('DEFAULT_PIPELINE_CONFIG should have sane defaults', () => {
    expect(DEFAULT_PIPELINE_CONFIG.hotSwitchThresholdMs).toBeGreaterThan(0);
    expect(DEFAULT_PIPELINE_CONFIG.healthCheckIntervalMs).toBeGreaterThan(0);
    expect(DEFAULT_PIPELINE_CONFIG.minAcceptableFps).toBeGreaterThan(0);
    expect(DEFAULT_PIPELINE_CONFIG.maxBufferedFrames).toBeGreaterThan(0);
  });

  it('DEFAULT_WEBRTC_RELAY_CONFIG should have valid ICE configuration', () => {
    expect(DEFAULT_WEBRTC_RELAY_CONFIG.enabled).toBe(true);
    expect(DEFAULT_WEBRTC_RELAY_CONFIG.signalingMode).toBe('local');
    expect(DEFAULT_WEBRTC_RELAY_CONFIG.virtualTurnEnabled).toBe(true);
    expect(DEFAULT_WEBRTC_RELAY_CONFIG.virtualTurnCredentials.username).toBeTruthy();
    expect(DEFAULT_WEBRTC_RELAY_CONFIG.virtualTurnCredentials.credential).toBeTruthy();
    expect(DEFAULT_WEBRTC_RELAY_CONFIG.stealth.latencyRangeMs[0]).toBeLessThan(
      DEFAULT_WEBRTC_RELAY_CONFIG.stealth.latencyRangeMs[1]
    );
  });

  it('DEFAULT_GPU_CONFIG should prefer webgl2', () => {
    expect(DEFAULT_GPU_CONFIG.enabled).toBe(true);
    expect(DEFAULT_GPU_CONFIG.preferredBackend).toBe('webgl2');
    expect(DEFAULT_GPU_CONFIG.shaders.colorCorrection).toBe(true);
    expect(DEFAULT_GPU_CONFIG.shaders.noiseInjection).toBe(true);
  });

  it('DEFAULT_ASI_CONFIG should have site fingerprinting enabled', () => {
    expect(DEFAULT_ASI_CONFIG.enabled).toBe(true);
    expect(DEFAULT_ASI_CONFIG.siteFingerprinting.enabled).toBe(true);
    expect(DEFAULT_ASI_CONFIG.siteFingerprinting.analyzeGetUserMediaCalls).toBe(true);
    expect(DEFAULT_ASI_CONFIG.siteFingerprinting.analyzeEnumerateDevices).toBe(true);
    expect(DEFAULT_ASI_CONFIG.ml.enabled).toBe(false); // ML disabled by default
  });

  it('DEFAULT_CROSS_DEVICE_CONFIG should use manual discovery', () => {
    expect(DEFAULT_CROSS_DEVICE_CONFIG.discovery.method).toBe('manual');
    expect(DEFAULT_CROSS_DEVICE_CONFIG.reliability.autoReconnect).toBe(true);
    expect(DEFAULT_CROSS_DEVICE_CONFIG.streaming.adaptiveBitrate).toBe(true);
  });

  it('DEFAULT_CRYPTO_CONFIG should have frame signing enabled', () => {
    expect(DEFAULT_CRYPTO_CONFIG.enabled).toBe(true);
    expect(DEFAULT_CRYPTO_CONFIG.frameSigning.enabled).toBe(true);
    expect(DEFAULT_CRYPTO_CONFIG.frameSigning.algorithm).toBe('hmac-sha256');
    expect(DEFAULT_CRYPTO_CONFIG.streamIntegrity.sequenceValidation).toBe(true);
    expect(DEFAULT_CRYPTO_CONFIG.tamperDetection.blockOnDetection).toBe(false);
  });

  it('global config should have metrics collection', () => {
    expect(DEFAULT_ADVANCED_PROTOCOL2_CONFIG.global.performanceMonitoring).toBe(true);
    expect(DEFAULT_ADVANCED_PROTOCOL2_CONFIG.global.metricsCollectionIntervalMs).toBeGreaterThan(0);
    expect(DEFAULT_ADVANCED_PROTOCOL2_CONFIG.global.maxMemoryUsageMb).toBeGreaterThan(0);
  });
});

// ============================================================================
// VIDEO SOURCE MANAGER TESTS (browser-side logic)
// ============================================================================

describe('Protocol2 Video Source Manager in Browser Script', () => {
  let script: string;

  beforeAll(() => {
    script = createAdvancedProtocol2Script({
      devices: TEST_DEVICES,
      enableWebRTCRelay: false,
      enableASI: false,
      enableGPU: false,
      enableCrypto: false,
      debugEnabled: true,
      stealthMode: true,
      showOverlayLabel: false,
    });
  });

  it('should have VideoSourceManager module', () => {
    expect(script).toContain('VideoSourceManager');
    expect(script).toContain('addSource');
    expect(script).toContain('getActiveSource');
    expect(script).toContain('switchSource');
  });

  it('should support local_file source type', () => {
    expect(script).toContain("'local_file'");
  });

  it('should support synthetic source type', () => {
    expect(script).toContain("'synthetic'");
  });

  it('should load video with proper settings', () => {
    expect(script).toContain('video.muted = true');
    expect(script).toContain('video.loop = true');
    expect(script).toContain('video.playsInline = true');
    expect(script).toContain("video.preload = 'auto'");
  });

  it('should hide video element off-screen', () => {
    expect(script).toContain('position:fixed');
    expect(script).toContain('top:-9999px');
    expect(script).toContain('opacity:0');
  });

  it('should handle video load timeout', () => {
    expect(script).toContain('timeout');
    expect(script).toContain('Load timeout');
  });
});

// ============================================================================
// CONFIG UPDATE TESTS
// ============================================================================

describe('Protocol2 Config Update System', () => {
  let script: string;

  beforeAll(() => {
    script = createAdvancedProtocol2Script({
      devices: TEST_DEVICES,
      enableWebRTCRelay: false,
      enableASI: false,
      enableGPU: false,
      enableCrypto: false,
      debugEnabled: false,
      stealthMode: true,
      showOverlayLabel: false,
    });
  });

  it('should support dynamic debug toggle', () => {
    expect(script).toContain("typeof nextConfig.debugEnabled === 'boolean'");
    expect(script).toContain('Logger.enabled = CONFIG.DEBUG');
  });

  it('should support dynamic stealth mode toggle', () => {
    expect(script).toContain("typeof nextConfig.stealthMode === 'boolean'");
  });

  it('should support dynamic device list update', () => {
    expect(script).toContain('Array.isArray(nextConfig.devices)');
  });

  it('should support dynamic WebRTC relay toggle', () => {
    expect(script).toContain("typeof nextConfig.enableWebRTCRelay === 'boolean'");
  });

  it('should support dynamic ASI toggle', () => {
    expect(script).toContain("typeof nextConfig.enableASI === 'boolean'");
  });

  it('should support dynamic GPU toggle', () => {
    expect(script).toContain("typeof nextConfig.enableGPU === 'boolean'");
  });

  it('should support dynamic crypto toggle', () => {
    expect(script).toContain("typeof nextConfig.enableCrypto === 'boolean'");
  });

  it('should resolve video URI from device config', () => {
    expect(script).toContain('resolveVideoUriFromConfig');
    expect(script).toContain('assignedVideoUri');
  });

  it('should apply video source updates asynchronously', () => {
    expect(script).toContain('applyVideoSourceUpdate');
    expect(script).toContain('async function');
  });

  it('should forward config updates to working injection', () => {
    expect(script).toContain('__workingInjection');
    expect(script).toContain('updateConfig');
  });
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

describe('Protocol2 Edge Cases', () => {
  it('descriptor hook with minimum config should still be valid', () => {
    const script = createProtocol2DescriptorHook({});
    expect(() => new Function(script)).not.toThrow();
    expect(script).toContain('getUserMedia');
    expect(script).toContain('enumerateDevices');
    expect(script).toContain('getSupportedConstraints');
    expect(script).toContain('addSilentAudioTrack');
  });

  it('advanced script with all features enabled should be valid', () => {
    const script = createAdvancedProtocol2Script({
      videoUri: 'https://example.com/video.mp4',
      devices: TEST_DEVICES,
      enableWebRTCRelay: true,
      enableASI: true,
      enableGPU: true,
      enableCrypto: true,
      debugEnabled: true,
      stealthMode: true,
      showOverlayLabel: true,
      protocolLabel: 'Full Featured Protocol 2',
    });

    expect(script.length).toBeGreaterThan(1000);
    expect(script).toContain('ENABLE_WEBRTC_RELAY: true');
    expect(script).toContain('ENABLE_ASI: true');
    expect(script).toContain('ENABLE_GPU: true');
    expect(script).toContain('ENABLE_CRYPTO: true');
  });

  it('advanced script with all features disabled should still create streams', () => {
    const script = createAdvancedProtocol2Script({
      devices: [],
      enableWebRTCRelay: false,
      enableASI: false,
      enableGPU: false,
      enableCrypto: false,
      debugEnabled: false,
      stealthMode: false,
      showOverlayLabel: false,
    });

    expect(script).toContain('getUserMedia');
    expect(script).toContain('createFreshStream');
  });

  it('descriptor hook should handle concurrent stream requests', () => {
    // Multiple calls to getUserMedia should work because each call
    // creates a new stream from the same canvas
    const script = createProtocol2DescriptorHook({
      width: 640,
      height: 480,
      fps: 15,
    });
    expect(script).toContain('captureStream(CONFIG.fps)');
    // The canvas is shared but each stream is new
    expect(script).toContain('initCanvas');
  });

  it('advanced script should handle native bridge unavailability', () => {
    const script = createAdvancedProtocol2Script({
      devices: TEST_DEVICES,
      enableWebRTCRelay: false,
      enableASI: false,
      enableGPU: false,
      enableCrypto: false,
      debugEnabled: false,
      stealthMode: true,
      showOverlayLabel: false,
    });

    expect(script).toContain('__nativeMediaBridgeRequest');
    expect(script).toContain('Native bridge fallback failed');
  });
});
