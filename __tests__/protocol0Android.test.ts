/**
 * Comprehensive Protocol0 Android Tests
 *
 * Validates bulletproof MediaDeviceInfo handling and all Protocol0 features
 * that must pass even the strictest website detection checks on Android.
 *
 * Tests cover:
 * 1. MediaDeviceInfo prototype chain & instanceof checks
 * 2. InputDeviceInfo with getCapabilities() for videoinput
 * 3. enumerateDevices returns spec-compliant objects
 * 4. toJSON() on device info objects
 * 5. Native function toString() masking
 * 6. navigator.permissions.query override
 * 7. ondevicechange event support
 * 8. getSupportedConstraints completeness
 * 9. getUserMedia interception & stream creation
 * 10. Track metadata spoofing
 * 11. WebRTC injection script parallel improvements
 */

import { createProtocol0Script } from '@/utils/deepInjectionProtocols';
import { createWebRTCInjectionScript } from '@/utils/webrtc/WebRTCInjectionScript';
import type { CaptureDevice } from '@/types/device';

// Shared test devices
const TEST_DEVICES: CaptureDevice[] = [
  {
    id: 'cam_front_0',
    name: 'Front Camera',
    type: 'camera',
    facing: 'front',
    lensType: 'standard',
    tested: true,
    simulationEnabled: true,
    nativeDeviceId: 'native-front-0',
    groupId: 'group-front',
  },
  {
    id: 'cam_back_0',
    name: 'Back Camera',
    type: 'camera',
    facing: 'back',
    lensType: 'wide',
    tested: true,
    simulationEnabled: false,
    nativeDeviceId: 'native-back-0',
    groupId: 'group-back',
  },
];

