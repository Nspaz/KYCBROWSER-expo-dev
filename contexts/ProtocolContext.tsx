import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import * as Crypto from 'expo-crypto';

// ─── Protocol Types (consolidated from 10 → 4) ─────────────────────────────
export type ProtocolType = 'stealth' | 'relay' | 'bridge' | 'shield' | 'sentinel';

/** @deprecated Use ProtocolType – old 10-protocol union kept for downstream compat */
export type LegacyProtocolType =
  | 'standard'
  | 'allowlist'
  | 'protected'
  | 'harness'
  | 'holographic'
  | 'websocket'
  | 'webrtc-loopback'
  | 'claude-sonnet'
  | 'claude'
  | 'sonnet';

export interface ProtocolConfig {
  id: ProtocolType;
  name: string;
  description: string;
  enabled: boolean;
  settings: Record<string, unknown>;
}

// ─── Migration helper: old protocol IDs → new ──────────────────────────────
const migrateProtocolType = (oldType: string): ProtocolType | null => {
  const migration: Record<string, ProtocolType> = {
    // stealth
    'standard': 'stealth',
    'holographic': 'stealth',
    'claude-sonnet': 'stealth',
    'claude': 'stealth',
    'sonnet': 'stealth',
    // relay
    'allowlist': 'relay',
    // bridge
    'websocket': 'bridge',
    'webrtc-loopback': 'bridge',
    // shield
    'protected': 'shield',
    'harness': 'shield',
  };
  return migration[oldType] ?? null;
};

// ─── New settings interfaces ────────────────────────────────────────────────

/** Stealth – merges Standard + Holographic + Sonnet/AI features */
export interface StealthProtocolSettings {
  // From Standard
  autoInject: boolean;
  stealthByDefault: boolean;
  respectSiteSettings: boolean;
  injectMotionData: boolean;
  loopVideo: boolean;
  // From Holographic
  sdpMasquerade: boolean;
  emulatedDevice: 'iphone-front' | 'webcam-c920' | 'obs-virtual';
  canvasResolution: '720p' | '1080p' | '4k';
  frameRate: 30 | 60;
  noiseInjectionLevel: number;
  // From Sonnet/AI
  aiAdaptiveQuality: boolean;
  behavioralMimicry: boolean;
  quantumTimingRandomness: boolean;
  predictiveFrameOptimization: boolean;
  stealthIntensity: 'minimal' | 'moderate' | 'maximum';
}

/** Relay – keeps AllowlistProtocolSettings shape (already comprehensive) */
export interface RelayProtocolSettings {
  enabled: boolean;
  domains: string[];
  blockUnlisted: boolean;
  showBlockedIndicator: boolean;
  autoAddCurrentSite: boolean;

  advancedRelay: {
    pipeline: {
      hotSwitchThresholdMs: number;
      minAcceptableFps: number;
      enableParallelDecoding: boolean;
    };
    webrtc: {
      enabled: boolean;
      virtualTurnEnabled: boolean;
      sdpManipulationEnabled: boolean;
      stealthMode: boolean;
    };
    gpu: {
      enabled: boolean;
      qualityPreset: 'ultra' | 'high' | 'medium' | 'low' | 'potato';
      noiseInjection: boolean;
      noiseIntensity: number;
    };
    asi: {
      enabled: boolean;
      siteFingerprinting: boolean;
      autoResolutionMatching: boolean;
      antiDetectionMeasures: boolean;
      storeHistory: boolean;
    };
    crossDevice: {
      enabled: boolean;
      discoveryMethod: 'manual' | 'mdns' | 'qr';
      targetLatencyMs: number;
      autoReconnect: boolean;
      connectedDeviceId: string | null;
    };
    crypto: {
      enabled: boolean;
      frameSigning: boolean;
      tamperDetection: boolean;
    };
  };
}

/** Bridge – merges WebRTC loopback + WebSocket/postMessage bridge */
export interface BridgeProtocolSettings {
  enabled: boolean;
  preferNativeBridge: boolean;
  autoStart: boolean;
  // Native WebRTC settings
  signalingTimeoutMs: number;
  requireNativeBridge: boolean;
  iceServers: Array<{ urls: string | string[]; username?: string; credential?: string }>;
  preferredCodec: 'auto' | 'h264' | 'vp8' | 'vp9' | 'av1';
  enableAdaptiveBitrate: boolean;
  enableAdaptiveResolution: boolean;
  minBitrateKbps: number;
  targetBitrateKbps: number;
  maxBitrateKbps: number;
  keepAliveIntervalMs: number;
  statsIntervalMs: number;
  enableDataChannel: boolean;
  enableIceRestart: boolean;
  enableSimulcast: boolean;
  recordingEnabled: boolean;
  ringBufferSeconds: number;
  ringSegmentSeconds: number;
  cacheRemoteVideos: boolean;
  cacheTTLHours: number;
  cacheMaxSizeMB: number;
  // PostMessage bridge settings (field names match WebSocketBridgeSettings)
  resolution: '720p' | '1080p' | '4k';
  frameRate: 24 | 30 | 60;
  quality: number;
  useSyntheticFallback: boolean;
}

