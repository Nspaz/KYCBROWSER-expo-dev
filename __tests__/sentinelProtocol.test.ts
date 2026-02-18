/**
 * Sentinel Protocol Test Suite
 *
 * Tests for the new Sentinel protocol: type guards, defaults, engine lifecycle,
 * zero-trust attestation, stream integrity, environment masking script generation,
 * fallback orchestration, metrics collection, and integration with the existing
 * protocol infrastructure.
 */

import {
  mergeProtocolsWithDefaults,
  isProtocolType,
} from '@/contexts/ProtocolContext';
import type { ProtocolType } from '@/contexts/ProtocolContext';

import {
  DEFAULT_PROTOCOL_SETTINGS,
  DEFAULT_SENTINEL_SETTINGS,
  PROTOCOL_METADATA,
} from '@/types/protocols';
import type {
  SentinelProtocolSettings,
} from '@/types/protocols';

import { getFallbackProtocol } from '@/utils/errorHandling';
import { protocolMonitor } from '@/utils/protocolMonitoring';

import {
  SentinelEngine,
  DEFAULT_SENTINEL_CONFIG,
} from '@/utils/sentinelProtocol';

// ─── Type Guard & Registry ──────────────────────────────────────────────────

describe('Sentinel: type guard & registry', () => {
  it('isProtocolType recognises "sentinel"', () => {
    expect(isProtocolType('sentinel')).toBe(true);
  });

  it('isProtocolType still recognises all original protocols', () => {
    const originals: ProtocolType[] = ['stealth', 'relay', 'bridge', 'shield'];
    originals.forEach((p) => expect(isProtocolType(p)).toBe(true));
  });

  it('isProtocolType rejects unknown values', () => {
    expect(isProtocolType('unknown')).toBe(false);
    expect(isProtocolType('quantum')).toBe(false);
    expect(isProtocolType('')).toBe(false);
  });

  it('PROTOCOL_METADATA includes sentinel entry', () => {
    expect(PROTOCOL_METADATA.sentinel).toBeDefined();
    expect(PROTOCOL_METADATA.sentinel.id).toBe('sentinel');
    expect(PROTOCOL_METADATA.sentinel.name).toBe('Sentinel Protocol');
    expect(PROTOCOL_METADATA.sentinel.enabled).toBe(true);
    expect(PROTOCOL_METADATA.sentinel.isLive).toBe(true);
    expect(PROTOCOL_METADATA.sentinel.requiresDeveloperMode).toBe(true);
  });

  it('mergeProtocolsWithDefaults includes sentinel', () => {
    const merged = mergeProtocolsWithDefaults();
    expect(merged.sentinel).toBeDefined();
    expect(merged.sentinel.id).toBe('sentinel');
    expect(merged.sentinel.enabled).toBe(true);
  });

  it('mergeProtocolsWithDefaults merges custom sentinel config', () => {
    const merged = mergeProtocolsWithDefaults({
      sentinel: {
        id: 'sentinel',
        name: 'custom-sentinel',
        description: 'custom',
        enabled: false,
        settings: {},
      },
    });
    expect(merged.sentinel.enabled).toBe(false);
    expect(merged.sentinel.name).toBe('custom-sentinel');
  });
});

// ─── Default Settings ───────────────────────────────────────────────────────

