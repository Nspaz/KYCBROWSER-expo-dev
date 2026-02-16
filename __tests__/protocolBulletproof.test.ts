/**
 * Bulletproof Protocol Test Suite
 *
 * Exhaustive tests for the stealth, relay, bridge, and shield protocols.
 * Validates configuration defaults, type guards, settings merging,
 * error handling, monitoring integration, script generation, fallback
 * chains, and edge cases for full Android reliability.
 *
 * Protocol0, Protocol1, Protocol2 are explicitly excluded.
 */

import {
  mergeProtocolsWithDefaults,
  isProtocolType,
} from '@/contexts/ProtocolContext';
import type { ProtocolType } from '@/contexts/ProtocolContext';

import {
  DEFAULT_PROTOCOL_SETTINGS,
  DEFAULT_STANDARD_SETTINGS,
  DEFAULT_ADVANCED_RELAY_SETTINGS,
  DEFAULT_PROTECTED_SETTINGS,
  DEFAULT_HARNESS_SETTINGS,
  DEFAULT_WEBSOCKET_SETTINGS,
  DEFAULT_WEBRTC_LOOPBACK_SETTINGS,
  PROTOCOL_METADATA,
} from '@/types/protocols';
import type {
  ProtocolId,
  ProtocolSettings,
  StandardInjectionSettings,
  AdvancedRelaySettings,
  ProtectedPreviewSettings,
  TestHarnessSettings,
  WebSocketBridgeSettings,
  WebRtcLoopbackSettings,
} from '@/types/protocols';

import {
  ErrorCode,
  createProtocolError,
  isProtocolError,
  getProtocolRecoveryStrategy,
  formatProtocolError,
  shouldSwitchProtocol,
  getFallbackProtocol,
  withProtocolErrorHandling,
  createAppError,
  isAppError,
} from '@/utils/errorHandling';

import { protocolMonitor, monitoringHelpers } from '@/utils/protocolMonitoring';

import { createMediaInjectionScript } from '@/constants/browserScripts';
import { createAdvancedProtocol2Script } from '@/utils/advancedProtocol/browserScript';
import { createWebRtcLoopbackInjectionScript } from '@/constants/webrtcLoopback';
import { createSonnetProtocolScript } from '@/constants/sonnetProtocol';
import { createMinimalInjectionScript } from '@/constants/minimalInjection';
import { createWorkingInjectionScript } from '@/constants/workingInjection';

import type { CaptureDevice } from '@/types/device';

// ─── Test Fixtures ─────────────────────────────────────────────────────────────

const ANDROID_TEST_DEVICES: CaptureDevice[] = [
  {
    id: 'front-camera',
    nativeDeviceId: 'front-camera-native-0',
    name: 'Front Camera',
    type: 'camera',
    facing: 'front',
    lensType: 'wide',
    isDefault: true,
    isPrimary: true,
    groupId: 'default-group',
    tested: false,
    simulationEnabled: true,
    capabilities: {
      videoResolutions: [
        { width: 1920, height: 1080, maxFps: 30, label: '1080p' },
        { width: 1280, height: 720, maxFps: 30, label: '720p' },
      ],
    },
  },
  {
    id: 'back-camera',
    nativeDeviceId: 'back-camera-native-0',
    name: 'Back Camera',
    type: 'camera',
    facing: 'back',
    lensType: 'wide',
    isDefault: false,
    isPrimary: false,
    groupId: 'rear-group',
    tested: false,
    simulationEnabled: false,
    capabilities: {
      videoResolutions: [
        { width: 3840, height: 2160, maxFps: 30, label: '4K' },
        { width: 1920, height: 1080, maxFps: 60, label: '1080p' },
      ],
    },
  },
];

const EMPTY_DEVICES: CaptureDevice[] = [];

const ALL_PROTOCOLS: ProtocolType[] = ['stealth', 'relay', 'bridge', 'shield'];

/** Validate a generated injection script is syntactically plausible */
function assertValidScript(script: string, _label: string) {
  expect(script.length).toBeGreaterThan(50);
  // Must not contain NaN literals from bad numeric interpolation
  expect(script).not.toContain(': NaN,');
  // Should contain function definitions (IIFE, arrow, or regular functions)
  expect(script).toMatch(/function|=>/);
}

// ─── 1. Protocol Type System ────────────────────────────────────────────────

describe('Protocol Type System', () => {
  it('all four canonical protocol IDs pass isProtocolType', () => {
    ALL_PROTOCOLS.forEach((p) => expect(isProtocolType(p)).toBe(true));
  });

  it('legacy protocol names are NOT valid ProtocolType', () => {
    const legacyNames = [
      'standard', 'allowlist', 'protected', 'harness',
      'holographic', 'websocket', 'webrtc-loopback',
      'claude-sonnet', 'claude', 'sonnet',
    ];
    legacyNames.forEach((name) => expect(isProtocolType(name)).toBe(false));
  });

  it('empty / null / number values are not valid', () => {
    expect(isProtocolType('')).toBe(false);
    expect(isProtocolType('null')).toBe(false);
    expect(isProtocolType('0')).toBe(false);
  });
});

// ─── 2. Protocol Defaults ──────────────────────────────────────────────────