/** Shield – merges Protected + Harness */
export interface ShieldProtocolSettings {
  // From Protected
  bodyDetectionEnabled: boolean;
  sensitivityLevel: 'low' | 'medium' | 'high';
  replacementVideoId: string | null;
  showProtectedBadge: boolean;
  autoTriggerOnFace: boolean;
  blurFallback: boolean;
  // From Harness
  overlayEnabled: boolean;
  showDebugInfo: boolean;
  captureFrameRate: number;
  enableAudioPassthrough: boolean;
  mirrorVideo: boolean;
  testPatternOnNoVideo: boolean;
}

/** Sentinel – zero-trust environment virtualization with multi-layer hardening */
export interface SentinelProtocolSettings {
  enabled: boolean;

  // Zero-trust verification layer
  zeroTrust: {
    enabled: boolean;
    environmentValidation: boolean;
    continuousAttestation: boolean;
    attestationIntervalMs: number;
    trustScoreThreshold: number;
  };

  // Adaptive fallback orchestration
  fallbackChain: {
    enabled: boolean;
    strategy: 'waterfall' | 'race' | 'weighted';
    maxFallbackAttempts: number;
    fallbackTimeoutMs: number;
    protocolPriority: ProtocolType[];
  };

  // Hardened stream integrity
  streamIntegrity: {
    enabled: boolean;
    frameSignatureVerification: boolean;
    sequenceEnforcement: boolean;
    jitterBufferMs: number;
    maxFrameSkip: number;
    replayProtection: boolean;
  };

  // Environment fingerprint masking
  environmentMasking: {
    enabled: boolean;
    spoofWebGLRenderer: boolean;
    spoofCanvasFingerprint: boolean;
    spoofAudioContext: boolean;
    spoofNavigatorProperties: boolean;
    rotateFingerprint: boolean;
    rotationIntervalMs: number;
  };

  // Telemetry & diagnostics
  telemetry: {
    enabled: boolean;
    collectPerformanceMetrics: boolean;
    collectThreatIntelligence: boolean;
    metricsIntervalMs: number;
    maxStoredSessions: number;
  };
}

// ─── Backward-compatible type aliases (deprecated) ──────────────────────────
/** @deprecated Use StealthProtocolSettings */
export type StandardProtocolSettings = StealthProtocolSettings;
/** @deprecated Use RelayProtocolSettings */
export type AllowlistProtocolSettings = RelayProtocolSettings;
/** @deprecated Use StealthProtocolSettings */
export type HolographicProtocolSettings = StealthProtocolSettings;
/** @deprecated Use ShieldProtocolSettings */
export type ProtectedProtocolSettings = ShieldProtocolSettings;
/** @deprecated Use ShieldProtocolSettings */
export type HarnessProtocolSettings = ShieldProtocolSettings;
/** @deprecated Use BridgeProtocolSettings */
export type WebRtcLoopbackProtocolSettings = BridgeProtocolSettings;

export interface ProtocolContextValue {
  // Developer Mode
  developerModeEnabled: boolean;
  toggleDeveloperMode: () => Promise<void>;
  setDeveloperModeWithPin: (pin: string) => Promise<boolean>;
  developerPin: string | null;
  setDeveloperPin: (pin: string) => Promise<void>;

  // Presentation Mode
  presentationMode: boolean;
  togglePresentationMode: () => void;
  showTestingWatermark: boolean;
  setShowTestingWatermark: (show: boolean) => void;

  // Active Protocol
  activeProtocol: ProtocolType;
  setActiveProtocol: (protocol: ProtocolType) => Promise<void>;

  // Protocol Configs
  protocols: Record<ProtocolType, ProtocolConfig>;
  updateProtocolConfig: <T extends ProtocolType>(
    protocol: T,
    settings: Partial<ProtocolConfig>
  ) => Promise<void>;

  // ── New consolidated settings ──
  stealthSettings: StealthProtocolSettings;
  relaySettings: RelayProtocolSettings;
  bridgeSettings: BridgeProtocolSettings;
  shieldSettings: ShieldProtocolSettings;
  sentinelSettings: SentinelProtocolSettings;

  updateStealthSettings: (settings: Partial<StealthProtocolSettings>) => Promise<void>;
  updateRelaySettings: (settings: Partial<RelayProtocolSettings>) => Promise<void>;
  updateBridgeSettings: (settings: Partial<BridgeProtocolSettings>) => Promise<void>;
  updateShieldSettings: (settings: Partial<ShieldProtocolSettings>) => Promise<void>;
  updateSentinelSettings: (settings: Partial<SentinelProtocolSettings>) => Promise<void>;

  // ── Backward-compatible aliases (deprecated – point to new settings) ──
  /** @deprecated Use stealthSettings */
  standardSettings: StealthProtocolSettings;
  /** @deprecated Use relaySettings */
  allowlistSettings: RelayProtocolSettings;
  /** @deprecated Use shieldSettings */
  protectedSettings: ShieldProtocolSettings;
  /** @deprecated Use shieldSettings */
  harnessSettings: ShieldProtocolSettings;
  /** @deprecated Use stealthSettings */
  holographicSettings: StealthProtocolSettings;
  /** @deprecated Use bridgeSettings */
  webrtcLoopbackSettings: BridgeProtocolSettings;

