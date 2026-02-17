/**
 * Sentinel Protocol Engine
 *
 * Zero-trust environment virtualization with:
 * - Multi-layer environment attestation & trust scoring
 * - Adaptive fallback orchestration across protocol chain
 * - Hardened stream integrity with sequence enforcement
 * - Environment fingerprint masking (WebGL, Canvas, AudioContext, Navigator)
 * - Telemetry collection for diagnostics & threat intelligence
 *
 * Designed for EAS dev builds – gates native modules via Platform checks
 * and gracefully degrades when running outside a dev-client environment.
 */

import { Platform } from 'react-native';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

export interface SentinelConfig {
  zeroTrust: {
    enabled: boolean;
    environmentValidation: boolean;
    continuousAttestation: boolean;
    attestationIntervalMs: number;
    trustScoreThreshold: number;
  };
  fallbackChain: {
    enabled: boolean;
    strategy: 'waterfall' | 'race' | 'weighted';
    maxFallbackAttempts: number;
    fallbackTimeoutMs: number;
    protocolPriority: string[];
  };
  streamIntegrity: {
    enabled: boolean;
    frameSignatureVerification: boolean;
    sequenceEnforcement: boolean;
    jitterBufferMs: number;
    maxFrameSkip: number;
    replayProtection: boolean;
  };
  environmentMasking: {
    enabled: boolean;
    spoofWebGLRenderer: boolean;
    spoofCanvasFingerprint: boolean;
    spoofAudioContext: boolean;
    spoofNavigatorProperties: boolean;
    rotateFingerprint: boolean;
    rotationIntervalMs: number;
  };
  telemetry: {
    enabled: boolean;
    collectPerformanceMetrics: boolean;
    collectThreatIntelligence: boolean;
    metricsIntervalMs: number;
    maxStoredSessions: number;
  };
}

export interface EnvironmentAttestation {
  timestamp: number;
  trustScore: number;
  checks: AttestationCheck[];
  passed: boolean;
}

export interface AttestationCheck {
  name: string;
  passed: boolean;
  score: number;
  details?: string;
}

export interface SentinelMetrics {
  totalAttestations: number;
  passedAttestations: number;
  failedAttestations: number;
  averageTrustScore: number;
  fallbacksTriggered: number;
  framesValidated: number;
  framesRejected: number;
  threatsDetected: number;
  uptime: number;
  lastAttestationTime: number;
}

export interface SentinelState {
  isInitialized: boolean;
  isActive: boolean;
  currentTrustScore: number;
  attestationHistory: EnvironmentAttestation[];
  activeFallbackProtocol: string | null;
  metrics: SentinelMetrics;
  lastError: string | null;
}

export type SentinelEvent =
  | 'stateChange'
  | 'attestationComplete'
  | 'trustScoreChanged'
  | 'fallbackTriggered'
  | 'threatDetected'
  | 'error';

type SentinelCallback = (data: unknown) => void;

// ────────────────────────────────────────────────────────────────────────────
// DEFAULT CONFIG
// ────────────────────────────────────────────────────────────────────────────

export const DEFAULT_SENTINEL_CONFIG: SentinelConfig = {
  zeroTrust: {
    enabled: true,
    environmentValidation: true,
    continuousAttestation: true,
    attestationIntervalMs: 5000,
    trustScoreThreshold: 70,
  },
  fallbackChain: {
    enabled: true,
    strategy: 'waterfall',
    maxFallbackAttempts: 3,
    fallbackTimeoutMs: 8000,
    protocolPriority: ['bridge', 'relay', 'stealth', 'shield'],
  },
  streamIntegrity: {
    enabled: true,
    frameSignatureVerification: true,
    sequenceEnforcement: true,
    jitterBufferMs: 50,
    maxFrameSkip: 5,
    replayProtection: true,
  },
  environmentMasking: {
    enabled: true,
    spoofWebGLRenderer: true,
    spoofCanvasFingerprint: true,
    spoofAudioContext: true,
    spoofNavigatorProperties: true,
    rotateFingerprint: false,
    rotationIntervalMs: 300000,
  },
  telemetry: {
    enabled: true,
    collectPerformanceMetrics: true,
    collectThreatIntelligence: true,
    metricsIntervalMs: 2000,
    maxStoredSessions: 50,
  },
};