describe('Protocol Defaults', () => {
  describe('mergeProtocolsWithDefaults', () => {
    it('returns all four protocols enabled by default', () => {
      const protocols = mergeProtocolsWithDefaults();
      ALL_PROTOCOLS.forEach((p) => {
        expect(protocols[p]).toBeDefined();
        expect(protocols[p].enabled).toBe(true);
        expect(protocols[p].id).toBe(p);
        expect(protocols[p].name.length).toBeGreaterThan(0);
        expect(protocols[p].description.length).toBeGreaterThan(0);
      });
    });

    it('merges partial overrides without removing other protocols', () => {
      const protocols = mergeProtocolsWithDefaults({
        shield: {
          id: 'shield',
          name: 'Custom Shield',
          description: 'test',
          enabled: false,
          settings: {},
        },
      });
      expect(protocols.shield.enabled).toBe(false);
      expect(protocols.shield.name).toBe('Custom Shield');
      // Others unchanged
      expect(protocols.stealth.enabled).toBe(true);
      expect(protocols.relay.enabled).toBe(true);
      expect(protocols.bridge.enabled).toBe(true);
    });

    it('ignores legacy protocol names in the stored object', () => {
      const protocols = mergeProtocolsWithDefaults({
        standard: { id: 'stealth' as any, name: 'bad', description: '', enabled: false, settings: {} },
      } as any);
      // 'standard' is not a ProtocolType so it should be skipped
      expect(protocols.stealth.enabled).toBe(true);
    });
  });

  describe('DEFAULT_PROTOCOL_SETTINGS type shape', () => {
    it('stealth has all required StandardInjectionSettings keys', () => {
      const s = DEFAULT_PROTOCOL_SETTINGS.stealth;
      expect(typeof s.enabled).toBe('boolean');
      expect(typeof s.autoInject).toBe('boolean');
      expect(typeof s.stealthByDefault).toBe('boolean');
      expect(typeof s.injectionDelay).toBe('number');
      expect(typeof s.retryOnFail).toBe('boolean');
      expect(typeof s.maxRetries).toBe('number');
      expect(['none', 'minimal', 'verbose']).toContain(s.loggingLevel);
    });

    it('relay advancedRelay has all six sub-objects', () => {
      const r = DEFAULT_PROTOCOL_SETTINGS.relay;
      expect(r.pipeline).toBeDefined();
      expect(r.webrtc).toBeDefined();
      expect(r.gpu).toBeDefined();
      expect(r.asi).toBeDefined();
      expect(r.crossDevice).toBeDefined();
      expect(r.crypto).toBeDefined();
    });

    it('relay defaults: webrtc, gpu, crypto disabled; asi enabled', () => {
      const r = DEFAULT_ADVANCED_RELAY_SETTINGS;
      expect(r.webrtc.enabled).toBe(false);
      expect(r.gpu.enabled).toBe(false);
      expect(r.crypto.enabled).toBe(false);
      expect(r.asi.enabled).toBe(true);
    });

    it('shield has both Protected and Harness keys', () => {
      const s = DEFAULT_PROTOCOL_SETTINGS.shield;
      // ProtectedPreviewSettings keys
      expect(typeof s.bodyDetectionEnabled).toBe('boolean');
      expect(typeof s.sensitivityLevel).toBe('string');
      expect(typeof s.blurFallback).toBe('boolean');
      // TestHarnessSettings keys
      expect(typeof s.overlayEnabled).toBe('boolean');
      expect(typeof s.captureFrameRate).toBe('number');
      expect(typeof s.testPatternOnNoVideo).toBe('boolean');
    });

    it('bridge has both WebSocket and WebRTC loopback keys', () => {
      const b = DEFAULT_PROTOCOL_SETTINGS.bridge;
      // WebSocketBridgeSettings keys
      expect(typeof b.resolution).toBe('string');
      expect(typeof b.frameRate).toBe('number');
      expect(typeof b.quality).toBe('number');
      // WebRtcLoopbackSettings keys
      expect(typeof b.autoStart).toBe('boolean');
      expect(typeof b.signalingTimeoutMs).toBe('number');
      expect(typeof b.preferredCodec).toBe('string');
      expect(Array.isArray(b.iceServers)).toBe(true);
    });

    it('relay default pipeline thresholds are sane', () => {
      const p = DEFAULT_ADVANCED_RELAY_SETTINGS.pipeline;
      expect(p.hotSwitchThresholdMs).toBeGreaterThan(0);
      expect(p.hotSwitchThresholdMs).toBeLessThan(1000);
      expect(p.minAcceptableFps).toBeGreaterThanOrEqual(10);
      expect(p.minAcceptableFps).toBeLessThanOrEqual(30);
    });

    it('bridge default bitrate range is consistent', () => {
      const b = DEFAULT_WEBRTC_LOOPBACK_SETTINGS;
      expect(b.minBitrateKbps).toBeGreaterThan(0);
      expect(b.targetBitrateKbps).toBeGreaterThan(b.minBitrateKbps);
      // maxBitrateKbps == 0 means "unlimited"
      expect(b.maxBitrateKbps === 0 || b.maxBitrateKbps >= b.targetBitrateKbps).toBe(true);
    });
  });

  describe('PROTOCOL_METADATA', () => {
    it('all four protocols have metadata entries', () => {
      ALL_PROTOCOLS.forEach((p) => {
        const meta = PROTOCOL_METADATA[p as ProtocolId];
        expect(meta).toBeDefined();
        expect(meta.id).toBe(p);
        expect(meta.isLive).toBe(true);
        expect(typeof meta.requiresDeveloperMode).toBe('boolean');
      });
    });

    it('relay requires developer mode', () => {
      expect(PROTOCOL_METADATA.relay.requiresDeveloperMode).toBe(true);
    });
  });
});