  /** @deprecated Use updateStealthSettings */
  updateStandardSettings: (settings: Partial<StealthProtocolSettings>) => Promise<void>;
  /** @deprecated Use updateRelaySettings */
  updateAllowlistSettings: (settings: Partial<RelayProtocolSettings>) => Promise<void>;
  /** @deprecated Use updateShieldSettings */
  updateProtectedSettings: (settings: Partial<ShieldProtocolSettings>) => Promise<void>;
  /** @deprecated Use updateShieldSettings */
  updateHarnessSettings: (settings: Partial<ShieldProtocolSettings>) => Promise<void>;
  /** @deprecated Use updateStealthSettings */
  updateHolographicSettings: (settings: Partial<StealthProtocolSettings>) => Promise<void>;
  /** @deprecated Use updateBridgeSettings */
  updateWebRtcLoopbackSettings: (settings: Partial<BridgeProtocolSettings>) => Promise<void>;

  // Allowlist helpers (kept for relay domain filtering)
  addAllowlistDomain: (domain: string) => Promise<void>;
  removeAllowlistDomain: (domain: string) => Promise<void>;
  isAllowlisted: (hostname: string) => boolean;

  // HTTPS enforcement
  httpsEnforced: boolean;
  setHttpsEnforced: (enforced: boolean) => Promise<void>;

  // ML Safety Mode (placeholder for future)
  mlSafetyEnabled: boolean;
  setMlSafetyEnabled: (enabled: boolean) => Promise<void>;

  // Enterprise iOS WebKit (private flags)
  enterpriseWebKitEnabled: boolean;
  setEnterpriseWebKitEnabled: (enabled: boolean) => Promise<void>;

  // Loading states
  isLoading: boolean;
}

// Storage Keys
const STORAGE_KEYS = {
  DEVELOPER_MODE: '@protocol_developer_mode',
  DEVELOPER_PIN: '@protocol_developer_pin',
  PRESENTATION_MODE: '@protocol_presentation_mode',
  ACTIVE_PROTOCOL: '@protocol_active',
  PROTOCOLS_CONFIG: '@protocols_config',
  STEALTH_SETTINGS: '@protocol_stealth_settings',
  RELAY_SETTINGS: '@protocol_allowlist_settings', // reuse old key for backward compat
  BRIDGE_SETTINGS: '@protocol_bridge_settings',
  SHIELD_SETTINGS: '@protocol_shield_settings',
  SENTINEL_SETTINGS: '@protocol_sentinel_settings',
  // Legacy keys – read during migration only
  STANDARD_SETTINGS: '@protocol_standard_settings',
  ALLOWLIST_SETTINGS: '@protocol_allowlist_settings',
  PROTECTED_SETTINGS: '@protocol_protected_settings',
  HARNESS_SETTINGS: '@protocol_harness_settings',
  HOLOGRAPHIC_SETTINGS: '@protocol_holographic_settings',
  WEBRTC_LOOPBACK_SETTINGS: '@protocol_webrtc_loopback_settings',
  HTTPS_ENFORCED: '@protocol_https_enforced',
  ML_SAFETY: '@protocol_ml_safety',
  TESTING_WATERMARK: '@protocol_testing_watermark',
  ENTERPRISE_WEBKIT: '@protocol_enterprise_webkit',
};

const PIN_HASH_PREFIX = 'sha256:';

const normalizePin = (pin: string): string => pin.trim();

const isHashedPin = (pin?: string | null): boolean =>
  Boolean(pin && pin.startsWith(PIN_HASH_PREFIX) && pin.length > PIN_HASH_PREFIX.length);

const hashPin = async (pin: string): Promise<string> => {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    normalizePin(pin)
  );
  return `${PIN_HASH_PREFIX}${digest}`;
};

// Default Settings
const DEFAULT_STEALTH_SETTINGS: StealthProtocolSettings = {
  autoInject: true,
  stealthByDefault: true,
  // respectSiteSettings OFF by default so stealth injection is always active.
  // With respectSiteSettings ON the effective stealth mode can be disabled for
  // certain URLs, which would prevent getUserMedia override on sites like
  // webcamtests.com where injection is essential.
  respectSiteSettings: false,
  injectMotionData: true,
  loopVideo: true,
  sdpMasquerade: true,
  emulatedDevice: 'iphone-front',
  canvasResolution: '1080p',
  frameRate: 30,
  noiseInjectionLevel: 0.1,
  // AI features disabled by default – Protocol0 (canvas-based injection) is more
  // reliable for webcamtests.com and similar sites.  Enable individually when needed.
  aiAdaptiveQuality: false,
  behavioralMimicry: false,
  quantumTimingRandomness: false,
  predictiveFrameOptimization: false,
  stealthIntensity: 'moderate',
};

const DEFAULT_RELAY_SETTINGS: RelayProtocolSettings = {
  enabled: true,
  domains: [],
  blockUnlisted: false,
  showBlockedIndicator: false,
  autoAddCurrentSite: false,

  advancedRelay: {
    pipeline: {
      hotSwitchThresholdMs: 50,
      minAcceptableFps: 15,
      enableParallelDecoding: true,
    },
    webrtc: {
      enabled: false,
      virtualTurnEnabled: false,
      sdpManipulationEnabled: false,
      stealthMode: true,
    },
    gpu: {
      enabled: false,
      qualityPreset: 'high',
      noiseInjection: false,
      noiseIntensity: 0.02,
    },
    asi: {
      enabled: true,
      siteFingerprinting: true,
      autoResolutionMatching: true,
      antiDetectionMeasures: true,
      storeHistory: true,
    },
    crossDevice: {
      enabled: false,
      discoveryMethod: 'qr',
      targetLatencyMs: 100,
      autoReconnect: true,
      connectedDeviceId: null,
    },
    crypto: {
      enabled: false,
      frameSigning: false,
      tamperDetection: false,
    },
  },
};

