/**
 * Comprehensive Protocol1 Android Bulletproof Tests
 *
 * Validates the bulletproof MediaStream Constructor Override protocol
 * that must pass even the strictest website detection checks on Android.
 *
 * Tests cover:
 * 1. Script validity & structure
 * 2. Initialization guard & IIFE wrapper
 * 3. Native function masking (maskAsNative)
 * 4. MediaDeviceInfo prototype chain & instanceof patching
 * 5. InputDeviceInfo with getCapabilities for videoinput
 * 6. toJSON on device info objects
 * 7. createDeviceInfo factory with getter-based properties
 * 8. enumerateDevices: videoinput, audioinput, audiooutput
 * 9. getSupportedConstraints completeness
 * 10. getUserMedia interception & fallback
 * 11. Track metadata spoofing (id, label, readyState, muted, enabled, kind)
 * 12. Track getSettings, getCapabilities, getConstraints, applyConstraints
 * 13. Silent audio track injection
 * 14. navigator.permissions.query override
 * 15. ondevicechange event support
 * 16. MediaStream constructor override
 * 17. Stream health check (auto-recreate)
 * 18. Public API (__protocol1)
 * 19. React Native WebView notification
 * 20. Configuration embedding
 */

import { createProtocol1MediaStreamOverride } from '@/utils/deepInjectionProtocols';