describe('Sentinel: default settings', () => {
  it('DEFAULT_SENTINEL_SETTINGS has correct shape', () => {
    expect(DEFAULT_SENTINEL_SETTINGS.enabled).toBe(true);
    expect(DEFAULT_SENTINEL_SETTINGS.zeroTrust).toBeDefined();
    expect(DEFAULT_SENTINEL_SETTINGS.fallbackChain).toBeDefined();
    expect(DEFAULT_SENTINEL_SETTINGS.streamIntegrity).toBeDefined();
    expect(DEFAULT_SENTINEL_SETTINGS.environmentMasking).toBeDefined();
    expect(DEFAULT_SENTINEL_SETTINGS.telemetry).toBeDefined();
  });

  it('zero-trust defaults are sensible', () => {
    const zt = DEFAULT_SENTINEL_SETTINGS.zeroTrust;
    expect(zt.enabled).toBe(true);
    expect(zt.trustScoreThreshold).toBeGreaterThanOrEqual(0);
    expect(zt.trustScoreThreshold).toBeLessThanOrEqual(100);
    expect(zt.attestationIntervalMs).toBeGreaterThan(0);
  });

  it('fallback chain defaults include valid protocols', () => {
    const fc = DEFAULT_SENTINEL_SETTINGS.fallbackChain;
    expect(fc.enabled).toBe(true);
    expect(fc.protocolPriority.length).toBeGreaterThan(0);
    fc.protocolPriority.forEach((p: string) => {
      expect(isProtocolType(p)).toBe(true);
    });
  });

  it('stream integrity defaults are enabled', () => {
    const si = DEFAULT_SENTINEL_SETTINGS.streamIntegrity;
    expect(si.enabled).toBe(true);
    expect(si.replayProtection).toBe(true);
    expect(si.sequenceEnforcement).toBe(true);
    expect(si.maxFrameSkip).toBeGreaterThan(0);
  });

  it('DEFAULT_PROTOCOL_SETTINGS includes sentinel', () => {
    expect(DEFAULT_PROTOCOL_SETTINGS.sentinel).toBeDefined();
    expect(DEFAULT_PROTOCOL_SETTINGS.sentinel.enabled).toBe(true);
  });
});

// ─── Fallback Map ───────────────────────────────────────────────────────────

describe('Sentinel: fallback map', () => {
  it('sentinel falls back to bridge', () => {
    expect(getFallbackProtocol('sentinel')).toBe('bridge');
  });

  it('existing fallbacks remain unchanged', () => {
    expect(getFallbackProtocol('stealth')).toBe('shield');
    expect(getFallbackProtocol('relay')).toBe('stealth');
    expect(getFallbackProtocol('shield')).toBe('stealth');
    expect(getFallbackProtocol('bridge')).toBe('stealth');
  });

  it('unknown protocol falls back to stealth', () => {
    expect(getFallbackProtocol('nonexistent')).toBe('stealth');
  });
});

// ─── Sentinel Engine: Lifecycle ─────────────────────────────────────────────

describe('SentinelEngine: lifecycle', () => {
  let engine: SentinelEngine;

  beforeEach(() => {
    engine = new SentinelEngine();
  });

  afterEach(() => {
    engine.destroy();
  });

  it('starts uninitialized', () => {
    const state = engine.getState();
    expect(state.isInitialized).toBe(false);
    expect(state.isActive).toBe(false);
    expect(state.currentTrustScore).toBe(0);
  });

  it('initializes successfully', async () => {
    await engine.initialize();
    const state = engine.getState();
    expect(state.isInitialized).toBe(true);
    expect(state.isActive).toBe(true);
    expect(state.currentTrustScore).toBeGreaterThan(0);
  });

  it('warns when initialized twice', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    await engine.initialize();
    await engine.initialize(); // Should warn
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Already initialized'));
    warnSpy.mockRestore();
  });

  it('stops cleanly', async () => {
    await engine.initialize();
    engine.stop();
    expect(engine.getState().isActive).toBe(false);
  });

  it('destroy resets state', async () => {
    await engine.initialize();
    engine.destroy();
    const state = engine.getState();
    expect(state.isInitialized).toBe(false);
    expect(state.isActive).toBe(false);
    expect(state.currentTrustScore).toBe(0);
  });
});

// ─── Sentinel Engine: Zero-Trust Attestation ────────────────────────────────