const DEFAULT_BRIDGE_SETTINGS: BridgeProtocolSettings = {
  enabled: true,
  preferNativeBridge: true,
  autoStart: true,
  signalingTimeoutMs: 12000,
  requireNativeBridge: true,
  iceServers: [],
  preferredCodec: 'auto',
  enableAdaptiveBitrate: true,
  enableAdaptiveResolution: true,
  minBitrateKbps: 300,
  targetBitrateKbps: 1200,
  maxBitrateKbps: 0,
  keepAliveIntervalMs: 5000,
  statsIntervalMs: 4000,
  enableDataChannel: true,
  enableIceRestart: true,
  enableSimulcast: false,
  recordingEnabled: true,
  ringBufferSeconds: 15,
  ringSegmentSeconds: 3,
  cacheRemoteVideos: true,
  cacheTTLHours: 24,
  cacheMaxSizeMB: 1024,
  resolution: '1080p',
  frameRate: 30,
  quality: 0.85,
  useSyntheticFallback: true,
};

const DEFAULT_SHIELD_SETTINGS: ShieldProtocolSettings = {
  bodyDetectionEnabled: true,
  sensitivityLevel: 'medium',
  replacementVideoId: null,
  showProtectedBadge: true,
  autoTriggerOnFace: true,
  blurFallback: true,
  overlayEnabled: true,
  showDebugInfo: true,
  captureFrameRate: 30,
  enableAudioPassthrough: false,
  mirrorVideo: false,
  testPatternOnNoVideo: true,
};