describe('Protocol1 Android Bulletproof MediaStream Override', () => {
  let script: string;

  beforeAll(() => {
    script = createProtocol1MediaStreamOverride({
      width: 1920,
      height: 1080,
      fps: 30,
      deviceLabel: 'Camera',
      deviceId: 'injected-camera-0',
      showDebugOverlay: false,
      useTestPattern: true,
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

  it('should be a non-trivial script (>500 chars)', () => {
    expect(script.length).toBeGreaterThan(500);
  });

  it('should not contain interpolation errors (NaN)', () => {
    expect(script).not.toContain(': NaN,');
  });

  it('should end with true for WebView injection', () => {
    expect(script.trim()).toMatch(/true;\s*$/);
  });

  // ------------------------------------------------------------------
  // Initialization guard
  // ------------------------------------------------------------------

  it('should guard against double initialization', () => {
    expect(script).toContain('window.__protocol1Initialized');
    expect(script).toContain('Already initialized');
  });

  it('should set initialization flag', () => {
    expect(script).toContain('window.__protocol1Initialized = true');
  });

  // ------------------------------------------------------------------
  // Native function masking
  // ------------------------------------------------------------------

  it('should define maskAsNative function', () => {
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
    expect(script).toContain("maskAsNative(SpoofedMediaDeviceInfo.prototype.toJSON, 'toJSON')");
  });

  it('should mask getCapabilities as native', () => {
    expect(script).toContain("maskAsNative(SpoofedInputDeviceInfo.prototype.getCapabilities, 'getCapabilities')");
  });

  it('should mask permissions.query as native', () => {
    expect(script).toContain("maskAsNative(navigator.permissions.query, 'query')");
  });

  it('should mask fn.toString and fn.toString.toString', () => {
    expect(script).toContain('fn.toString = function()');
    expect(script).toContain('fn.toString.toString');
  });

  it('should set function length and name via defineProperty', () => {
    expect(script).toContain("Object.defineProperty(fn, 'length'");
    expect(script).toContain("Object.defineProperty(fn, 'name'");
  });

  // ------------------------------------------------------------------
  // MediaDeviceInfo prototype chain
  // ------------------------------------------------------------------

  it('should include SpoofedMediaDeviceInfo constructor', () => {
    expect(script).toContain('function SpoofedMediaDeviceInfo');
  });

  it('should include SpoofedInputDeviceInfo constructor', () => {
    expect(script).toContain('function SpoofedInputDeviceInfo');
  });

  it('should set up SpoofedMediaDeviceInfo prototype from RealMediaDeviceInfo', () => {
    expect(script).toContain('SpoofedMediaDeviceInfo.prototype = Object.create(RealMediaDeviceInfo.prototype');
  });

  it('should set up SpoofedInputDeviceInfo prototype from SpoofedMediaDeviceInfo', () => {
    expect(script).toContain('SpoofedInputDeviceInfo.prototype = Object.create(SpoofedMediaDeviceInfo.prototype');
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
  // Symbol.hasInstance patching
  // ------------------------------------------------------------------

  it('should patch Symbol.hasInstance on global constructors', () => {
    expect(script).toContain('Symbol.hasInstance');
    expect(script).toContain('Object.defineProperty(RealMediaDeviceInfo, Symbol.hasInstance');
    expect(script).toContain('Object.defineProperty(RealInputDeviceInfo, Symbol.hasInstance');
  });

  it('should allow spoofed objects to pass instanceof checks', () => {
    expect(script).toContain('inst instanceof SpoofedMediaDeviceInfo');
    expect(script).toContain('inst instanceof SpoofedInputDeviceInfo');
  });

  // ------------------------------------------------------------------
  // toJSON
  // ------------------------------------------------------------------

  it('should define toJSON on SpoofedMediaDeviceInfo prototype', () => {
    expect(script).toContain('.toJSON = function()');
    expect(script).toContain('this.deviceId');
    expect(script).toContain('this.kind');
    expect(script).toContain('this.label');
    expect(script).toContain('this.groupId');
  });

  it('should also patch global MediaDeviceInfo.prototype.toJSON', () => {
    expect(script).toContain('MediaDeviceInfo.prototype.toJSON');
  });

  // ------------------------------------------------------------------
  // InputDeviceInfo getCapabilities
  // ------------------------------------------------------------------

  it('should define getCapabilities on SpoofedInputDeviceInfo', () => {
    expect(script).toContain('SpoofedInputDeviceInfo.prototype.getCapabilities');
  });

  it('should return capabilities for videoinput kind', () => {
    expect(script).toContain("this.kind === 'videoinput'");
  });

  it('should include facingMode in device capabilities', () => {
    expect(script).toContain("facingMode: ['user', 'environment']");
  });

  it('should also patch global InputDeviceInfo.prototype.getCapabilities', () => {
    expect(script).toContain('InputDeviceInfo.prototype.getCapabilities');
  });

  // ------------------------------------------------------------------
  // createDeviceInfo factory
  // ------------------------------------------------------------------

  it('should create device info via createDeviceInfo factory', () => {
    expect(script).toContain('function createDeviceInfo');
  });

  it('should use getter-based properties on device info objects', () => {
    expect(script).toContain('Object.defineProperties(obj');
    expect(script).toContain('enumerable: true');
  });

  it('should use SpoofedInputDeviceInfo for videoinput', () => {
    expect(script).toContain("(kind === 'videoinput') ? new SpoofedInputDeviceInfo() : new SpoofedMediaDeviceInfo()");
  });

  // ------------------------------------------------------------------
  // enumerateDevices
  // ------------------------------------------------------------------

  it('should use createDeviceInfo for camera devices', () => {
    expect(script).toContain("createDeviceInfo(CONFIG.deviceId");
    expect(script).toContain("'videoinput'");
  });

  it('should add a microphone device', () => {
    expect(script).toContain("'audioinput'");
    expect(script).toContain("'Microphone'");
  });

  it('should add an audio output device', () => {
    expect(script).toContain("'audiooutput'");
    expect(script).toContain("'speaker-default'");
    expect(script).toContain("'Speaker'");
  });

  // ------------------------------------------------------------------
  // getSupportedConstraints completeness
  // ------------------------------------------------------------------

  it('should return comprehensive supported constraints', () => {
    expect(script).toContain('width: true');
    expect(script).toContain('height: true');
    expect(script).toContain('frameRate: true');
    expect(script).toContain('facingMode: true');
    expect(script).toContain('aspectRatio: true');
    expect(script).toContain('autoGainControl: true');
    expect(script).toContain('echoCancellation: true');
    expect(script).toContain('noiseSuppression: true');
    expect(script).toContain('sampleRate: true');
    expect(script).toContain('sampleSize: true');
    expect(script).toContain('channelCount: true');
    expect(script).toContain('displaySurface: true');
  });

  // ------------------------------------------------------------------
  // getUserMedia interception
  // ------------------------------------------------------------------

  it('should intercept getUserMedia with video constraints', () => {
    expect(script).toContain('getUserMedia INTERCEPTED');
  });

  it('should fall back to original for audio-only', () => {
    expect(script).toContain('originalGetUserMedia');
  });

  it('should throw DOMException when original is not available', () => {
    expect(script).toContain('DOMException');
    expect(script).toContain('NotFoundError');
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
    expect(script).toContain("return 'live'");
  });

  it('should spoof track muted', () => {
    expect(script).toContain("Object.defineProperty(videoTrack, 'muted'");
    expect(script).toContain('return false');
  });

  it('should spoof track enabled', () => {
    expect(script).toContain("Object.defineProperty(videoTrack, 'enabled'");
    expect(script).toContain('return true');
  });

  it('should spoof track kind', () => {
    expect(script).toContain("Object.defineProperty(videoTrack, 'kind'");
  });

  it('should spoof getSettings with proper fields', () => {
    expect(script).toContain('videoTrack.getSettings = function()');
    expect(script).toContain('facingMode:');
    expect(script).toContain('deviceId:');
    expect(script).toContain('groupId:');
    expect(script).toContain('resizeMode:');
    expect(script).toContain('aspectRatio:');
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
  // MediaStream constructor override
  // ------------------------------------------------------------------

  it('should override window.MediaStream', () => {
    expect(script).toContain('window.MediaStream = function MediaStream');
  });

  it('should preserve MediaStream prototype', () => {
    expect(script).toContain('window.MediaStream.prototype = OriginalMediaStream.prototype');
  });

  it('should store original MediaStream constructor', () => {
    expect(script).toContain('var OriginalMediaStream = window.MediaStream');
  });

  it('should handle MediaStream called without arguments', () => {
    expect(script).toContain('new OriginalMediaStream()');
  });

  it('should handle MediaStream called with injectedStream', () => {
    expect(script).toContain('arg === injectedStream');
  });

  it('should handle MediaStream called with existing stream or track array', () => {
    expect(script).toContain('instanceof OriginalMediaStream');
    expect(script).toContain('Array.isArray(arg)');
  });

  it('should only replace MediaStream when video tracks are present', () => {
    expect(script).toContain('hasVideoInStream');
    expect(script).toContain('hasVideoInArray');
    expect(script).toContain('getVideoTracks');
  });

  it('should set MediaStream.name to "MediaStream"', () => {
    expect(script).toContain("Object.defineProperty(window.MediaStream, 'name'");
    expect(script).toContain("value: 'MediaStream'");
  });

  // ------------------------------------------------------------------
  // Stream health check
  // ------------------------------------------------------------------

  it('should implement stream health check', () => {
    expect(script).toContain('function getHealthyStream');
    expect(script).toContain('Stream unhealthy, recreating');
  });

  it('should track stream health via internal ended flag', () => {
    expect(script).toContain('injectedStreamEnded');
    expect(script).toContain("addEventListener('ended'");
  });

  // ------------------------------------------------------------------
  // Canvas & animation
  // ------------------------------------------------------------------

  it('should create canvas with CONFIG dimensions', () => {
    expect(script).toContain('canvas.width = CONFIG.width');
    expect(script).toContain('canvas.height = CONFIG.height');
  });

  it('should use optimized canvas context', () => {
    expect(script).toContain('alpha: false');
    expect(script).toContain('desynchronized: true');
  });

  it('should render animated gradient with hue shift', () => {
    expect(script).toContain('createLinearGradient');
    expect(script).toContain('addColorStop');
  });

  it('should render PROTOCOL 1 text on canvas', () => {
    expect(script).toContain("'PROTOCOL 1'");
  });

  it('should track frame count', () => {
    expect(script).toContain('frameCount++');
  });

  it('should support debug overlay', () => {
    expect(script).toContain('CONFIG.showDebugOverlay');
    expect(script).toContain('PROTOCOL 1 ACTIVE');
  });

  it('should capture stream from canvas', () => {
    expect(script).toContain('canvas.captureStream(CONFIG.fps)');
  });

  it('should implement stop and start animation', () => {
    expect(script).toContain('function startAnimation');
    expect(script).toContain('function stopAnimation');
    expect(script).toContain('cancelAnimationFrame');
  });

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------

  it('should expose __protocol1 on window', () => {
    expect(script).toContain('window.__protocol1');
  });

  it('should expose getStatus API', () => {
    expect(script).toContain('getStatus: function()');
    expect(script).toContain('initialized: true');
    expect(script).toContain('animating:');
    expect(script).toContain('hasStream:');
    expect(script).toContain('frameCount:');
  });

  it('should expose restart API', () => {
    expect(script).toContain('restart: function()');
  });

  it('should expose getFrameCount API', () => {
    expect(script).toContain('getFrameCount: function()');
  });

  it('should expose stopAnimation and startAnimation', () => {
    expect(script).toContain('stopAnimation: stopAnimation');
    expect(script).toContain('startAnimation: startAnimation');
  });

  // ------------------------------------------------------------------
  // React Native communication
  // ------------------------------------------------------------------

  it('should notify React Native on ready', () => {
    expect(script).toContain("type: 'protocol1Ready'");
    expect(script).toContain('ReactNativeWebView');
    expect(script).toContain('postMessage');
  });

  // ------------------------------------------------------------------
  // navigator.mediaDevices existence check
  // ------------------------------------------------------------------

  it('should ensure navigator.mediaDevices exists', () => {
    expect(script).toContain('if (!navigator.mediaDevices)');
    expect(script).toContain('navigator.mediaDevices = {}');
  });

  // ------------------------------------------------------------------
  // Safe binding of original methods
  // ------------------------------------------------------------------

  it('should safely bind original mediaDevices methods with type checks', () => {
    expect(script).toContain("typeof navigator.mediaDevices.getUserMedia === 'function'");
    expect(script).toContain("typeof navigator.mediaDevices.enumerateDevices === 'function'");
    expect(script).toContain('Failed to bind original mediaDevices methods');
  });

  // ------------------------------------------------------------------
  // Android WebView compatibility (var instead of const/let)
  // ------------------------------------------------------------------

  it('should use var for wider WebView compatibility', () => {
    expect(script).toContain('var CONFIG');
    expect(script).toContain('var OriginalMediaStream');
    expect(script).toContain('var injectedStream');
    expect(script).toContain('var canvas');
  });
});

describe('Protocol1 with different configurations', () => {
  it('should embed custom resolution', () => {
    const script = createProtocol1MediaStreamOverride({
      width: 3840,
      height: 2160,
      fps: 60,
    });
    expect(script).toContain('"width":3840');
    expect(script).toContain('"height":2160');
    expect(script).toContain('"fps":60');
  });

  it('should embed custom device label and ID', () => {
    const script = createProtocol1MediaStreamOverride({
      deviceLabel: 'HD Camera Pro',
      deviceId: 'custom-cam-42',
    });
    expect(script).toContain('HD Camera Pro');
    expect(script).toContain('custom-cam-42');
  });

  it('should respect debug overlay flag', () => {
    const debugScript = createProtocol1MediaStreamOverride({
      showDebugOverlay: true,
    });
    const silentScript = createProtocol1MediaStreamOverride({
      showDebugOverlay: false,
    });
    expect(debugScript).toContain('"showDebugOverlay":true');
    expect(silentScript).toContain('"showDebugOverlay":false');
  });

  it('should handle default config (no overrides)', () => {
    const script = createProtocol1MediaStreamOverride();
    expect(() => new Function(script)).not.toThrow();
    expect(script).toContain('"width":1080');
    expect(script).toContain('"height":1920');
    expect(script).toContain('"fps":30');
  });

  it('should handle partial config override', () => {
    const script = createProtocol1MediaStreamOverride({ width: 640 });
    expect(script).toContain('"width":640');
    expect(script).toContain('"height":1920'); // default
    expect(() => new Function(script)).not.toThrow();
  });

  it('should log target resolution', () => {
    const script = createProtocol1MediaStreamOverride({
      width: 1280,
      height: 720,
      fps: 24,
    });
    expect(script).toContain('Target resolution: 1280x720 @ 24fps');
  });
});

describe('Protocol1 script structure integrity', () => {
  let script: string;

  beforeAll(() => {
    script = createProtocol1MediaStreamOverride();
  });

  it('should contain balanced parentheses in IIFE', () => {
    const opens = (script.match(/\(/g) || []).length;
    const closes = (script.match(/\)/g) || []).length;
    expect(opens).toBe(closes);
  });

  it('should contain balanced curly braces', () => {
    const opens = (script.match(/\{/g) || []).length;
    const closes = (script.match(/\}/g) || []).length;
    expect(opens).toBe(closes);
  });

  it('should not contain undefined or null literals from config interpolation', () => {
    expect(script).not.toContain(': undefined,');
    expect(script).not.toContain(': undefined}');
  });

  it('should be under injection size limits', () => {
    // Must be under the 180KB limit used in app/index.tsx
    expect(script.length).toBeLessThan(180000);
  });

  it('should not contain arrow functions (Android WebView compat)', () => {
    // The injected JavaScript should avoid arrow functions for older WebViews
    // Check inside the IIFE body (after 'use strict')
    const iifeBody = script.substring(script.indexOf("'use strict'"));
    expect(iifeBody).not.toMatch(/=>\s*\{/);
    expect(iifeBody).not.toMatch(/=>\s*[^{]/);
  });

  it('should not use const or let (Android WebView compat)', () => {
    const iifeBody = script.substring(script.indexOf("'use strict'"));
    // Check there are no const/let declarations (should use var)
    expect(iifeBody).not.toMatch(/\bconst\s+/);
    expect(iifeBody).not.toMatch(/\blet\s+/);
  });

  it('should not use optional chaining (?.) (Android WebView compat)', () => {
    const iifeBody = script.substring(script.indexOf("'use strict'"));
    expect(iifeBody).not.toContain('?.');
  });
});

describe('Protocol1 vs Protocol0 feature parity', () => {
  let p1Script: string;

  beforeAll(() => {
    p1Script = createProtocol1MediaStreamOverride();
  });

  it('should have getUserMedia override like Protocol0', () => {
    expect(p1Script).toContain('navigator.mediaDevices.getUserMedia');
  });

  it('should have enumerateDevices override like Protocol0', () => {
    expect(p1Script).toContain('navigator.mediaDevices.enumerateDevices');
  });

  it('should have getSupportedConstraints like Protocol0', () => {
    expect(p1Script).toContain('navigator.mediaDevices.getSupportedConstraints');
  });

  it('should have permissions override like Protocol0', () => {
    expect(p1Script).toContain('navigator.permissions.query');
  });

  it('should have native masking like Protocol0', () => {
    expect(p1Script).toContain('maskAsNative');
  });

  it('should have canvas-based stream like Protocol0', () => {
    expect(p1Script).toContain('captureStream');
    expect(p1Script).toContain('canvas');
  });

  it('should have audio track support like Protocol0', () => {
    expect(p1Script).toContain('AudioContext');
    expect(p1Script).toContain('createOscillator');
    expect(p1Script).toContain('createMediaStreamDestination');
  });

  it('should have React Native notification like Protocol0', () => {
    expect(p1Script).toContain('ReactNativeWebView');
    expect(p1Script).toContain('postMessage');
  });

  it('should ADDITIONALLY have MediaStream constructor override (unique to Protocol1)', () => {
    expect(p1Script).toContain('window.MediaStream = function MediaStream');
    expect(p1Script).toContain('OriginalMediaStream');
  });

  it('should ADDITIONALLY have stream health check (unique to Protocol1)', () => {
    expect(p1Script).toContain('getHealthyStream');
  });
});