describe('SentinelEngine: attestation', () => {
  let engine: SentinelEngine;

  beforeEach(() => {
    engine = new SentinelEngine({
      zeroTrust: {
        ...DEFAULT_SENTINEL_CONFIG.zeroTrust,
        continuousAttestation: false, // Disable continuous for deterministic tests
      },
    });
  });

  afterEach(() => {
    engine.destroy();
  });

  it('performAttestation returns valid attestation object', async () => {
    const attestation = await engine.performAttestation();
    expect(attestation).toHaveProperty('timestamp');
    expect(attestation).toHaveProperty('trustScore');
    expect(attestation).toHaveProperty('checks');
    expect(attestation).toHaveProperty('passed');
    expect(Array.isArray(attestation.checks)).toBe(true);
    expect(attestation.checks.length).toBeGreaterThan(0);
  });

  it('attestation trust score is between 0 and 100', async () => {
    const attestation = await engine.performAttestation();
    expect(attestation.trustScore).toBeGreaterThanOrEqual(0);
    expect(attestation.trustScore).toBeLessThanOrEqual(100);
  });

  it('attestation updates metrics', async () => {
    await engine.performAttestation();
    const metrics = engine.getMetrics();
    expect(metrics.totalAttestations).toBe(1);
    expect(metrics.lastAttestationTime).toBeGreaterThan(0);
  });

  it('multiple attestations accumulate history', async () => {
    await engine.performAttestation();
    await engine.performAttestation();
    await engine.performAttestation();
    const state = engine.getState();
    expect(state.attestationHistory.length).toBe(3);
    expect(engine.getMetrics().totalAttestations).toBe(3);
  });

  it('emits attestationComplete event', async () => {
    const handler = jest.fn();
    engine.on('attestationComplete', handler);
    await engine.performAttestation();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ trustScore: expect.any(Number) })
    );
  });

  it('emits trustScoreChanged event', async () => {
    const handler = jest.fn();
    engine.on('trustScoreChanged', handler);
    await engine.performAttestation();
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ trustScore: expect.any(Number), passed: expect.any(Boolean) })
    );
  });
});

// ─── Sentinel Engine: Stream Integrity ──────────────────────────────────────

describe('SentinelEngine: stream integrity', () => {
  let engine: SentinelEngine;

  beforeEach(() => {
    engine = new SentinelEngine();
  });

  afterEach(() => {
    engine.destroy();
  });

  it('accepts valid sequential frames', () => {
    expect(engine.validateFrame('frame-1', 1, 'sig1')).toBe(true);
    expect(engine.validateFrame('frame-2', 2, 'sig2')).toBe(true);
    expect(engine.validateFrame('frame-3', 3, 'sig3')).toBe(true);
    expect(engine.getMetrics().framesValidated).toBe(3);
  });

  it('rejects duplicate frame IDs (replay protection)', () => {
    expect(engine.validateFrame('frame-1', 1, 'sig1')).toBe(true);
    expect(engine.validateFrame('frame-1', 2, 'sig1')).toBe(false); // Duplicate ID
    expect(engine.getMetrics().framesRejected).toBe(1);
  });

  it('rejects out-of-order frames', () => {
    expect(engine.validateFrame('frame-1', 1, 'sig1')).toBe(true);
    expect(engine.validateFrame('frame-2', 2, 'sig2')).toBe(true);
    expect(engine.validateFrame('frame-old', 1, 'sig3')).toBe(false); // Out of order
  });

  it('rejects frames that skip too many', () => {
    expect(engine.validateFrame('frame-1', 1, 'sig1')).toBe(true);
    // maxFrameSkip defaults to 5, so a jump of 100 should be rejected
    expect(engine.validateFrame('frame-100', 100, 'sig2')).toBe(false);
  });

  it('rejects frames with empty signature when verification is on', () => {
    expect(engine.validateFrame('frame-1', 1, '')).toBe(false);
  });

  it('accepts frames when stream integrity is disabled', () => {
    const noIntegrityEngine = new SentinelEngine({
      streamIntegrity: {
        ...DEFAULT_SENTINEL_CONFIG.streamIntegrity,
        enabled: false,
      },
    });
    expect(noIntegrityEngine.validateFrame('frame-1', 1)).toBe(true);
    expect(noIntegrityEngine.validateFrame('frame-1', 1)).toBe(true); // Would normally be rejected
    noIntegrityEngine.destroy();
  });
});

// ─── Sentinel Engine: Environment Masking ───────────────────────────────────

describe('SentinelEngine: environment masking', () => {
  let engine: SentinelEngine;

  beforeEach(() => {
    engine = new SentinelEngine();
  });

  afterEach(() => {
    engine.destroy();
  });

  it('generates masking script as string', () => {
    const script = engine.generateMaskingScript();
    expect(typeof script).toBe('string');
    expect(script.length).toBeGreaterThan(0);
  });

  it('script includes WebGL spoofing when enabled', () => {
    const script = engine.generateMaskingScript();
    expect(script).toContain('WebGLRenderingContext');
    expect(script).toContain('getParameter');
  });

  it('script includes canvas fingerprint spoofing when enabled', () => {
    const script = engine.generateMaskingScript();
    expect(script).toContain('toDataURL');
    expect(script).toContain('toBlob');
  });

  it('script includes AudioContext spoofing when enabled', () => {
    const script = engine.generateMaskingScript();
    expect(script).toContain('AudioContext');
  });

  it('script includes navigator spoofing when enabled', () => {
    const script = engine.generateMaskingScript();
    expect(script).toContain('hardwareConcurrency');
    expect(script).toContain('deviceMemory');
  });

  it('generates empty script when all masking is disabled', () => {
    const noMaskEngine = new SentinelEngine({
      environmentMasking: {
        enabled: false,
        spoofWebGLRenderer: false,
        spoofCanvasFingerprint: false,
        spoofAudioContext: false,
        spoofNavigatorProperties: false,
        rotateFingerprint: false,
        rotationIntervalMs: 300000,
      },
    });
    const script = noMaskEngine.generateMaskingScript();
    expect(script.trim()).toBe('');
    noMaskEngine.destroy();
  });
});