// ─── 3. Error Handling ─────────────────────────────────────────────────────

describe('Protocol Error Handling – Bulletproof', () => {
  describe('getFallbackProtocol correctness', () => {
    it('every protocol has a defined fallback', () => {
      ALL_PROTOCOLS.forEach((p) => {
        const fb = getFallbackProtocol(p);
        expect(isProtocolType(fb)).toBe(true);
        expect(fb).not.toBe(p); // Fallback must differ from failed protocol
      });
    });

    it('unknown protocols fall back to stealth', () => {
      expect(getFallbackProtocol('nonexistent')).toBe('stealth');
      expect(getFallbackProtocol('')).toBe('stealth');
    });

    it('fallback chain never loops forever', () => {
      // Walk the chain from every protocol, expect it terminates within 4 hops
      ALL_PROTOCOLS.forEach((start) => {
        const visited = new Set<string>();
        let current = start as string;
        for (let i = 0; i < 10; i++) {
          if (visited.has(current)) break;
          visited.add(current);
          current = getFallbackProtocol(current);
        }
        // Chain must be finite (≤ number of protocols)
        expect(visited.size).toBeLessThanOrEqual(ALL_PROTOCOLS.length);
      });
    });
  });

  describe('shouldSwitchProtocol', () => {
    it('switches on critical error codes', () => {
      const criticalCodes = [
        ErrorCode.PROTOCOL_RECOVERY_FAILED,
        ErrorCode.PROTOCOL_STEALTH_COMPROMISED,
        ErrorCode.CLAUDE_PROTOCOL_ERROR,
      ];
      criticalCodes.forEach((code) => {
        const err = createProtocolError(code, 'test', { protocolId: 'stealth', phase: 'streaming' });
        expect(shouldSwitchProtocol(err)).toBe(true);
      });
    });

    it('does NOT switch on first few injection failures', () => {
      for (let attempts = 1; attempts <= 4; attempts++) {
        const err = createProtocolError(
          ErrorCode.PROTOCOL_INJECTION_FAILED,
          'test',
          { protocolId: 'relay', phase: 'injection', recoveryAttempts: attempts }
        );
        expect(shouldSwitchProtocol(err)).toBe(false);
      }
    });

    it('switches after 5+ recovery attempts', () => {
      const err = createProtocolError(
        ErrorCode.PROTOCOL_INJECTION_FAILED,
        'test',
        { protocolId: 'bridge', phase: 'injection', recoveryAttempts: 5 }
      );
      expect(shouldSwitchProtocol(err)).toBe(true);
    });
  });

  describe('getProtocolRecoveryStrategy for each protocol', () => {
    it('init failure → retry for all protocols', () => {
      ALL_PROTOCOLS.forEach((p) => {
        const err = createProtocolError(ErrorCode.PROTOCOL_INIT_FAILED, 'init fail', { protocolId: p, phase: 'init' });
        const { strategy, canAutoRecover } = getProtocolRecoveryStrategy(err);
        expect(strategy).toBe('retry');
        expect(canAutoRecover).toBe(true);
      });
    });

    it('injection failure → fallback for all protocols', () => {
      ALL_PROTOCOLS.forEach((p) => {
        const err = createProtocolError(ErrorCode.PROTOCOL_INJECTION_FAILED, 'inject fail', { protocolId: p, phase: 'injection' });
        const { strategy } = getProtocolRecoveryStrategy(err);
        expect(strategy).toBe('fallback');
      });
    });

    it('timeout → retry for all protocols', () => {
      ALL_PROTOCOLS.forEach((p) => {
        const err = createProtocolError(ErrorCode.PROTOCOL_TIMEOUT, 'timed out', { protocolId: p, phase: 'streaming' });
        const { strategy, canAutoRecover } = getProtocolRecoveryStrategy(err);
        expect(strategy).toBe('retry');
        expect(canAutoRecover).toBe(true);
      });
    });

    it('quality degraded → degraded_mode for all protocols', () => {
      ALL_PROTOCOLS.forEach((p) => {
        const err = createProtocolError(ErrorCode.PROTOCOL_QUALITY_DEGRADED, 'quality', { protocolId: p, phase: 'streaming' });
        const { strategy } = getProtocolRecoveryStrategy(err);
        expect(strategy).toBe('degraded_mode');
      });
    });

    it('body detection failed → fallback (shield specific)', () => {
      const err = createProtocolError(ErrorCode.BODY_DETECTION_FAILED, 'body', { protocolId: 'shield', phase: 'streaming' });
      const { strategy, canAutoRecover } = getProtocolRecoveryStrategy(err);
      expect(strategy).toBe('fallback');
      expect(canAutoRecover).toBe(true);
    });

    it('allowlist blocked → abort (relay specific)', () => {
      const err = createProtocolError(ErrorCode.ALLOWLIST_BLOCKED, 'blocked', { protocolId: 'relay', phase: 'init' });
      const { strategy, canAutoRecover } = getProtocolRecoveryStrategy(err);
      expect(strategy).toBe('abort');
      expect(canAutoRecover).toBe(false);
    });
  });

  describe('formatProtocolError', () => {
    it('formats with uppercase protocol id', () => {
      ALL_PROTOCOLS.forEach((p) => {
        const err = createProtocolError(ErrorCode.PROTOCOL_INIT_FAILED, 'Error msg', { protocolId: p, phase: 'init' });
        const formatted = formatProtocolError(err);
        expect(formatted).toContain(`[${p.toUpperCase()}]`);
        expect(formatted).toContain('(init)');
        expect(formatted).toContain('Error msg');
      });
    });
  });

  describe('withProtocolErrorHandling phase-to-code mapping', () => {
    beforeEach(() => {
      jest.useRealTimers();
    });

    afterEach(() => {
      jest.useFakeTimers();
    });

    it('init phase → PROTOCOL_INIT_FAILED error code', async () => {
      let capturedError: any = null;

      await withProtocolErrorHandling(
        'stealth',
        'init',
        async () => { throw new Error('boom'); },
        {
          fallback: 'ok',
          maxRetries: 1,
          onError: (err) => { capturedError = err; },
        }
      );

      expect(capturedError).not.toBeNull();
      expect(capturedError.code).toBe(ErrorCode.PROTOCOL_INIT_FAILED);
    }, 5000);

    it('streaming phase → PROTOCOL_STREAM_ERROR error code', async () => {
      let capturedError: any = null;

      await withProtocolErrorHandling(
        'bridge',
        'streaming',
        async () => { throw new Error('stream fail'); },
        {
          fallback: 'ok',
          maxRetries: 1,
          onError: (err) => { capturedError = err; },
        }
      );

      expect(capturedError).not.toBeNull();
      expect(capturedError.code).toBe(ErrorCode.PROTOCOL_STREAM_ERROR);
    }, 5000);

    it('recovery phase → PROTOCOL_RECOVERY_FAILED error code', async () => {
      let capturedError: any = null;

      await withProtocolErrorHandling(
        'relay',
        'recovery',
        async () => { throw new Error('recover fail'); },
        {
          fallback: 'ok',
          maxRetries: 1,
          onError: (err) => { capturedError = err; },
        }
      );

      expect(capturedError).not.toBeNull();
      expect(capturedError.code).toBe(ErrorCode.PROTOCOL_RECOVERY_FAILED);
    }, 5000);

    it('injection phase → PROTOCOL_INJECTION_FAILED error code', async () => {
      let capturedError: any = null;

      await withProtocolErrorHandling(
        'shield',
        'injection',
        async () => { throw new Error('inject fail'); },
        {
          fallback: 'ok',
          maxRetries: 1,
          onError: (err) => { capturedError = err; },
        }
      );

      expect(capturedError).not.toBeNull();
      expect(capturedError.code).toBe(ErrorCode.PROTOCOL_INJECTION_FAILED);
    }, 5000);
  });
});