describe('Protocol0 Android Bulletproof MediaDeviceInfo', () => {
  let script: string;

  beforeAll(() => {
    script = createProtocol0Script({
      devices: TEST_DEVICES,
      stealthMode: true,
      width: 1920,
      height: 1080,
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

  // ------------------------------------------------------------------
  // MediaDeviceInfo prototype factory
  // ------------------------------------------------------------------

  it('should include MediaDeviceInfo prototype factory', () => {
    expect(script).toContain('SpoofedMediaDeviceInfo');
    expect(script).toContain('SpoofedInputDeviceInfo');
  });

  it('should create device info via createDeviceInfo factory', () => {
    expect(script).toContain('function createDeviceInfo');
  });

  it('should set up InputDeviceInfo with getCapabilities', () => {
    expect(script).toContain('InputDeviceInfo.prototype.getCapabilities');
  });

  it('should preserve the real MediaDeviceInfo constructor reference', () => {
    expect(script).toContain('RealMediaDeviceInfo');
    expect(script).toContain('window.MediaDeviceInfo');
  });

  it('should preserve the real InputDeviceInfo constructor reference', () => {
    expect(script).toContain('RealInputDeviceInfo');
    expect(script).toContain('window.InputDeviceInfo');
  });

  // ------------------------------------------------------------------
  // instanceof patching
  // ------------------------------------------------------------------

  it('should patch Symbol.hasInstance on global constructors', () => {
    expect(script).toContain('Symbol.hasInstance');
    expect(script).toContain('RealMediaDeviceInfo[Symbol.hasInstance]');
  });

  it('should allow spoofed objects to pass instanceof MediaDeviceInfo', () => {
    expect(script).toContain('inst instanceof SpoofedMediaDeviceInfo');
    expect(script).toContain('inst instanceof SpoofedInputDeviceInfo');
  });

  // ------------------------------------------------------------------
  // toJSON
  // ------------------------------------------------------------------

  it('should define toJSON on MediaDeviceInfo prototype', () => {
    expect(script).toContain('.toJSON = function()');
    expect(script).toContain('this.deviceId');
    expect(script).toContain('this.kind');
    expect(script).toContain('this.label');
    expect(script).toContain('this.groupId');
  });

  // ------------------------------------------------------------------
  // Native function masking
  // ------------------------------------------------------------------

  it('should mask overridden functions with native code toString', () => {
    expect(script).toContain('function maskAsNative');
    expect(script).toContain('[native code]');
  });

  it('should mask getUserMedia as native', () => {
    expect(script).toContain("maskAsNative(navigator.mediaDevices.getUserMedia, 'getUserMedia')");
  });

  it('should mask enumerateDevices as native', () => {
    expect(script).toContain("maskAsNative(navigator.mediaDevices.enumerateDevices, 'enumerateDevices')");
  });

  it('should mask getSupportedConstraints as native', () => {
    expect(script).toContain("maskAsNative(navigator.mediaDevices.getSupportedConstraints, 'getSupportedConstraints')");
  });

  it('should mask toJSON as native', () => {
    expect(script).toContain("maskAsNative(MediaDeviceInfo.prototype.toJSON, 'toJSON')");
  });

  it('should mask getCapabilities as native', () => {
    expect(script).toContain("maskAsNative(InputDeviceInfo.prototype.getCapabilities, 'getCapabilities')");
  });

  // ------------------------------------------------------------------
  // enumerateDevices device list
  // ------------------------------------------------------------------

  it('should use createDeviceInfo for camera devices', () => {
    // Regex: createDeviceInfo is called for each camera device
    expect(script).toContain("createDeviceInfo(");
    expect(script).toContain("'videoinput'");
  });

  it('should add a microphone device', () => {
    expect(script).toContain("'audioinput'");
    expect(script).toContain("'Microphone'");
  });

  it('should add an audio output device', () => {
    expect(script).toContain("'audiooutput'");
    expect(script).toContain("'speaker-default'");
  });

  it('should use getter-based properties on device info objects', () => {
    expect(script).toContain('Object.defineProperties(obj');
    expect(script).toContain('enumerable: true');
  });

  // ------------------------------------------------------------------
  // Permissions API
  // ------------------------------------------------------------------

  it('should override navigator.permissions.query for camera', () => {
    expect(script).toContain('navigator.permissions');
    expect(script).toContain("desc.name === 'camera'");
    expect(script).toContain("state: 'granted'");
  });

  it('should override navigator.permissions.query for microphone', () => {
    expect(script).toContain("desc.name === 'microphone'");
  });

  it('should mask permissions.query as native', () => {
    expect(script).toContain("maskAsNative(navigator.permissions.query, 'query')");
  });

  // ------------------------------------------------------------------
  // ondevicechange
  // ------------------------------------------------------------------

  it('should set up ondevicechange property', () => {
    expect(script).toContain('ondevicechange');
    expect(script).toContain("Object.defineProperty(navigator.mediaDevices, 'ondevicechange'");
  });

  it('should provide addEventListener/removeEventListener fallbacks', () => {
    expect(script).toContain('navigator.mediaDevices.addEventListener');
    expect(script).toContain('navigator.mediaDevices.removeEventListener');
    expect(script).toContain('navigator.mediaDevices.dispatchEvent');
  });

  // ------------------------------------------------------------------
  // getSupportedConstraints completeness
  // ------------------------------------------------------------------

  it('should return comprehensive supported constraints', () => {
    expect(script).toContain('autoGainControl: true');
    expect(script).toContain('echoCancellation: true');
    expect(script).toContain('noiseSuppression: true');
    expect(script).toContain('sampleRate: true');
    expect(script).toContain('sampleSize: true');
    expect(script).toContain('channelCount: true');
    expect(script).toContain('displaySurface: true');
  });

  // ------------------------------------------------------------------
  // getUserMedia
  // ------------------------------------------------------------------

  it('should intercept getUserMedia with video constraints', () => {
    expect(script).toContain('getUserMedia INTERCEPTED');
    expect(script).toContain('createInjectedStream(constraints)');
  });

  it('should fall back to original for audio-only', () => {
    expect(script).toContain('originalGetUserMedia');
  });

  // ------------------------------------------------------------------
  // Track metadata spoofing
  // ------------------------------------------------------------------

  it('should spoof track id', () => {
    expect(script).toContain("Object.defineProperty(videoTrack, 'id'");
  });

  it('should spoof track label', () => {
    expect(script).toContain("Object.defineProperty(videoTrack, 'label'");
  });

  it('should spoof track readyState', () => {
    expect(script).toContain("Object.defineProperty(videoTrack, 'readyState'");
  });

  it('should spoof track muted', () => {
    expect(script).toContain("Object.defineProperty(videoTrack, 'muted'");
  });

  it('should spoof track enabled', () => {
    expect(script).toContain("Object.defineProperty(videoTrack, 'enabled'");
  });

  it('should spoof getSettings with proper fields', () => {
    expect(script).toContain('videoTrack.getSettings = function()');
    expect(script).toContain('facingMode:');
    expect(script).toContain('deviceId:');
    expect(script).toContain('groupId:');
    expect(script).toContain('resizeMode:');
  });

  it('should spoof getCapabilities on track', () => {
    expect(script).toContain('videoTrack.getCapabilities = function()');
  });

  it('should spoof getConstraints on track', () => {
    expect(script).toContain('videoTrack.getConstraints = function()');
  });

  it('should spoof applyConstraints on track', () => {
    expect(script).toContain('videoTrack.applyConstraints = function()');
  });

  // ------------------------------------------------------------------
  // Silent audio track
  // ------------------------------------------------------------------

  it('should add silent audio when audio is requested', () => {
    expect(script).toContain('AudioContext');
    expect(script).toContain('createOscillator');
    expect(script).toContain('gainNode.gain.value = 0');
    expect(script).toContain('createMediaStreamDestination');
  });

  // ------------------------------------------------------------------
  // Video loading & caching
  // ------------------------------------------------------------------

  it('should include IndexedDB caching', () => {
    expect(script).toContain('Protocol0VideoCache');
    expect(script).toContain('indexedDB');
  });

  it('should include CORS retry strategies', () => {
    expect(script).toContain('loadVideoWithCorsRetry');
    expect(script).toContain('crossOrigin');
  });

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------

  it('should expose __protocol0 on window', () => {
    expect(script).toContain('window.__protocol0');
    expect(script).toContain('setVideoUri');
    expect(script).toContain('getStatus');
    expect(script).toContain('clearCache');
    expect(script).toContain('retryVideo');
  });

  // ------------------------------------------------------------------
  // React Native communication
  // ------------------------------------------------------------------

  it('should notify React Native on ready', () => {
    expect(script).toContain("type: 'protocol0Ready'");
    expect(script).toContain('ReactNativeWebView');
  });

  // ------------------------------------------------------------------
  // Device constraint matching
  // ------------------------------------------------------------------

  it('should match devices by deviceId and facingMode', () => {
    expect(script).toContain('getDeviceForConstraints');
    expect(script).toContain('requestedId');
    expect(script).toContain('requestedFacing');
  });
});

describe('Protocol0 with different configurations', () => {
  it('should embed device data from multiple cameras', () => {
    const script = createProtocol0Script({
      devices: TEST_DEVICES,
      stealthMode: true,
    });
    expect(script).toContain('Front Camera');
    expect(script).toContain('Back Camera');
    expect(script).toContain('native-front-0');
    expect(script).toContain('native-back-0');
  });

  it('should handle empty device list without errors', () => {
    const script = createProtocol0Script({
      devices: [],
      stealthMode: true,
    });
    expect(() => new Function(script)).not.toThrow();
    expect(script).toContain('DEVICES = []');
  });

  it('should embed video URI when provided', () => {
    const script = createProtocol0Script({
      devices: TEST_DEVICES,
      videoUri: 'https://example.com/test.mp4',
    });
    expect(script).toContain('https://example.com/test.mp4');
  });

  it('should handle null video URI gracefully', () => {
    const script = createProtocol0Script({
      devices: TEST_DEVICES,
      videoUri: null,
    });
    expect(script).toContain('videoUri: null');
    expect(() => new Function(script)).not.toThrow();
  });

  it('should respect custom resolution', () => {
    const script = createProtocol0Script({
      devices: TEST_DEVICES,
      width: 3840,
      height: 2160,
      fps: 60,
    });
    expect(script).toContain('width: 3840');
    expect(script).toContain('height: 2160');
    expect(script).toContain('fps: 60');
  });

  it('should respect debug overlay flag', () => {
    const debugScript = createProtocol0Script({
      devices: TEST_DEVICES,
      showDebugOverlay: true,
    });
    const silentScript = createProtocol0Script({
      devices: TEST_DEVICES,
      showDebugOverlay: false,
    });
    expect(debugScript).toContain('showDebugOverlay: true');
    expect(silentScript).toContain('showDebugOverlay: false');
  });

  it('should respect video loading options', () => {
    const script = createProtocol0Script({
      devices: TEST_DEVICES,
      preloadVideo: false,
      enableVideoCache: false,
      showLoadingIndicator: false,
      corsRetryStrategies: false,
      videoLoadTimeout: 5000,
    });
    expect(script).toContain('preloadVideo: false');
    expect(script).toContain('enableVideoCache: false');
    expect(script).toContain('showLoadingIndicator: false');
    expect(script).toContain('corsRetryStrategies: false');
    expect(script).toContain('videoLoadTimeout: 5000');
  });
});

describe('WebRTC Injection Script MediaDeviceInfo improvements', () => {
  let script: string;

  beforeAll(() => {
    script = createWebRTCInjectionScript({
      stealthMode: true,
      deviceLabel: 'HD Camera',
      deviceId: 'rtc-cam-001',
    });
  });

  it('should produce valid JavaScript', () => {
    expect(() => new Function(script)).not.toThrow();
  });

  it('should include MediaDeviceInfo prototype factory', () => {
    expect(script).toContain('SpoofedMDI');
    expect(script).toContain('SpoofedIDI');
  });

  it('should include createDeviceInfo factory', () => {
    expect(script).toContain('function createDeviceInfo');
  });

  it('should include Symbol.hasInstance patching', () => {
    expect(script).toContain('Symbol.hasInstance');
  });

  it('should include native function masking', () => {
    expect(script).toContain('function maskAsNative');
    expect(script).toContain('[native code]');
  });

  it('should mask getUserMedia as native', () => {
    expect(script).toContain("maskAsNative(navigator.mediaDevices.getUserMedia, 'getUserMedia')");
  });

  it('should mask enumerateDevices as native', () => {
    expect(script).toContain("maskAsNative(navigator.mediaDevices.enumerateDevices, 'enumerateDevices')");
  });

  it('should return proper device list in stealth mode', () => {
    expect(script).toContain('createDeviceInfo(DEVICE_ID');
    expect(script).toContain("'videoinput'");
    expect(script).toContain("'audioinput'");
    expect(script).toContain("'audiooutput'");
  });

  it('should include InputDeviceInfo getCapabilities', () => {
    expect(script).toContain('InputDeviceInfo.prototype.getCapabilities');
  });

  it('should include toJSON on prototype', () => {
    expect(script).toContain('.toJSON = function()');
  });

  it('should mask permissions.query as native', () => {
    expect(script).toContain("maskAsNative(navigator.permissions.query, 'query')");
  });

  it('should include ondevicechange support', () => {
    expect(script).toContain('ondevicechange');
  });

  it('should include addEventListener fallback', () => {
    expect(script).toContain('navigator.mediaDevices.addEventListener');
  });

  it('should embed the custom device label', () => {
    expect(script).toContain('HD Camera');
  });

  it('should embed the custom device ID', () => {
    expect(script).toContain('rtc-cam-001');
  });

  it('should include all track spoofing methods', () => {
    expect(script).toContain('spoofTrack');
    expect(script).toContain('getSettings');
    expect(script).toContain('getCapabilities');
    expect(script).toContain('getConstraints');
    expect(script).toContain('applyConstraints');
  });

  it('should use getter-based properties on device info', () => {
    expect(script).toContain('Object.defineProperties(obj');
  });
});

describe('Protocol0 detection evasion coverage', () => {
  let script: string;

  beforeAll(() => {
    script = createProtocol0Script({
      devices: TEST_DEVICES,
      stealthMode: true,
    });
  });

  it('should not expose Protocol0 internal names in toString output', () => {
    // The masked toString should return [native code], not internal impl
    expect(script).toContain("'function ' + name + '() { [native code] }'");
  });

  it('should mask toString of toString itself', () => {
    // Double-masking to prevent toString().toString() detection
    expect(script).toContain("function toString() { [native code] }");
  });

  it('should use Object.create for proper prototype chain', () => {
    expect(script).toContain('Object.create(RealMediaDeviceInfo.prototype)');
  });

  it('should set constructor to the real constructor', () => {
    expect(script).toContain('.constructor = RealMediaDeviceInfo');
  });

  it('should handle missing MediaDeviceInfo gracefully', () => {
    // The code uses || null pattern
    expect(script).toContain('window.MediaDeviceInfo || null');
    expect(script).toContain('window.InputDeviceInfo || null');
  });

  it('should define deviceId as getter not plain property', () => {
    // Getters match native behavior; plain properties don't
    expect(script).toContain("deviceId: { get: function()");
  });

  it('should define kind as getter', () => {
    expect(script).toContain("kind:     { get: function()");
  });

  it('should define label as getter', () => {
    expect(script).toContain("label:    { get: function()");
  });

  it('should define groupId as getter', () => {
    expect(script).toContain("groupId:  { get: function()");
  });

  it('should store facingMode privately for getCapabilities', () => {
    expect(script).toContain('_facingMode');
    expect(script).toContain("enumerable: false");
  });

  it('should include all three device kinds in enumeration', () => {
    const kinds = ['videoinput', 'audioinput', 'audiooutput'];
    kinds.forEach(kind => {
      expect(script).toContain(`'${kind}'`);
    });
  });

  it('should handle fallback when origSymbol is null', () => {
    expect(script).toContain('origSymbol ? origSymbol.call(this, inst) : false');
  });
});