// ─── Sentinel Engine: Fallback Orchestration ────────────────────────────────

describe('SentinelEngine: fallback orchestration', () => {
  let engine: SentinelEngine;

  beforeEach(() => {
    engine = new SentinelEngine({
      zeroTrust: {
        ...DEFAULT_SENTINEL_CONFIG.zeroTrust,
        continuousAttestation: false,
      },
    });
  });

  afterEach(() => {
    engine.destroy();
  });

  it('triggerFallback returns first priority protocol in waterfall mode', async () => {
    const result = await engine.triggerFallback('test');
    expect(result).toBe('bridge'); // First in default priority
    expect(engine.getState().activeFallbackProtocol).toBe('bridge');
  });

  it('triggerFallback increments fallback metric', async () => {
    await engine.triggerFallback('test');
    expect(engine.getMetrics().fallbacksTriggered).toBe(1);
  });

  it('triggerFallback emits fallbackTriggered event', async () => {
    const handler = jest.fn();
    engine.on('fallbackTriggered', handler);
    await engine.triggerFallback('low_trust');
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ protocol: 'bridge', reason: 'low_trust' })
    );
  });

  it('returns null when fallback chain is disabled', async () => {
    const noFallbackEngine = new SentinelEngine({
      fallbackChain: {
        ...DEFAULT_SENTINEL_CONFIG.fallbackChain,
        enabled: false,
      },
    });
    const result = await noFallbackEngine.triggerFallback('test');
    expect(result).toBeNull();
    noFallbackEngine.destroy();
  });

  it('race strategy returns first candidate', async () => {
    const raceEngine = new SentinelEngine({
      fallbackChain: {
        ...DEFAULT_SENTINEL_CONFIG.fallbackChain,
        strategy: 'race',
      },
    });
    const result = await raceEngine.triggerFallback('test');
    expect(result).toBe('bridge');
    raceEngine.destroy();
  });
});

// ─── Sentinel Engine: Config Update ─────────────────────────────────────────

describe('SentinelEngine: configuration', () => {
  it('getConfig returns current config', () => {
    const engine = new SentinelEngine();
    const config = engine.getConfig();
    expect(config.zeroTrust.enabled).toBe(true);
    expect(config.fallbackChain.strategy).toBe('waterfall');
    engine.destroy();
  });

  it('updateConfig merges correctly', () => {
    const engine = new SentinelEngine();
    engine.updateConfig({
      zeroTrust: {
        ...DEFAULT_SENTINEL_CONFIG.zeroTrust,
        trustScoreThreshold: 90,
      },
    });
    expect(engine.getConfig().zeroTrust.trustScoreThreshold).toBe(90);
    // Other fields should remain unchanged
    expect(engine.getConfig().fallbackChain.strategy).toBe('waterfall');
    engine.destroy();
  });

  it('isHealthy reflects trust score vs threshold', async () => {
    const engine = new SentinelEngine({
      zeroTrust: {
        ...DEFAULT_SENTINEL_CONFIG.zeroTrust,
        continuousAttestation: false,
        trustScoreThreshold: 50,
      },
    });
    await engine.initialize();
    // In test environment all checks should pass → score = 100
    expect(engine.isHealthy()).toBe(true);
    engine.destroy();
  });
});

// ─── Sentinel Engine: Event System ──────────────────────────────────────────