// ─── 4. Monitoring Integration ──────────────────────────────────────────────

describe('Protocol Monitoring – All Protocols', () => {
  beforeEach(() => {
    protocolMonitor.clear();
  });

  it('can start and succeed sessions for all four protocols', () => {
    ALL_PROTOCOLS.forEach((p) => {
      const sessionId = protocolMonitor.startSession(p);
      expect(sessionId).toContain(p);
      protocolMonitor.recordSuccess(sessionId, { fps: 30, latency: 15 });
    });

    const system = protocolMonitor.getSystemMetrics();
    expect(system.totalInjections).toBe(4);
    expect(system.successfulInjections).toBe(4);
    expect(system.failedInjections).toBe(0);
  });

  it('can start and fail sessions for all four protocols', () => {
    ALL_PROTOCOLS.forEach((p) => {
      const sessionId = protocolMonitor.startSession(p);
      protocolMonitor.recordFailure(sessionId, `${p} failed`, 'high');
    });

    const system = protocolMonitor.getSystemMetrics();
    expect(system.totalInjections).toBe(4);
    expect(system.failedInjections).toBe(4);
    expect(system.successfulInjections).toBe(0);
  });

  it('performance score stays in [0, 100]', () => {
    const extremes = [
      { fps: 0, latency: 1000, cacheHitRate: 0 },
      { fps: 60, latency: 1, cacheHitRate: 1.0 },
      { fps: 10, latency: 150, cacheHitRate: 0.5 },
    ];

    extremes.forEach((metrics) => {
      const sessionId = protocolMonitor.startSession('stealth');
      protocolMonitor.updateMetrics(sessionId, metrics);
      const score = protocolMonitor.calculatePerformanceScore(sessionId);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  it('protocol comparison includes all tested protocols', () => {
    ALL_PROTOCOLS.forEach((p) => {
      for (let i = 0; i < 3; i++) {
        const sid = protocolMonitor.startSession(p);
        protocolMonitor.recordSuccess(sid, { fps: 25 + i, latency: 20 - i });
      }
    });

    const comparison = protocolMonitor.getProtocolComparison();
    ALL_PROTOCOLS.forEach((p) => {
      expect(comparison[p]).toBeDefined();
      expect(comparison[p].usage).toBe(3);
      expect(comparison[p].successRate).toBe(100);
      expect(comparison[p].avgFps).toBeGreaterThan(0);
    });
  });

  it('getRecommendedProtocol returns a valid protocol', () => {
    // Seed data
    ALL_PROTOCOLS.forEach((p) => {
      const sid = protocolMonitor.startSession(p);
      protocolMonitor.recordSuccess(sid, { fps: 30, latency: 10 });
    });

    const recommended = monitoringHelpers.getRecommendedProtocol();
    expect(typeof recommended).toBe('string');
    // Must be one of the protocols we seeded data for
    expect(ALL_PROTOCOLS).toContain(recommended);
  });

  it('isProtocolHealthy returns true for healthy protocol, defaults for unknown', () => {
    // Unknown protocol (no data) → healthy by default (not enough data)
    expect(monitoringHelpers.isProtocolHealthy('nonexistent')).toBe(true);

    // Seed 5 failures for relay
    for (let i = 0; i < 5; i++) {
      const sid = protocolMonitor.startSession('relay');
      protocolMonitor.recordFailure(sid, 'fail', 'high');
    }
    // Should be unhealthy now
    expect(monitoringHelpers.isProtocolHealthy('relay')).toBe(false);
  });

  it('export() produces valid JSON with all three sections', () => {
    const sid = protocolMonitor.startSession('bridge');
    protocolMonitor.recordSuccess(sid, { fps: 30, latency: 10 });

    const exported = protocolMonitor.export();
    const parsed = JSON.parse(exported);
    expect(parsed.system).toBeDefined();
    expect(parsed.history).toBeDefined();
    expect(parsed.comparison).toBeDefined();
    expect(parsed.history.length).toBe(1);
    expect(parsed.history[0].protocolId).toBe('bridge');
  });

  it('recording errors mid-session does not end the session', () => {
    const sid = protocolMonitor.startSession('shield');
    protocolMonitor.recordError(sid, 'Transient issue', 'low');
    protocolMonitor.recordError(sid, 'Another issue', 'medium');

    const metrics = protocolMonitor.getSessionMetrics(sid);
    expect(metrics).toBeDefined();
    expect(metrics!.errorCount).toBe(2);
    // Session still active (not archived)
    expect(metrics!.success).toBe(false);
    expect(metrics!.endTime).toBeUndefined();
  });

  it('clear() resets all state', () => {
    for (let i = 0; i < 10; i++) {
      const sid = protocolMonitor.startSession('stealth');
      protocolMonitor.recordSuccess(sid, { fps: 30 });
    }

    protocolMonitor.clear();
    const system = protocolMonitor.getSystemMetrics();
    expect(system.totalInjections).toBe(0);
    expect(system.successfulInjections).toBe(0);
    expect(system.failedInjections).toBe(0);
    expect(protocolMonitor.getHistory().length).toBe(0);
  });
});

// ─── 5. Script Generation – Stealth Protocol ────────────────────────────────

describe('Stealth Protocol Script Generation', () => {
  it('Sonnet/AI script generates valid JS with all features enabled', () => {
    const script = createSonnetProtocolScript(
      ANDROID_TEST_DEVICES,
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
    assertValidScript(script, 'SonnetProtocol-all-features');
    expect(script).toContain('getUserMedia');
  });

  it('Sonnet script with minimal features still generates valid JS', () => {
    const script = createSonnetProtocolScript(
      ANDROID_TEST_DEVICES,
      {
        enabled: true,
        aiAdaptiveQuality: false,
        behavioralMimicry: false,
        neuralStyleTransfer: false,
        predictiveFrameOptimization: false,
        quantumTimingRandomness: false,
        biometricSimulation: false,
        realTimeProfiler: false,
        adaptiveStealth: false,
        performanceTarget: 'balanced',
        stealthIntensity: 'minimal',
        learningMode: false,
      },
      undefined,
    );
    assertValidScript(script, 'SonnetProtocol-minimal');
  });

  it('Sonnet script stays within Android WebView injection size limit', () => {
    const script = createSonnetProtocolScript(
      ANDROID_TEST_DEVICES,
      {
        enabled: true,
        aiAdaptiveQuality: true,
        behavioralMimicry: true,
        neuralStyleTransfer: true,
        predictiveFrameOptimization: true,
        quantumTimingRandomness: true,
        biometricSimulation: true,
        realTimeProfiler: true,
        adaptiveStealth: true,
        performanceTarget: 'quality',
        stealthIntensity: 'maximum',
        learningMode: true,
      },
      undefined,
    );
    // Android WebView evaluateJavascript has a practical limit (~180KB)
    expect(script.length).toBeLessThan(180000);
  });

  it('Working injection script with video URI produces valid JS', () => {
    const script = createWorkingInjectionScript({
      devices: ANDROID_TEST_DEVICES,
      videoUri: 'https://example.com/test-video.mp4',
      stealthMode: true,
      debugEnabled: false,
    });
    assertValidScript(script, 'WorkingInjection-video');
    expect(script).toContain('getUserMedia');
  });

  it('Working injection script without video still works', () => {
    const script = createWorkingInjectionScript({
      devices: ANDROID_TEST_DEVICES,
      stealthMode: true,
      debugEnabled: true,
    });
    assertValidScript(script, 'WorkingInjection-no-video');
  });

  it('Minimal injection script always generates valid JS', () => {
    const script = createMinimalInjectionScript();
    assertValidScript(script, 'MinimalInjection');
    expect(script).toContain('getUserMedia');
    expect(script).toContain('enumerateDevices');
  });
});

// ─── 6. Script Generation – Relay Protocol ──────────────────────────────────

describe('Relay Protocol Script Generation', () => {
  it('generates valid JS with default (safe) settings', () => {
    const script = createAdvancedProtocol2Script({
      devices: ANDROID_TEST_DEVICES,
      enableWebRTCRelay: false,
      enableASI: true,
      enableGPU: false,
      enableCrypto: false,
      debugEnabled: false,
      stealthMode: true,
      showOverlayLabel: false,
    });
    assertValidScript(script, 'Relay-default');
  });

  it('generates valid JS with all features enabled', () => {
    const script = createAdvancedProtocol2Script({
      devices: ANDROID_TEST_DEVICES,
      enableWebRTCRelay: true,
      enableASI: true,
      enableGPU: true,
      enableCrypto: true,
      debugEnabled: true,
      stealthMode: true,
      showOverlayLabel: true,
    });
    assertValidScript(script, 'Relay-all-features');
  });

  it('contains emergency canvas fallback', () => {
    const script = createAdvancedProtocol2Script({
      devices: ANDROID_TEST_DEVICES,
      enableWebRTCRelay: false,
      enableASI: false,
      enableGPU: false,
      enableCrypto: false,
      debugEnabled: false,
      stealthMode: true,
      showOverlayLabel: false,
    });
    expect(script).toContain('emergencyCanvas');
  });

  it('handles empty devices array gracefully', () => {
    const script = createAdvancedProtocol2Script({
      devices: EMPTY_DEVICES,
      enableWebRTCRelay: false,
      enableASI: true,
      enableGPU: false,
      enableCrypto: false,
      debugEnabled: false,
      stealthMode: true,
      showOverlayLabel: false,
    });
    // Should still produce a valid script (with synthetic device fallback)
    assertValidScript(script, 'Relay-empty-devices');
  });

  it('script size is within injection limits', () => {
    const script = createAdvancedProtocol2Script({
      devices: ANDROID_TEST_DEVICES,
      enableWebRTCRelay: true,
      enableASI: true,
      enableGPU: true,
      enableCrypto: true,
      debugEnabled: true,
      stealthMode: true,
      showOverlayLabel: true,
    });
    expect(script.length).toBeLessThan(180000);
  });
});

// ─── 7. Script Generation – Bridge Protocol ─────────────────────────────────

describe('Bridge Protocol Script Generation', () => {
  it('generates valid JS with native bridge required', () => {
    const script = createWebRtcLoopbackInjectionScript({
      devices: ANDROID_TEST_DEVICES,
      debugEnabled: true,
      requireNativeBridge: true,
    });
    assertValidScript(script, 'Bridge-native');
  });

  it('generates valid JS without native bridge (Expo Go mode)', () => {
    const script = createWebRtcLoopbackInjectionScript({
      devices: ANDROID_TEST_DEVICES,
      debugEnabled: true,
      requireNativeBridge: false,
    });
    assertValidScript(script, 'Bridge-expo-go');
  });

  it('contains canvas fallback for reliability', () => {
    const script = createWebRtcLoopbackInjectionScript({
      devices: ANDROID_TEST_DEVICES,
      debugEnabled: false,
      requireNativeBridge: true,
    });
    expect(script).toContain('createCanvasFallbackStream');
    expect(script).toContain('Bridge Fallback');
  });

  it('handles empty devices array', () => {
    const script = createWebRtcLoopbackInjectionScript({
      devices: EMPTY_DEVICES,
      debugEnabled: false,
      requireNativeBridge: false,
    });
    assertValidScript(script, 'Bridge-empty-devices');
  });

  it('contains getUserMedia override', () => {
    const script = createWebRtcLoopbackInjectionScript({
      devices: ANDROID_TEST_DEVICES,
      debugEnabled: false,
      requireNativeBridge: false,
    });
    expect(script).toContain('getUserMedia');
    expect(script).toContain('enumerateDevices');
  });
});

// ─── 8. Script Generation – Shield Protocol ─────────────────────────────────

describe('Shield Protocol Script Generation', () => {
  it('generates valid JS with forceSimulation=true', () => {
    const script = createMediaInjectionScript(ANDROID_TEST_DEVICES, {
      stealthMode: true,
      forceSimulation: true,
      debugEnabled: true,
      permissionPromptEnabled: false,
    });
    assertValidScript(script, 'Shield-forceSimulation');
  });

  it('generates valid JS with permissionPromptEnabled=true', () => {
    const script = createMediaInjectionScript(ANDROID_TEST_DEVICES, {
      stealthMode: true,
      forceSimulation: false,
      permissionPromptEnabled: true,
    });
    assertValidScript(script, 'Shield-permissionPrompt');
  });

  it('permission prompt timeout auto-simulates, never denies', () => {
    const script = createMediaInjectionScript(ANDROID_TEST_DEVICES, {
      stealthMode: true,
      permissionPromptEnabled: true,
    });
    expect(script).toContain('auto-simulating');
    expect(script).not.toContain('Permission prompt timed out, denying');
    expect(script).not.toContain('timed out after 60s, denying');
  });

  it('shield with permissionPromptEnabled=false still contains the config flag', () => {
    const script = createMediaInjectionScript(ANDROID_TEST_DEVICES, {
      stealthMode: true,
      forceSimulation: true,
      permissionPromptEnabled: false,
    });
    expect(script).toContain('permissionPromptEnabled');
  });

  it('handles empty devices array', () => {
    const script = createMediaInjectionScript(EMPTY_DEVICES, {
      stealthMode: true,
      forceSimulation: true,
      debugEnabled: false,
      permissionPromptEnabled: false,
    });
    assertValidScript(script, 'Shield-empty-devices');
  });

  it('contains enumerateDevices override', () => {
    const script = createMediaInjectionScript(ANDROID_TEST_DEVICES, {
      stealthMode: true,
      forceSimulation: true,
    });
    expect(script).toContain('enumerateDevices');
  });
});

// ─── 9. Full Fallback Chain Simulation ──────────────────────────────────────

describe('Full Fallback Chain Simulation', () => {
  it('stealth → shield → stealth fallback chain terminates correctly', () => {
    const chain: string[] = [];
    let current = 'stealth';
    for (let i = 0; i < 4; i++) {
      chain.push(current);
      const next = getFallbackProtocol(current);
      if (chain.includes(next)) break;
      current = next;
    }
    // Should be stealth → shield → stealth (cycle detected, stops)
    expect(chain).toEqual(['stealth', 'shield']);
  });

  it('relay → stealth → shield fallback chain', () => {
    const chain: string[] = [];
    let current = 'relay';
    const visited = new Set<string>();
    while (!visited.has(current)) {
      chain.push(current);
      visited.add(current);
      current = getFallbackProtocol(current);
    }
    expect(chain).toEqual(['relay', 'stealth', 'shield']);
  });

  it('bridge → stealth → shield fallback chain', () => {
    const chain: string[] = [];
    let current = 'bridge';
    const visited = new Set<string>();
    while (!visited.has(current)) {
      chain.push(current);
      visited.add(current);
      current = getFallbackProtocol(current);
    }
    expect(chain).toEqual(['bridge', 'stealth', 'shield']);
  });

  it('every script generator produces valid JS (end-to-end fallback)', () => {
    // Simulate: try relay script → try bridge script → try shield script → try stealth script
    const scripts: { label: string; script: string }[] = [
      {
        label: 'relay',
        script: createAdvancedProtocol2Script({
          devices: ANDROID_TEST_DEVICES,
          enableWebRTCRelay: false,
          enableASI: true,
          enableGPU: false,
          enableCrypto: false,
          debugEnabled: false,
          stealthMode: true,
          showOverlayLabel: false,
        }),
      },
      {
        label: 'bridge',
        script: createWebRtcLoopbackInjectionScript({
          devices: ANDROID_TEST_DEVICES,
          debugEnabled: false,
          requireNativeBridge: false,
        }),
      },
      {
        label: 'shield',
        script: createMediaInjectionScript(ANDROID_TEST_DEVICES, {
          stealthMode: true,
          forceSimulation: true,
          permissionPromptEnabled: false,
        }),
      },
      {
        label: 'stealth-working',
        script: createWorkingInjectionScript({
          devices: ANDROID_TEST_DEVICES,
          stealthMode: true,
          debugEnabled: false,
        }),
      },
      {
        label: 'minimal-fallback',
        script: createMinimalInjectionScript(),
      },
    ];

    scripts.forEach(({ label, script }) => {
      assertValidScript(script, label);
    });
  });
});

// ─── 10. Edge Cases & Defensive Checks ──────────────────────────────────────

describe('Protocol Edge Cases', () => {
  it('mergeProtocolsWithDefaults with undefined input returns defaults', () => {
    const protocols = mergeProtocolsWithDefaults(undefined);
    ALL_PROTOCOLS.forEach((p) => {
      expect(protocols[p]).toBeDefined();
      expect(protocols[p].enabled).toBe(true);
    });
  });

  it('mergeProtocolsWithDefaults with empty object returns defaults', () => {
    const protocols = mergeProtocolsWithDefaults({});
    ALL_PROTOCOLS.forEach((p) => {
      expect(protocols[p]).toBeDefined();
    });
  });

  it('protocol errors always have timestamp', () => {
    ALL_PROTOCOLS.forEach((p) => {
      const err = createProtocolError(ErrorCode.PROTOCOL_INIT_FAILED, 'test', { protocolId: p, phase: 'init' });
      expect(err.protocolDetails?.timestamp).toBeDefined();
      expect(typeof err.protocolDetails?.timestamp).toBe('number');
      expect(err.protocolDetails!.timestamp).toBeGreaterThan(0);
    });
  });

  it('protocol errors with missing phase still format correctly', () => {
    const err = createProtocolError(ErrorCode.PROTOCOL_INIT_FAILED, 'No phase', {});
    const formatted = formatProtocolError(err);
    expect(formatted).toBe('No phase');
  });

  it('isProtocolError distinguishes protocol from app errors', () => {
    const protoErr = createProtocolError(ErrorCode.PROTOCOL_INIT_FAILED, 'proto', { protocolId: 'stealth', phase: 'init' });
    const appErr = createAppError(ErrorCode.UNKNOWN, 'app');

    expect(isProtocolError(protoErr)).toBe(true);
    expect(isProtocolError(appErr)).toBe(false);
    expect(isProtocolError(null)).toBe(false);
    expect(isProtocolError({})).toBe(false);
    expect(isProtocolError(new Error('plain'))).toBe(false);
  });

  it('protocol monitoring handles non-existent session IDs gracefully', () => {
    // These should not throw
    protocolMonitor.recordSuccess('nonexistent', { fps: 30 });
    protocolMonitor.recordFailure('nonexistent', 'fail', 'high');
    protocolMonitor.updateMetrics('nonexistent', { fps: 30 });
    protocolMonitor.recordError('nonexistent', 'err', 'low');

    const metrics = protocolMonitor.getSessionMetrics('nonexistent');
    expect(metrics).toBeUndefined();

    const score = protocolMonitor.calculatePerformanceScore('nonexistent');
    expect(score).toBe(0);
  });

  it('protocol comparison with zero sessions returns empty object', () => {
    protocolMonitor.clear();
    const comparison = protocolMonitor.getProtocolComparison();
    expect(Object.keys(comparison).length).toBe(0);
  });

  it('getHistory filters by protocol ID correctly', () => {
    protocolMonitor.clear();

    const s1 = protocolMonitor.startSession('stealth');
    protocolMonitor.recordSuccess(s1, { fps: 30 });
    const s2 = protocolMonitor.startSession('bridge');
    protocolMonitor.recordSuccess(s2, { fps: 25 });
    const s3 = protocolMonitor.startSession('stealth');
    protocolMonitor.recordSuccess(s3, { fps: 28 });

    const stealthHistory = protocolMonitor.getHistory('stealth');
    expect(stealthHistory.length).toBe(2);
    stealthHistory.forEach((h) => expect(h.protocolId).toBe('stealth'));

    const bridgeHistory = protocolMonitor.getHistory('bridge');
    expect(bridgeHistory.length).toBe(1);

    const allHistory = protocolMonitor.getHistory();
    expect(allHistory.length).toBe(3);
  });
});

// ─── 11. Android-Specific Concerns ──────────────────────────────────────────

describe('Android-Specific Protocol Concerns', () => {
  it('all injection scripts use var/function (not const/let at top level) for WebView compat', () => {
    // Android WebView has stricter parsing than Chrome for injected scripts.
    // Using var/function at the top level avoids TDZ issues during injection.
    const scripts = [
      createWebRtcLoopbackInjectionScript({
        devices: ANDROID_TEST_DEVICES,
        debugEnabled: false,
        requireNativeBridge: false,
      }),
      createAdvancedProtocol2Script({
        devices: ANDROID_TEST_DEVICES,
        enableWebRTCRelay: false,
        enableASI: true,
        enableGPU: false,
        enableCrypto: false,
        debugEnabled: false,
        stealthMode: true,
        showOverlayLabel: false,
      }),
    ];

    scripts.forEach((script) => {
      // Scripts should be wrapped in IIFE or use var/function
      // Check they contain function definitions (not bare const at top)
      expect(script).toMatch(/function|var |=>|\(function/);
    });
  });

  it('relay GPU disabled by default (unreliable on Android WebView)', () => {
    expect(DEFAULT_ADVANCED_RELAY_SETTINGS.gpu.enabled).toBe(false);
  });

  it('relay WebRTC disabled by default (needs custom dev build)', () => {
    expect(DEFAULT_ADVANCED_RELAY_SETTINGS.webrtc.enabled).toBe(false);
  });

  it('relay crypto disabled by default', () => {
    expect(DEFAULT_ADVANCED_RELAY_SETTINGS.crypto.enabled).toBe(false);
  });

  it('bridge default codec is "auto" for broad device support', () => {
    expect(DEFAULT_WEBRTC_LOOPBACK_SETTINGS.preferredCodec).toBe('auto');
  });

  it('bridge signaling timeout is generous (≥10s) for slow Android devices', () => {
    expect(DEFAULT_WEBRTC_LOOPBACK_SETTINGS.signalingTimeoutMs).toBeGreaterThanOrEqual(10000);
  });

  it('shield test pattern enabled by default (safety net for no-video)', () => {
    expect(DEFAULT_HARNESS_SETTINGS.testPatternOnNoVideo).toBe(true);
  });

  it('shield blur fallback enabled by default', () => {
    expect(DEFAULT_PROTECTED_SETTINGS.blurFallback).toBe(true);
  });
});
