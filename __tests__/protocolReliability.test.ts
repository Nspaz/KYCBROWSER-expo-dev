/**
 * Protocol Reliability Tests
 *
 * Pessimistic tests verifying every protocol can produce a working injection
 * script and that critical fallback paths are exercised.
 */

import { mergeProtocolsWithDefaults, isProtocolType } from '@/contexts/ProtocolContext';
import { createMinimalInjectionScript } from '@/constants/minimalInjection';
import { createWorkingInjectionScript } from '@/constants/workingInjection';
import { createProtocol0Script } from '@/utils/deepInjectionProtocols';
import { createAdvancedProtocol2Script } from '@/utils/advancedProtocol/browserScript';
import { createWebRtcLoopbackInjectionScript } from '@/constants/webrtcLoopback';
import { createSonnetProtocolScript } from '@/constants/sonnetProtocol';
import { createMediaInjectionScript } from '@/constants/browserScripts';
import type { CaptureDevice } from '@/types/device';

// Minimal device fixture
const TEST_DEVICES: CaptureDevice[] = [
  {
    id: 'cam0',
    nativeDeviceId: 'cam0_native',
    name: 'Front Camera',
    type: 'camera',
    facing: 'front',
    lensType: 'wide',
    isDefault: true,
    isPrimary: true,
    groupId: 'default',
    tested: false,
    simulationEnabled: true,
    capabilities: {
      videoResolutions: [{ width: 1280, height: 720, maxFps: 30, label: '720p' }],
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Validate that a generated script is non-empty and free of obvious interpolation errors */
function assertValidScript(script: string, _label: string) {
  expect(script.length).toBeGreaterThan(50);

  // Must not contain NaN literals from bad numeric interpolation
  expect(script).not.toContain(': NaN,');

  // Should be wrapped in an IIFE or at least contain function definitions
  expect(script).toMatch(/function|=>/);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Protocol Reliability', () => {
  describe('Protocol defaults produce enabled protocols', () => {
    it('all four protocols are enabled by default', () => {
      const protocols = mergeProtocolsWithDefaults();
      expect(protocols.stealth.enabled).toBe(true);
      expect(protocols.relay.enabled).toBe(true);
      expect(protocols.bridge.enabled).toBe(true);
      expect(protocols.shield.enabled).toBe(true);
    });

    it('bridge protocol is enabled even in Expo Go', () => {
      // After our fix, bridge.enabled is always true
      const protocols = mergeProtocolsWithDefaults();
      expect(protocols.bridge.enabled).toBe(true);
    });
  });

  describe('Fallback protocol types are valid ProtocolType values', () => {
    it('"bridge" and "stealth" are valid ProtocolType', () => {
      expect(isProtocolType('bridge')).toBe(true);
      expect(isProtocolType('stealth')).toBe(true);
    });

    it('"websocket" and "standard" are NOT valid ProtocolType', () => {
      expect(isProtocolType('websocket')).toBe(false);
      expect(isProtocolType('standard')).toBe(false);
    });
  });

  describe('Stealth protocol injection script generation', () => {
    it('Protocol0 generates valid JavaScript', () => {
      const script = createProtocol0Script({
        devices: TEST_DEVICES,
        videoUri: null,
        width: 1280,
        height: 720,
        fps: 30,
        stealthMode: true,
      });
      assertValidScript(script, 'Protocol0');
    });

    it('Protocol0 script contains getUserMedia override', () => {
      const script = createProtocol0Script({
        devices: TEST_DEVICES,
        videoUri: null,
        stealthMode: true,
      });
      expect(script).toContain('getUserMedia');
      expect(script).toContain('enumerateDevices');
      expect(script).toContain('captureStream');
    });

    it('Protocol0 works without videoUri (green screen fallback)', () => {
      const script = createProtocol0Script({
        devices: TEST_DEVICES,
        videoUri: null,
        stealthMode: true,
      });
      assertValidScript(script, 'Protocol0-no-video');
      // Should still produce a script that creates a canvas stream
      expect(script).toContain('canvas');
    });
  });

  describe('Relay protocol injection script generation', () => {
    it('Advanced Relay generates valid JavaScript', () => {
      const script = createAdvancedProtocol2Script({
        devices: TEST_DEVICES,
        enableWebRTCRelay: false,
        enableASI: true,
        enableGPU: false,
        enableCrypto: false,
        debugEnabled: true,
        stealthMode: true,
        showOverlayLabel: false,
      });
      assertValidScript(script, 'AdvancedRelay');
    });

    it('Advanced Relay script contains emergency canvas fallback', () => {
      const script = createAdvancedProtocol2Script({
        devices: TEST_DEVICES,
        enableWebRTCRelay: false,
        enableASI: true,
        enableGPU: false,
        enableCrypto: false,
        debugEnabled: false,
        stealthMode: true,
        showOverlayLabel: false,
      });
      expect(script).toContain('emergencyCanvas');
      expect(script).toContain('Emergency canvas');
    });
  });

  describe('Bridge protocol injection script generation', () => {
    it('WebRTC Loopback generates valid JavaScript', () => {
      const script = createWebRtcLoopbackInjectionScript({
        devices: TEST_DEVICES,
        debugEnabled: true,
        requireNativeBridge: false,
      });
      assertValidScript(script, 'WebRtcLoopback');
    });

    it('WebRTC Loopback contains canvas fallback', () => {
      const script = createWebRtcLoopbackInjectionScript({
        devices: TEST_DEVICES,
        debugEnabled: true,
        requireNativeBridge: true,
      });
      expect(script).toContain('createCanvasFallbackStream');
      expect(script).toContain('Bridge Fallback');
    });
  });

  describe('Shield protocol injection script generation', () => {
    it('Media injection generates valid JavaScript', () => {
      const script = createMediaInjectionScript(TEST_DEVICES, {
        stealthMode: true,
        forceSimulation: true,
        debugEnabled: true,
        permissionPromptEnabled: false,
      });
      assertValidScript(script, 'MediaInjection');
    });

    it('Media injection with permissionPromptEnabled=false auto-simulates', () => {
      const script = createMediaInjectionScript(TEST_DEVICES, {
        stealthMode: true,
        forceSimulation: true,
        permissionPromptEnabled: false,
      });
      // The script should contain the auto resolve path
      expect(script).toContain('permissionPromptEnabled');
    });
  });

  describe('Working Injection (fallback) script generation', () => {
    it('generates valid JavaScript without video', () => {
      const script = createWorkingInjectionScript({
        devices: TEST_DEVICES,
        stealthMode: true,
        debugEnabled: true,
      });
      assertValidScript(script, 'WorkingInjection');
    });

    it('generates valid JavaScript with video URI', () => {
      const script = createWorkingInjectionScript({
        videoUri: 'https://example.com/video.mp4',
        devices: TEST_DEVICES,
        stealthMode: true,
        debugEnabled: false,
      });
      assertValidScript(script, 'WorkingInjection-with-video');
    });
  });

  describe('Minimal Injection (ultimate fallback) script generation', () => {
    it('generates valid JavaScript', () => {
      const script = createMinimalInjectionScript();
      assertValidScript(script, 'MinimalInjection');
    });

    it('contains getUserMedia and enumerateDevices overrides', () => {
      const script = createMinimalInjectionScript();
      expect(script).toContain('getUserMedia');
      expect(script).toContain('enumerateDevices');
      expect(script).toContain('captureStream');
    });
  });

  describe('Sonnet AI protocol script generation', () => {
    it('generates valid JavaScript', () => {
      const script = createSonnetProtocolScript(
        TEST_DEVICES,
        {
          enabled: true,
          aiAdaptiveQuality: true,
          behavioralMimicry: true,
          neuralStyleTransfer: false,
          predictiveFrameOptimization: true,
          quantumTimingRandomness: true,
          biometricSimulation: true,
          realTimeProfiler: true,
          adaptiveStealth: true,
          performanceTarget: 'balanced',
          stealthIntensity: 'maximum',
          learningMode: true,
        },
        undefined,
      );
      assertValidScript(script, 'SonnetProtocol');
    });

    it('script size is within injection limits', () => {
      const script = createSonnetProtocolScript(
        TEST_DEVICES,
        {
          enabled: true,
          aiAdaptiveQuality: true,
          behavioralMimicry: true,
          neuralStyleTransfer: false,
          predictiveFrameOptimization: true,
          quantumTimingRandomness: true,
          biometricSimulation: true,
          realTimeProfiler: true,
          adaptiveStealth: true,
          performanceTarget: 'balanced',
          stealthIntensity: 'maximum',
          learningMode: true,
        },
        undefined,
      );
      // Must be under the 180KB limit used in app/index.tsx
      expect(script.length).toBeLessThan(180000);
    });
  });

  describe('Permission prompt timeout behaviour', () => {
    it('browserScripts timeout action is simulate, not deny', () => {
      // Read the source to verify - this is a static analysis test
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fs = require('fs');
      const source = fs.readFileSync(
        require.resolve('@/constants/browserScripts'),
        'utf8',
      );
      // After fix: timeout should auto-simulate
      expect(source).toContain("auto-simulating");
      expect(source).not.toContain("Permission prompt timed out, denying");
      expect(source).not.toContain("timed out after 60s, denying");
    });
  });
});