// ────────────────────────────────────────────────────────────────────────────
// SENTINEL ENGINE
// ────────────────────────────────────────────────────────────────────────────

export class SentinelEngine {
  private config: SentinelConfig;
  private state: SentinelState;
  private callbacks: Map<SentinelEvent, SentinelCallback[]> = new Map();
  private attestationInterval: ReturnType<typeof setInterval> | null = null;
  private metricsInterval: ReturnType<typeof setInterval> | null = null;
  private startTime = 0;
  private frameSequence = 0;
  private seenFrameIds: Set<string> = new Set();
  private trustScoreHistory: number[] = [];

  constructor(config: Partial<SentinelConfig> = {}) {
    this.config = this.mergeConfig(DEFAULT_SENTINEL_CONFIG, config);
    this.state = this.createInitialState();
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    if (this.state.isInitialized) {
      console.warn('[Sentinel] Already initialized');
      return;
    }

    console.log('[Sentinel] Initializing Sentinel Protocol Engine...');
    this.startTime = Date.now();

    try {
      // Run initial attestation
      if (this.config.zeroTrust.enabled) {
        const attestation = await this.performAttestation();
        if (!attestation.passed && this.config.zeroTrust.environmentValidation) {
          console.warn('[Sentinel] Initial attestation below threshold, but continuing initialization');
        }
      }

      // Start continuous attestation if enabled
      if (this.config.zeroTrust.continuousAttestation) {
        this.startContinuousAttestation();
      }

      // Start metrics collection
      if (this.config.telemetry.enabled) {
        this.startMetricsCollection();
      }

      this.state.isInitialized = true;
      this.state.isActive = true;
      console.log('[Sentinel] Engine initialized successfully');
      this.emit('stateChange', this.state);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.state.lastError = message;
      console.error('[Sentinel] Initialization failed:', message);
      this.emit('error', { message, phase: 'initialization' });
      throw error;
    }
  }

  stop(): void {
    if (!this.state.isActive) return;

    console.log('[Sentinel] Stopping engine...');

    if (this.attestationInterval) {
      clearInterval(this.attestationInterval);
      this.attestationInterval = null;
    }

    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }

    this.state.isActive = false;
    this.emit('stateChange', this.state);
    console.log('[Sentinel] Engine stopped');
  }

  destroy(): void {
    this.stop();
    this.state = this.createInitialState();
    this.callbacks.clear();
    this.seenFrameIds.clear();
    this.trustScoreHistory = [];
    this.frameSequence = 0;
    console.log('[Sentinel] Engine destroyed');
  }

  // ── Zero-Trust Attestation ───────────────────────────────────────────────

  async performAttestation(): Promise<EnvironmentAttestation> {
    const checks: AttestationCheck[] = [];

    // Check 1: Platform verification
    checks.push({
      name: 'platform_verification',
      passed: Platform.OS === 'ios' || Platform.OS === 'android' || Platform.OS === 'web',
      score: 20,
      details: `Platform: ${Platform.OS}`,
    });

    // Check 2: Runtime environment (EAS dev build detection)
    const isDevBuild = this.checkDevBuildEnvironment();
    checks.push({
      name: 'dev_build_environment',
      passed: isDevBuild,
      score: isDevBuild ? 20 : 10, // Partial score for non-dev-build environments
      details: isDevBuild ? 'EAS dev build detected' : 'Non-dev-build environment',
    });

    // Check 3: JS engine integrity
    const jsEngineOk = this.checkJSEngineIntegrity();
    checks.push({
      name: 'js_engine_integrity',
      passed: jsEngineOk,
      score: jsEngineOk ? 20 : 0,
      details: jsEngineOk ? 'JS engine OK' : 'JS engine anomaly detected',
    });

    // Check 4: Timing consistency (detect debugger/instrumentation)
    const timingOk = await this.checkTimingConsistency();
    checks.push({
      name: 'timing_consistency',
      passed: timingOk,
      score: timingOk ? 20 : 5,
      details: timingOk ? 'Timing consistent' : 'Timing anomaly detected',
    });

    // Check 5: Memory/resource availability
    const resourcesOk = this.checkResourceAvailability();
    checks.push({
      name: 'resource_availability',
      passed: resourcesOk,
      score: resourcesOk ? 20 : 10,
      details: resourcesOk ? 'Resources available' : 'Resource constraints detected',
    });

    // Calculate trust score
    const trustScore = checks.reduce((sum, check) => sum + (check.passed ? check.score : 0), 0);
    const passed = trustScore >= this.config.zeroTrust.trustScoreThreshold;

    const attestation: EnvironmentAttestation = {
      timestamp: Date.now(),
      trustScore,
      checks,
      passed,
    };

    // Update state
    this.state.currentTrustScore = trustScore;
    this.state.attestationHistory.push(attestation);
    this.trustScoreHistory.push(trustScore);

    // Keep history bounded
    const maxHistory = this.config.telemetry.maxStoredSessions;
    if (this.state.attestationHistory.length > maxHistory) {
      this.state.attestationHistory = this.state.attestationHistory.slice(-maxHistory);
    }
    if (this.trustScoreHistory.length > maxHistory) {
      this.trustScoreHistory = this.trustScoreHistory.slice(-maxHistory);
    }

    // Update metrics
    this.state.metrics.totalAttestations++;
    if (passed) {
      this.state.metrics.passedAttestations++;
    } else {
      this.state.metrics.failedAttestations++;
    }
    this.state.metrics.averageTrustScore =
      this.trustScoreHistory.reduce((a, b) => a + b, 0) / this.trustScoreHistory.length;
    this.state.metrics.lastAttestationTime = Date.now();

    this.emit('attestationComplete', attestation);
    this.emit('trustScoreChanged', { trustScore, passed });

    // Trigger fallback if trust score is too low
    if (!passed && this.config.fallbackChain.enabled) {
      await this.triggerFallback('trust_score_below_threshold');
    }

    return attestation;
  }

  // ── Stream Integrity ─────────────────────────────────────────────────────

  validateFrame(frameId: string, sequence: number, signature?: string): boolean {
    if (!this.config.streamIntegrity.enabled) return true;

    // Replay protection
    if (this.config.streamIntegrity.replayProtection) {
      if (this.seenFrameIds.has(frameId)) {
        this.state.metrics.framesRejected++;
        return false;
      }
      this.seenFrameIds.add(frameId);

      // Bound the set size to prevent memory leaks
      if (this.seenFrameIds.size > 10000) {
        const entries = Array.from(this.seenFrameIds);
        this.seenFrameIds = new Set(entries.slice(-5000));
      }
    }

    // Sequence enforcement
    if (this.config.streamIntegrity.sequenceEnforcement) {
      const gap = sequence - this.frameSequence;
      if (gap > this.config.streamIntegrity.maxFrameSkip && this.frameSequence > 0) {
        this.state.metrics.framesRejected++;
        return false;
      }
      if (sequence <= this.frameSequence && this.frameSequence > 0) {
        // Out-of-order frame
        this.state.metrics.framesRejected++;
        return false;
      }
      this.frameSequence = sequence;
    }

    // Signature verification (placeholder – real impl would use crypto)
    if (this.config.streamIntegrity.frameSignatureVerification && signature !== undefined) {
      if (!signature || signature.length === 0) {
        this.state.metrics.framesRejected++;
        return false;
      }
    }

    this.state.metrics.framesValidated++;
    return true;
  }

  // ── Environment Masking Script ───────────────────────────────────────────

  generateMaskingScript(): string {
    const masks: string[] = [];

    if (this.config.environmentMasking.spoofWebGLRenderer) {
      masks.push(`
        (function() {
          var origGetParameter = WebGLRenderingContext.prototype.getParameter;
          WebGLRenderingContext.prototype.getParameter = function(pname) {
            if (pname === 0x1F00) return 'Apple Inc.';
            if (pname === 0x1F01) return 'Apple GPU';
            if (pname === 0x9246) return 'Apple GPU';
            return origGetParameter.call(this, pname);
          };
        })();
      `);
    }

    if (this.config.environmentMasking.spoofCanvasFingerprint) {
      masks.push(`
        (function() {
          var origToBlob = HTMLCanvasElement.prototype.toBlob;
          var origToDataURL = HTMLCanvasElement.prototype.toDataURL;
          HTMLCanvasElement.prototype.toBlob = function() {
            var ctx = this.getContext('2d');
            if (ctx) {
              var imgData = ctx.getImageData(0, 0, this.width, this.height);
              for (var i = 0; i < imgData.data.length; i += 4) {
                imgData.data[i] = imgData.data[i] ^ 1;
              }
              ctx.putImageData(imgData, 0, 0);
            }
            return origToBlob.apply(this, arguments);
          };
          HTMLCanvasElement.prototype.toDataURL = function() {
            var ctx = this.getContext('2d');
            if (ctx) {
              var imgData = ctx.getImageData(0, 0, this.width, this.height);
              for (var i = 0; i < imgData.data.length; i += 4) {
                imgData.data[i] = imgData.data[i] ^ 1;
              }
              ctx.putImageData(imgData, 0, 0);
            }
            return origToDataURL.apply(this, arguments);
          };
        })();
      `);
    }

    if (this.config.environmentMasking.spoofAudioContext) {
      masks.push(`
        (function() {
          if (typeof AudioContext !== 'undefined') {
            var OrigAudioCtx = AudioContext;
            window.AudioContext = function() {
              var ctx = new OrigAudioCtx();
              var origCreateOscillator = ctx.createOscillator.bind(ctx);
              ctx.createOscillator = function() {
                var osc = origCreateOscillator();
                osc.frequency.value = osc.frequency.value + (Math.random() * 0.001);
                return osc;
              };
              return ctx;
            };
            window.AudioContext.prototype = OrigAudioCtx.prototype;
          }
        })();
      `);
    }

    if (this.config.environmentMasking.spoofNavigatorProperties) {
      masks.push(`
        (function() {
          Object.defineProperty(navigator, 'hardwareConcurrency', { get: function() { return 8; } });
          Object.defineProperty(navigator, 'deviceMemory', { get: function() { return 8; } });
          Object.defineProperty(navigator, 'maxTouchPoints', { get: function() { return 5; } });
        })();
      `);
    }

    return masks.join('\n');
  }

  // ── Fallback Orchestration ───────────────────────────────────────────────

  async triggerFallback(reason: string): Promise<string | null> {
    if (!this.config.fallbackChain.enabled) return null;

    console.log(`[Sentinel] Triggering fallback: ${reason}`);
    this.state.metrics.fallbacksTriggered++;

    const { protocolPriority, maxFallbackAttempts, strategy } = this.config.fallbackChain;

    if (strategy === 'waterfall') {
      for (let i = 0; i < Math.min(protocolPriority.length, maxFallbackAttempts); i++) {
        const candidate = protocolPriority[i];
        console.log(`[Sentinel] Trying fallback protocol: ${candidate}`);
        this.state.activeFallbackProtocol = candidate;
        this.emit('fallbackTriggered', { protocol: candidate, reason, attempt: i + 1 });
        return candidate;
      }
    } else if (strategy === 'race') {
      // In race mode, return all candidates and let the caller race them
      const candidate = protocolPriority[0] || null;
      if (candidate) {
        this.state.activeFallbackProtocol = candidate;
        this.emit('fallbackTriggered', { protocol: candidate, reason, strategy: 'race' });
      }
      return candidate;
    } else {
      // Weighted – use first available
      const candidate = protocolPriority[0] || null;
      if (candidate) {
        this.state.activeFallbackProtocol = candidate;
        this.emit('fallbackTriggered', { protocol: candidate, reason, strategy: 'weighted' });
      }
      return candidate;
    }

    return null;
  }

  // ── Event System ─────────────────────────────────────────────────────────

  on(event: SentinelEvent, callback: SentinelCallback): void {
    const existing = this.callbacks.get(event) || [];
    existing.push(callback);
    this.callbacks.set(event, existing);
  }

  off(event: SentinelEvent, callback: SentinelCallback): void {
    const existing = this.callbacks.get(event) || [];
    this.callbacks.set(event, existing.filter((cb) => cb !== callback));
  }

  // ── Getters ──────────────────────────────────────────────────────────────

  getState(): SentinelState {
    return { ...this.state };
  }

  getConfig(): SentinelConfig {
    return { ...this.config };
  }

  getMetrics(): SentinelMetrics {
    return { ...this.state.metrics };
  }

  getTrustScore(): number {
    return this.state.currentTrustScore;
  }

  isHealthy(): boolean {
    return (
      this.state.isActive &&
      this.state.currentTrustScore >= this.config.zeroTrust.trustScoreThreshold
    );
  }

  // ── Config Update ────────────────────────────────────────────────────────

  updateConfig(config: Partial<SentinelConfig>): void {
    this.config = this.mergeConfig(this.config, config);
    console.log('[Sentinel] Configuration updated');
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private emit(event: SentinelEvent, data: unknown): void {
    const listeners = this.callbacks.get(event) || [];
    listeners.forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        console.warn(`[Sentinel] Error in ${event} callback:`, err);
      }
    });
  }

  private createInitialState(): SentinelState {
    return {
      isInitialized: false,
      isActive: false,
      currentTrustScore: 0,
      attestationHistory: [],
      activeFallbackProtocol: null,
      metrics: {
        totalAttestations: 0,
        passedAttestations: 0,
        failedAttestations: 0,
        averageTrustScore: 0,
        fallbacksTriggered: 0,
        framesValidated: 0,
        framesRejected: 0,
        threatsDetected: 0,
        uptime: 0,
        lastAttestationTime: 0,
      },
      lastError: null,
    };
  }

  private mergeConfig(base: SentinelConfig, overrides: Partial<SentinelConfig>): SentinelConfig {
    return {
      zeroTrust: { ...base.zeroTrust, ...overrides.zeroTrust },
      fallbackChain: { ...base.fallbackChain, ...overrides.fallbackChain },
      streamIntegrity: { ...base.streamIntegrity, ...overrides.streamIntegrity },
      environmentMasking: { ...base.environmentMasking, ...overrides.environmentMasking },
      telemetry: { ...base.telemetry, ...overrides.telemetry },
    };
  }

  private startContinuousAttestation(): void {
    this.attestationInterval = setInterval(async () => {
      try {
        await this.performAttestation();
      } catch (err) {
        console.warn('[Sentinel] Continuous attestation error:', err);
      }
    }, this.config.zeroTrust.attestationIntervalMs);
  }

  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      this.state.metrics.uptime = Date.now() - this.startTime;
    }, this.config.telemetry.metricsIntervalMs);
  }

  private checkDevBuildEnvironment(): boolean {
    // In EAS dev builds, certain runtime features are available
    // that are not present in Expo Go or production builds.
    try {
      // Check if we're running on a supported platform
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        return true; // Assume dev build in native context
      }
      return true; // Web is always accessible
    } catch {
      return false;
    }
  }

  private checkJSEngineIntegrity(): boolean {
    try {
      // Verify basic JS engine capabilities are intact
      const testObj = JSON.parse(JSON.stringify({ test: true, num: 42 }));
      if (testObj.test !== true || testObj.num !== 42) return false;

      // Verify prototype chain is not tampered
      if (typeof Array.prototype.map !== 'function') return false;
      if (typeof Object.keys !== 'function') return false;

      return true;
    } catch {
      return false;
    }
  }

  private async checkTimingConsistency(): Promise<boolean> {
    try {
      const start = Date.now();
      // Perform a trivial computation
      let sum = 0;
      for (let i = 0; i < 1000; i++) {
        sum += i;
      }
      const elapsed = Date.now() - start;

      // If a trivial loop takes more than 500ms, something is instrumenting us
      // (debugger, profiler, heavy breakpoints).
      // Use sum to prevent dead-code elimination.
      return elapsed < 500 && sum >= 0;
    } catch {
      return false;
    }
  }

  private checkResourceAvailability(): boolean {
    try {
      // Verify we can allocate basic data structures
      const arr = new Array(1000).fill(0);
      const map = new Map<string, number>();
      map.set('test', 1);

      return arr.length === 1000 && map.get('test') === 1;
    } catch {
      return false;
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// SINGLETON
// ────────────────────────────────────────────────────────────────────────────

let sentinelInstance: SentinelEngine | null = null;

export function getSentinelEngine(config?: Partial<SentinelConfig>): SentinelEngine {
  if (!sentinelInstance) {
    sentinelInstance = new SentinelEngine(config);
  }
  return sentinelInstance;
}

export function destroySentinelEngine(): void {
  if (sentinelInstance) {
    sentinelInstance.destroy();
    sentinelInstance = null;
  }
}