describe('SentinelEngine: events', () => {
  it('on/off manages listeners correctly', async () => {
    const engine = new SentinelEngine({
      zeroTrust: {
        ...DEFAULT_SENTINEL_CONFIG.zeroTrust,
        continuousAttestation: false,
      },
    });
    const handler = jest.fn();
    engine.on('attestationComplete', handler);
    await engine.performAttestation();
    expect(handler).toHaveBeenCalledTimes(1);

    engine.off('attestationComplete', handler);
    await engine.performAttestation();
    expect(handler).toHaveBeenCalledTimes(1); // Should not have been called again
    engine.destroy();
  });

  it('error in callback does not crash engine', async () => {
    const engine = new SentinelEngine({
      zeroTrust: {
        ...DEFAULT_SENTINEL_CONFIG.zeroTrust,
        continuousAttestation: false,
      },
    });
    engine.on('attestationComplete', () => {
      throw new Error('bad callback');
    });
    // Should not throw
    await expect(engine.performAttestation()).resolves.toBeDefined();
    engine.destroy();
  });
});

// ─── Protocol Monitoring Integration ────────────────────────────────────────

describe('Sentinel: protocol monitoring integration', () => {
  beforeEach(() => {
    protocolMonitor.clear();
  });

  it('can start and record a sentinel monitoring session', () => {
    const sessionId = protocolMonitor.startSession('sentinel');
    expect(sessionId).toContain('sentinel');

    protocolMonitor.recordSuccess(sessionId, { fps: 30, latency: 15 });
    const system = protocolMonitor.getSystemMetrics();
    expect(system.successfulInjections).toBe(1);
    expect(system.protocolUsage['sentinel']).toBe(1);
  });

  it('sentinel appears in protocol comparison after sessions', () => {
    const s1 = protocolMonitor.startSession('sentinel');
    protocolMonitor.recordSuccess(s1, { fps: 30, latency: 10 });
    const s2 = protocolMonitor.startSession('sentinel');
    protocolMonitor.recordSuccess(s2, { fps: 28, latency: 12 });

    const comparison = protocolMonitor.getProtocolComparison();
    expect(comparison['sentinel']).toBeDefined();
    expect(comparison['sentinel'].usage).toBe(2);
    expect(comparison['sentinel'].successRate).toBe(100);
  });
});

// ─── Singleton Tests ────────────────────────────────────────────────────────

describe('Sentinel: singleton pattern', () => {
  beforeEach(() => {
    // Import directly to access destroySentinelEngine
    const { destroySentinelEngine } = require('@/utils/sentinelProtocol');
    destroySentinelEngine();
  });

  afterEach(() => {
    const { destroySentinelEngine } = require('@/utils/sentinelProtocol');
    destroySentinelEngine();
  });

  it('getSentinelEngine returns the same instance on multiple calls', () => {
    const { getSentinelEngine } = require('@/utils/sentinelProtocol');
    
    const instance1 = getSentinelEngine();
    const instance2 = getSentinelEngine();
    const instance3 = getSentinelEngine();

    expect(instance1).toBe(instance2);
    expect(instance2).toBe(instance3);
  });

  it('getSentinelEngine ignores config on subsequent calls', () => {
    const { getSentinelEngine } = require('@/utils/sentinelProtocol');
    
    const config1 = { maxFallbackAttempts: 5, trustScoreThreshold: 0.6 };
    const config2 = { maxFallbackAttempts: 10, trustScoreThreshold: 0.9 };

    const instance1 = getSentinelEngine(config1);
    const instance2 = getSentinelEngine(config2);

    // Should return the same instance
    expect(instance1).toBe(instance2);
    
    // Config from second call should be ignored
    const state = instance1.getState();
    expect(state).toBeDefined();
  });

  it('destroySentinelEngine cleans up the instance', () => {
    const { getSentinelEngine, destroySentinelEngine } = require('@/utils/sentinelProtocol');
    
    const instance1 = getSentinelEngine();
    expect(instance1).toBeDefined();

    destroySentinelEngine();

    // After destroy, a new call should create a new instance
    const instance2 = getSentinelEngine();
    expect(instance2).toBeDefined();
    expect(instance2).not.toBe(instance1);
  });

  it('destroySentinelEngine is safe to call when no instance exists', () => {
    const { destroySentinelEngine } = require('@/utils/sentinelProtocol');
    
    // Should not throw
    expect(() => destroySentinelEngine()).not.toThrow();
    expect(() => destroySentinelEngine()).not.toThrow();
  });
});