const DEFAULT_SENTINEL_SETTINGS: SentinelProtocolSettings = {
  enabled: true,

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

const DEFAULT_ACTIVE_PROTOCOL: ProtocolType = 'stealth';

const DEFAULT_PROTOCOLS: Record<ProtocolType, ProtocolConfig> = {
  stealth: {
    id: 'stealth',
    name: 'Quantum Stealth Engine',
    description: 'Canvas-based getUserMedia override, SDP masquerade, AI behavioral mimicry, quantum timing randomness, and GPU noise injection.',
    enabled: true,
    settings: {},
  },
  relay: {
    id: 'relay',
    name: 'Advanced Relay',
    description: 'WebRTC relay, GPU processing, ASI, cross-device streaming, cryptographic validation, and domain filtering.',
    enabled: true,
    settings: {},
  },
  bridge: {
    id: 'bridge',
    name: 'Native Bridge',
    description: 'Native WebRTC when available (iOS dev builds), postMessage bridge fallback for Android.',
    enabled: true,
    settings: {},
  },
  shield: {
    id: 'shield',
    name: 'Stealth Shield',
    description: 'Body/face detection, safe video replacement, debug overlay, and test patterns.',
    enabled: true,
    settings: {},
  },
  sentinel: {
    id: 'sentinel',
    name: 'Sentinel Protocol',
    description: 'Zero-trust environment virtualization with multi-layer verification, adaptive fallback orchestration, hardened stream integrity, and environment fingerprint masking.',
    enabled: true,
    settings: {},
  },
};

export const isProtocolType = (value: string): value is ProtocolType => {
  return value === 'stealth' || value === 'relay' || value === 'bridge' || value === 'shield' || value === 'sentinel';
};

const clampProtocolsForExpoGo = (
  nextProtocols: Record<ProtocolType, ProtocolConfig>
): Record<ProtocolType, ProtocolConfig> => {
  return nextProtocols;
};

export const mergeProtocolsWithDefaults = (
  storedProtocols?: Record<string, ProtocolConfig>
): Record<ProtocolType, ProtocolConfig> => {
  const merged = { ...DEFAULT_PROTOCOLS };
  if (storedProtocols) {
    Object.entries(storedProtocols).forEach(([key, value]) => {
      if (isProtocolType(key)) {
        merged[key] = { ...merged[key], ...value };
      }
    });
  }
  return clampProtocolsForExpoGo(merged);
};

const clampBridgeSettings = (
  settings: BridgeProtocolSettings
): BridgeProtocolSettings => {
  return settings;
};

const resolveActiveProtocol = (
  candidate: ProtocolType | null | undefined,
  nextProtocols: Record<ProtocolType, ProtocolConfig>
): ProtocolType => {
  if (candidate && nextProtocols[candidate]?.enabled) {
    return candidate;
  }
  const firstEnabled = (Object.keys(nextProtocols) as ProtocolType[]).find(
    (protocolId) => nextProtocols[protocolId]?.enabled
  );
  if (firstEnabled) {
    return firstEnabled;
  }
  // All protocols disabled – force-enable stealth as the most reliable fallback
  // and return it so injection always has a working path.
  nextProtocols.stealth = { ...nextProtocols.stealth, enabled: true };
  return 'stealth';
};

export const [ProtocolProvider, useProtocol] = createContextHook<ProtocolContextValue>(() => {
  const [isLoading, setIsLoading] = useState(true);
  const [developerModeEnabled, setDeveloperModeEnabled] = useState(false);
  const [developerPin, setDeveloperPinState] = useState<string | null>(null);
  const [presentationMode, setPresentationMode] = useState(true);
  const [showTestingWatermark, setShowTestingWatermarkState] = useState(true);
  const [activeProtocol, setActiveProtocolState] = useState<ProtocolType>(DEFAULT_ACTIVE_PROTOCOL);
  const [protocols, setProtocols] = useState<Record<ProtocolType, ProtocolConfig>>(DEFAULT_PROTOCOLS);
  const [httpsEnforced, setHttpsEnforcedState] = useState(true);
  const [mlSafetyEnabled, setMlSafetyEnabledState] = useState(true);
  const [enterpriseWebKitEnabled, setEnterpriseWebKitEnabledState] = useState(true);

  // Consolidated protocol settings (4 total)
  const [stealthSettings, setStealthSettings] = useState<StealthProtocolSettings>(DEFAULT_STEALTH_SETTINGS);
  const [relaySettings, setRelaySettings] = useState<RelayProtocolSettings>(DEFAULT_RELAY_SETTINGS);
  const [bridgeSettings, setBridgeSettings] = useState<BridgeProtocolSettings>(DEFAULT_BRIDGE_SETTINGS);
  const [shieldSettings, setShieldSettings] = useState<ShieldProtocolSettings>(DEFAULT_SHIELD_SETTINGS);
  const [sentinelSettings, setSentinelSettings] = useState<SentinelProtocolSettings>(DEFAULT_SENTINEL_SETTINGS);

  // Load all settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [
          devMode,
          pin,
          presMode,
          watermark,
          activeProto,
          protocolsConfig,
          stealthStored,
          relayStored,
          bridgeStored,
          shieldStored,
          sentinelStored,
          // Legacy keys for migration
          legacyStandard,
          legacyHolographic,
          legacyProtected,
          legacyHarness,
          legacyWebrtcLoopback,
          https,
          mlSafety,
          enterpriseWebKit,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.DEVELOPER_MODE),
          AsyncStorage.getItem(STORAGE_KEYS.DEVELOPER_PIN),
          AsyncStorage.getItem(STORAGE_KEYS.PRESENTATION_MODE),
          AsyncStorage.getItem(STORAGE_KEYS.TESTING_WATERMARK),
          AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_PROTOCOL),
          AsyncStorage.getItem(STORAGE_KEYS.PROTOCOLS_CONFIG),
          AsyncStorage.getItem(STORAGE_KEYS.STEALTH_SETTINGS),
          AsyncStorage.getItem(STORAGE_KEYS.RELAY_SETTINGS),
          AsyncStorage.getItem(STORAGE_KEYS.BRIDGE_SETTINGS),
          AsyncStorage.getItem(STORAGE_KEYS.SHIELD_SETTINGS),
          AsyncStorage.getItem(STORAGE_KEYS.SENTINEL_SETTINGS),
          // Legacy keys
          AsyncStorage.getItem(STORAGE_KEYS.STANDARD_SETTINGS),
          AsyncStorage.getItem(STORAGE_KEYS.HOLOGRAPHIC_SETTINGS),
          AsyncStorage.getItem(STORAGE_KEYS.PROTECTED_SETTINGS),
          AsyncStorage.getItem(STORAGE_KEYS.HARNESS_SETTINGS),
          AsyncStorage.getItem(STORAGE_KEYS.WEBRTC_LOOPBACK_SETTINGS),
          AsyncStorage.getItem(STORAGE_KEYS.HTTPS_ENFORCED),
          AsyncStorage.getItem(STORAGE_KEYS.ML_SAFETY),
          AsyncStorage.getItem(STORAGE_KEYS.ENTERPRISE_WEBKIT),
        ]);

        if (devMode !== null) setDeveloperModeEnabled(devMode === 'true');
        if (pin) {
          const normalizedPin = normalizePin(pin);
          if (!isHashedPin(normalizedPin)) {
            const hashedPin = await hashPin(normalizedPin);
            setDeveloperPinState(hashedPin);
            await AsyncStorage.setItem(STORAGE_KEYS.DEVELOPER_PIN, hashedPin);
            console.log('[Protocol] Migrated developer PIN to hashed storage');
          } else {
            setDeveloperPinState(normalizedPin);
          }
        }
        if (presMode !== null) setPresentationMode(presMode === 'true');
        if (watermark !== null) setShowTestingWatermarkState(watermark === 'true');

        let nextProtocols = mergeProtocolsWithDefaults();
        if (protocolsConfig) {
          try {
            const parsed = JSON.parse(protocolsConfig);
            nextProtocols = mergeProtocolsWithDefaults(parsed);
          } catch (e) {
            console.warn('[Protocol] Failed to parse protocols config:', e);
          }
        }
        setProtocols(nextProtocols);

        // ── Migrate active protocol from old ID → new ──
        let requestedProtocol: ProtocolType | null = null;
        if (activeProto) {
          if (isProtocolType(activeProto)) {
            requestedProtocol = activeProto;
          } else {
            const migrated = migrateProtocolType(activeProto);
            if (migrated) {
              requestedProtocol = migrated;
              console.log(`[Protocol] Migrated active protocol: ${activeProto} → ${migrated}`);
            } else {
              console.warn('[Protocol] Invalid active protocol found:', activeProto);
            }
          }
        }
        const resolvedProtocol = resolveActiveProtocol(requestedProtocol, nextProtocols);
        setActiveProtocolState(resolvedProtocol);
        if (activeProto !== resolvedProtocol) {
          await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_PROTOCOL, resolvedProtocol);
        }

        // ── Stealth settings (merge from legacy standard/holographic if no new key) ──
        if (stealthStored) {
          try {
            setStealthSettings({ ...DEFAULT_STEALTH_SETTINGS, ...JSON.parse(stealthStored) });
          } catch (e) {
            console.warn('[Protocol] Failed to parse stealth settings:', e);
          }
        } else if (legacyStandard || legacyHolographic) {
          try {
            const base = { ...DEFAULT_STEALTH_SETTINGS };
            if (legacyStandard) Object.assign(base, JSON.parse(legacyStandard));
            if (legacyHolographic) Object.assign(base, JSON.parse(legacyHolographic));
            setStealthSettings(base);
            await AsyncStorage.setItem(STORAGE_KEYS.STEALTH_SETTINGS, JSON.stringify(base));
            // Remove legacy keys after successful migration
            await AsyncStorage.multiRemove([STORAGE_KEYS.STANDARD_SETTINGS, STORAGE_KEYS.HOLOGRAPHIC_SETTINGS]);
            console.log('[Protocol] Migrated legacy standard/holographic → stealth settings');
          } catch (e) {
            console.warn('[Protocol] Failed to migrate stealth settings:', e);
          }
        }

        // ── Relay settings (same storage key as allowlist) ──
        if (relayStored) {
          try {
            setRelaySettings({ ...DEFAULT_RELAY_SETTINGS, ...JSON.parse(relayStored) });
          } catch (e) {
            console.warn('[Protocol] Failed to parse relay settings:', e);
          }
        }

        // ── Bridge settings (merge from legacy webrtc-loopback if no new key) ──
        if (bridgeStored) {
          try {
            const parsed = { ...DEFAULT_BRIDGE_SETTINGS, ...JSON.parse(bridgeStored) };
            const sanitized = clampBridgeSettings(parsed);
            setBridgeSettings(sanitized);
          } catch (e) {
            console.warn('[Protocol] Failed to parse bridge settings:', e);
          }
        } else if (legacyWebrtcLoopback) {
          try {
            const base = { ...DEFAULT_BRIDGE_SETTINGS, ...JSON.parse(legacyWebrtcLoopback) };
            const sanitized = clampBridgeSettings(base);
            setBridgeSettings(sanitized);
            await AsyncStorage.setItem(STORAGE_KEYS.BRIDGE_SETTINGS, JSON.stringify(sanitized));
            await AsyncStorage.removeItem(STORAGE_KEYS.WEBRTC_LOOPBACK_SETTINGS);
            console.log('[Protocol] Migrated legacy webrtc-loopback → bridge settings');
          } catch (e) {
            console.warn('[Protocol] Failed to migrate bridge settings:', e);
          }
        }

        // ── Shield settings (merge from legacy protected/harness if no new key) ──
        if (shieldStored) {
          try {
            setShieldSettings({ ...DEFAULT_SHIELD_SETTINGS, ...JSON.parse(shieldStored) });
          } catch (e) {
            console.warn('[Protocol] Failed to parse shield settings:', e);
          }
        } else if (legacyProtected || legacyHarness) {
          try {
            const base = { ...DEFAULT_SHIELD_SETTINGS };
            if (legacyProtected) Object.assign(base, JSON.parse(legacyProtected));
            if (legacyHarness) Object.assign(base, JSON.parse(legacyHarness));
            setShieldSettings(base);
            await AsyncStorage.setItem(STORAGE_KEYS.SHIELD_SETTINGS, JSON.stringify(base));
            await AsyncStorage.multiRemove([STORAGE_KEYS.PROTECTED_SETTINGS, STORAGE_KEYS.HARNESS_SETTINGS]);
            console.log('[Protocol] Migrated legacy protected/harness → shield settings');
          } catch (e) {
            console.warn('[Protocol] Failed to migrate shield settings:', e);
          }
        }

        // ── Sentinel settings ──
        if (sentinelStored) {
          try {
            setSentinelSettings({ ...DEFAULT_SENTINEL_SETTINGS, ...JSON.parse(sentinelStored) });
          } catch (e) {
            console.warn('[Protocol] Failed to parse sentinel settings:', e);
          }
        }

        if (https !== null) setHttpsEnforcedState(https === 'true');
        if (mlSafety !== null) setMlSafetyEnabledState(mlSafety === 'true');
        if (enterpriseWebKit !== null) {
          setEnterpriseWebKitEnabledState(enterpriseWebKit === 'true');
        }

        console.log('[Protocol] Settings loaded successfully');
      } catch (error) {
        console.error('[Protocol] Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const toggleDeveloperMode = useCallback(async () => {
    const newValue = !developerModeEnabled;
    setDeveloperModeEnabled(newValue);
    await AsyncStorage.setItem(STORAGE_KEYS.DEVELOPER_MODE, String(newValue));
    console.log('[Protocol] Developer mode toggled:', newValue);
  }, [developerModeEnabled]);

  const setDeveloperModeWithPin = useCallback(async (pin: string): Promise<boolean> => {
    const normalizedPin = normalizePin(pin);
    if (!normalizedPin) {
      return false;
    }

    if (!developerPin) {
      const hashedPin = await hashPin(normalizedPin);
      setDeveloperPinState(hashedPin);
      await AsyncStorage.setItem(STORAGE_KEYS.DEVELOPER_PIN, hashedPin);
      setDeveloperModeEnabled(true);
      await AsyncStorage.setItem(STORAGE_KEYS.DEVELOPER_MODE, 'true');
      return true;
    }

    if (isHashedPin(developerPin)) {
      const hashedAttempt = await hashPin(normalizedPin);
      if (hashedAttempt === developerPin) {
        setDeveloperModeEnabled(true);
        await AsyncStorage.setItem(STORAGE_KEYS.DEVELOPER_MODE, 'true');
        return true;
      }
    } else if (normalizedPin === developerPin) {
      setDeveloperModeEnabled(true);
      await AsyncStorage.setItem(STORAGE_KEYS.DEVELOPER_MODE, 'true');
      return true;
    }

    return false;
  }, [developerPin]);

  const setDeveloperPin = useCallback(async (pin: string) => {
    const normalizedPin = normalizePin(pin);
    const hashedPin = await hashPin(normalizedPin);
    setDeveloperPinState(hashedPin);
    await AsyncStorage.setItem(STORAGE_KEYS.DEVELOPER_PIN, hashedPin);
  }, []);

  const togglePresentationMode = useCallback(() => {
    const newValue = !presentationMode;
    setPresentationMode(newValue);
    AsyncStorage.setItem(STORAGE_KEYS.PRESENTATION_MODE, String(newValue)).catch(
      (err) => console.error('[Protocol] Failed to save presentation mode:', err)
    );
    console.log('[Protocol] Presentation mode toggled:', newValue);
  }, [presentationMode]);

  const setShowTestingWatermark = useCallback(async (show: boolean) => {
    setShowTestingWatermarkState(show);
    await AsyncStorage.setItem(STORAGE_KEYS.TESTING_WATERMARK, String(show));
  }, []);

  const setActiveProtocol = useCallback(async (protocol: ProtocolType) => {
    const resolved = resolveActiveProtocol(protocol, protocols);
    setActiveProtocolState(resolved);
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_PROTOCOL, resolved);
    console.log('[Protocol] Active protocol set:', resolved);
  }, [protocols]);

  const updateProtocolConfig = useCallback(async <T extends ProtocolType>(
    protocol: T,
    updates: Partial<ProtocolConfig>
  ) => {
    const updatedProtocols = clampProtocolsForExpoGo({
      ...protocols,
      [protocol]: { ...protocols[protocol], ...updates },
    });
    setProtocols(updatedProtocols);
    await AsyncStorage.setItem(STORAGE_KEYS.PROTOCOLS_CONFIG, JSON.stringify(updatedProtocols));
    const resolved = resolveActiveProtocol(activeProtocol, updatedProtocols);
    if (resolved !== activeProtocol) {
      setActiveProtocolState(resolved);
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_PROTOCOL, resolved);
    }
  }, [activeProtocol, protocols]);

  // ── Settings updaters ──

  const updateStealthSettings = useCallback(async (settings: Partial<StealthProtocolSettings>) => {
    const newSettings = { ...stealthSettings, ...settings };
    setStealthSettings(newSettings);
    await AsyncStorage.setItem(STORAGE_KEYS.STEALTH_SETTINGS, JSON.stringify(newSettings));
  }, [stealthSettings]);

  const updateRelaySettings = useCallback(async (settings: Partial<RelayProtocolSettings>) => {
    // Deep-merge advancedRelay so callers can update a single sub-key without
    // wiping sibling sub-objects (pipeline, webrtc, gpu, asi, crossDevice, crypto).
    const mergedAdvancedRelay = settings.advancedRelay
      ? {
          pipeline: { ...relaySettings.advancedRelay.pipeline, ...settings.advancedRelay.pipeline },
          webrtc: { ...relaySettings.advancedRelay.webrtc, ...settings.advancedRelay.webrtc },
          gpu: { ...relaySettings.advancedRelay.gpu, ...settings.advancedRelay.gpu },
          asi: { ...relaySettings.advancedRelay.asi, ...settings.advancedRelay.asi },
          crossDevice: { ...relaySettings.advancedRelay.crossDevice, ...settings.advancedRelay.crossDevice },
          crypto: { ...relaySettings.advancedRelay.crypto, ...settings.advancedRelay.crypto },
        }
      : relaySettings.advancedRelay;

    const newSettings: RelayProtocolSettings = {
      ...relaySettings,
      ...settings,
      advancedRelay: mergedAdvancedRelay,
    };
    setRelaySettings(newSettings);
    await AsyncStorage.setItem(STORAGE_KEYS.RELAY_SETTINGS, JSON.stringify(newSettings));
  }, [relaySettings]);

  const updateBridgeSettings = useCallback(async (settings: Partial<BridgeProtocolSettings>) => {
    const newSettings = clampBridgeSettings({ ...bridgeSettings, ...settings });
    setBridgeSettings(newSettings);
    await AsyncStorage.setItem(STORAGE_KEYS.BRIDGE_SETTINGS, JSON.stringify(newSettings));
  }, [bridgeSettings]);

  const updateShieldSettings = useCallback(async (settings: Partial<ShieldProtocolSettings>) => {
    const newSettings = { ...shieldSettings, ...settings };
    setShieldSettings(newSettings);
    await AsyncStorage.setItem(STORAGE_KEYS.SHIELD_SETTINGS, JSON.stringify(newSettings));
  }, [shieldSettings]);

  const updateSentinelSettings = useCallback(async (settings: Partial<SentinelProtocolSettings>) => {
    // Deep-merge nested objects so callers can update a single sub-key without
    // wiping sibling sub-objects. Only merge nested keys when provided.
    const merged: SentinelProtocolSettings = {
      ...sentinelSettings,
      ...settings,
      zeroTrust: settings.zeroTrust
        ? { ...sentinelSettings.zeroTrust, ...settings.zeroTrust }
        : sentinelSettings.zeroTrust,
      fallbackChain: settings.fallbackChain
        ? { ...sentinelSettings.fallbackChain, ...settings.fallbackChain }
        : sentinelSettings.fallbackChain,
      streamIntegrity: settings.streamIntegrity
        ? { ...sentinelSettings.streamIntegrity, ...settings.streamIntegrity }
        : sentinelSettings.streamIntegrity,
      environmentMasking: settings.environmentMasking
        ? { ...sentinelSettings.environmentMasking, ...settings.environmentMasking }
        : sentinelSettings.environmentMasking,
      telemetry: settings.telemetry
        ? { ...sentinelSettings.telemetry, ...settings.telemetry }
        : sentinelSettings.telemetry,
    };
    setSentinelSettings(merged);
    await AsyncStorage.setItem(STORAGE_KEYS.SENTINEL_SETTINGS, JSON.stringify(merged));
  }, [sentinelSettings]);

  // Allowlist helpers (operate on relaySettings)
  const addAllowlistDomain = useCallback(async (domain: string) => {
    const normalized = domain.trim().toLowerCase().replace(/^www\./, '');
    if (!normalized || relaySettings.domains.includes(normalized)) return;

    const newDomains = [...relaySettings.domains, normalized];
    await updateRelaySettings({ domains: newDomains });
  }, [relaySettings.domains, updateRelaySettings]);

  const removeAllowlistDomain = useCallback(async (domain: string) => {
    const newDomains = relaySettings.domains.filter(d => d !== domain);
    await updateRelaySettings({ domains: newDomains });
  }, [relaySettings.domains, updateRelaySettings]);

  const isAllowlisted = useCallback((hostname: string): boolean => {
    if (!relaySettings.enabled) return true;
    const normalizedHostname = hostname.toLowerCase().replace(/^www\./, '');
    return relaySettings.domains.some(domain =>
      normalizedHostname === domain || normalizedHostname.endsWith(`.${domain}`)
    );
  }, [relaySettings.enabled, relaySettings.domains]);

  const setHttpsEnforced = useCallback(async (enforced: boolean) => {
    setHttpsEnforcedState(enforced);
    await AsyncStorage.setItem(STORAGE_KEYS.HTTPS_ENFORCED, String(enforced));
  }, []);

  const setMlSafetyEnabled = useCallback(async (enabled: boolean) => {
    setMlSafetyEnabledState(enabled);
    await AsyncStorage.setItem(STORAGE_KEYS.ML_SAFETY, String(enabled));
  }, []);

  const setEnterpriseWebKitEnabled = useCallback(async (enabled: boolean) => {
    setEnterpriseWebKitEnabledState(enabled);
    await AsyncStorage.setItem(STORAGE_KEYS.ENTERPRISE_WEBKIT, String(enabled));
  }, []);

  return {
    developerModeEnabled,
    toggleDeveloperMode,
    setDeveloperModeWithPin,
    developerPin,
    setDeveloperPin,
    presentationMode,
    togglePresentationMode,
    showTestingWatermark,
    setShowTestingWatermark,
    activeProtocol,
    setActiveProtocol,
    protocols,
    updateProtocolConfig,

    // New consolidated settings
    stealthSettings,
    relaySettings,
    bridgeSettings,
    shieldSettings,
    sentinelSettings,
    updateStealthSettings,
    updateRelaySettings,
    updateBridgeSettings,
    updateShieldSettings,
    updateSentinelSettings,

    // Backward-compatible aliases
    standardSettings: stealthSettings,
    allowlistSettings: relaySettings,
    protectedSettings: shieldSettings,
    harnessSettings: shieldSettings,
    holographicSettings: stealthSettings,
    webrtcLoopbackSettings: bridgeSettings,
    updateStandardSettings: updateStealthSettings,
    updateAllowlistSettings: updateRelaySettings,
    updateProtectedSettings: updateShieldSettings,
    updateHarnessSettings: updateShieldSettings,
    updateHolographicSettings: updateStealthSettings,
    updateWebRtcLoopbackSettings: updateBridgeSettings,

    // Allowlist helpers
    addAllowlistDomain,
    removeAllowlistDomain,
    isAllowlisted,
    httpsEnforced,
    setHttpsEnforced,
    mlSafetyEnabled,
    setMlSafetyEnabled,
    enterpriseWebKitEnabled,
    setEnterpriseWebKitEnabled,
    isLoading,
  };
});
