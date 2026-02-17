/**
 * Protocol Settings Types
 * Defines configuration for all 5 testing protocols
 */

export type ProtocolId = 'stealth' | 'relay' | 'bridge' | 'shield' | 'sentinel';

/** @deprecated Use ProtocolId – old names kept for downstream compat */
export type LegacyProtocolId = 'standard' | 'allowlist' | 'protected' | 'harness' | 'holographic' | 'websocket' | 'webrtc-loopback' | 'claude-sonnet' | 'claude' | 'sonnet';

export interface ProtocolConfig {
  id: ProtocolId;
  name: string;
  description: string;
  enabled: boolean;
  isLive: boolean;
  requiresDeveloperMode: boolean;
}

// Protocol 1: Standard Injection Settings
export interface StandardInjectionSettings {
  enabled: boolean;
  autoInject: boolean;
  stealthByDefault: boolean;
  injectionDelay: number; // ms
  retryOnFail: boolean;
  maxRetries: number;
  loggingLevel: 'none' | 'minimal' | 'verbose';
}

// Protocol 2: Advanced Relay Settings (Replaces old Allowlist Mode)
// This is the most technically advanced video injection system featuring:
// - Multi-source video pipeline with hot-switching
// - WebRTC local relay with virtual TURN emulation
// - GPU-accelerated video processing
// - Adaptive Stream Intelligence (ASI)
// - Cross-device live streaming support
// - Cryptographic stream validation
export interface AdvancedRelaySettings {
  enabled: boolean;
  
  // Video Pipeline Settings
  pipeline: {
    hotSwitchThresholdMs: number;
    minAcceptableFps: number;
    enableParallelDecoding: boolean;
  };
  
  // WebRTC Relay Settings
  webrtc: {
    enabled: boolean;
    virtualTurnEnabled: boolean;
    sdpManipulationEnabled: boolean;
    stealthMode: boolean;
  };
  
  // GPU Processing Settings
  gpu: {
    enabled: boolean;
    qualityPreset: 'ultra' | 'high' | 'medium' | 'low' | 'potato';
    noiseInjection: boolean;
    noiseIntensity: number;
  };
  
  // Adaptive Stream Intelligence Settings
  asi: {
    enabled: boolean;
    siteFingerprinting: boolean;
    autoResolutionMatching: boolean;
    antiDetectionMeasures: boolean;
    storeHistory: boolean;
  };
  
  // Cross-Device Streaming Settings
  crossDevice: {
    enabled: boolean;
    discoveryMethod: 'manual' | 'mdns' | 'qr';
    targetLatencyMs: number;
    autoReconnect: boolean;
  };
  
  // Cryptographic Validation Settings
  crypto: {
    enabled: boolean;
    frameSigning: boolean;
    tamperDetection: boolean;
    keyRotationIntervalMs: number;
  };
  
  // Legacy compatibility - domains still supported for filtering
  domains: string[];
  blockByDefault: boolean;
  showBlockedNotification: boolean;
  autoAddCurrentSite: boolean;
}

// Legacy alias for backwards compatibility
export type AllowlistSettings = AdvancedRelaySettings;

// Protocol 5: Holographic Stream Injection (HSI)
export interface HolographicSettings {
  enabled: boolean;
  // Network Layer
  useWebSocketBridge: boolean;
  bridgePort: number;
  latencyMode: 'ultra-low' | 'balanced' | 'quality';
  
  // Stream Synthesis
  canvasResolution: '720p' | '1080p' | '4k';
  frameRate: 30 | 60;
  noiseInjectionLevel: number; // 0-1.0, adds sensor noise to bypass "too clean" checks
  
  // SDP Mutation
  sdpMasquerade: boolean; // Rewrites SDP to look like hardware encoder
  emulatedDevice: 'iphone-front' | 'webcam-c920' | 'obs-virtual';
}

// Protocol 3: Protected Preview Settings
export interface ProtectedPreviewSettings {
  bodyDetectionEnabled: boolean;
  sensitivityLevel: 'low' | 'medium' | 'high';
  replacementVideoId: string | null;
  showProtectedBadge: boolean;
  autoTriggerOnFace: boolean;
  blurFallback: boolean;
}

// Protocol 6: WebSocket Bridge Settings
// Uses React Native's postMessage to send video frames to WebView
// Most reliable method - bypasses all canvas timing issues
export interface WebSocketBridgeSettings {
  enabled: boolean;
  
  // Connection settings (uses postMessage, not actual WebSocket)
  port: number; // For display purposes
  
  // Video settings
  resolution: '720p' | '1080p' | '4k';
  frameRate: 24 | 30 | 60;
  quality: number; // 0-1, JPEG quality for frame encoding
  
  // Rendering
  useSyntheticFallback: boolean; // Use green screen if no video
  enableFrameInterpolation: boolean;
  
  // Debug
  showDebugOverlay: boolean;
  logFrameStats: boolean;
}

// Protocol 4: Test Harness Settings
export interface TestHarnessSettings {
  overlayEnabled: boolean;
  showDebugInfo: boolean;
  captureFrameRate: number;
  enableAudioPassthrough: boolean;
  mirrorVideo: boolean;
  testPatternOnNoVideo: boolean;
}

// Protocol 6: WebRTC Loopback (Native bridge)
export interface WebRtcLoopbackSettings {
  enabled: boolean;
  autoStart: boolean;
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
}

// Protocol 5: Sentinel Protocol Settings
// Zero-trust environment virtualization with multi-layer verification,
// adaptive fallback orchestration, and hardened stream integrity.
export interface SentinelProtocolSettings {
  enabled: boolean;

  // Zero-trust verification layer
  zeroTrust: {
    enabled: boolean;
    environmentValidation: boolean;
    continuousAttestation: boolean;
    attestationIntervalMs: number;
    trustScoreThreshold: number; // 0-100, minimum trust score to continue injection
  };

  // Adaptive fallback orchestration
  fallbackChain: {
    enabled: boolean;
    strategy: 'waterfall' | 'race' | 'weighted';
    maxFallbackAttempts: number;
    fallbackTimeoutMs: number;
    protocolPriority: ProtocolId[];
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

// Combined Protocol Settings
export interface ProtocolSettings {
  stealth: StandardInjectionSettings;
  relay: AllowlistSettings;
  shield: ProtectedPreviewSettings & TestHarnessSettings;
  bridge: WebSocketBridgeSettings & WebRtcLoopbackSettings;
  sentinel: SentinelProtocolSettings;
  /** @deprecated */ standard?: StandardInjectionSettings;
  /** @deprecated */ allowlist?: AllowlistSettings;
  /** @deprecated */ protected?: ProtectedPreviewSettings;
  /** @deprecated */ harness?: TestHarnessSettings;
  /** @deprecated */ holographic?: HolographicSettings;
  /** @deprecated */ websocket?: WebSocketBridgeSettings;
  /** @deprecated */ webrtcLoopback?: WebRtcLoopbackSettings;
}

// Developer Mode Settings
export interface DeveloperModeSettings {
  enabled: boolean;
  pinCode: string | null;
  showWatermark: boolean;
  showDebugInfo: boolean;
  allowProtocolEditing: boolean;
  allowAllowlistEditing: boolean;
  bypassSecurityChecks: boolean;
  enableBenchmarkMode: boolean;
  lastEnabledAt: string | null;
}

// Default configurations
export const DEFAULT_STANDARD_SETTINGS: StandardInjectionSettings = {
  enabled: true,
  autoInject: true,
  stealthByDefault: true,
  injectionDelay: 100,
  retryOnFail: true,
  maxRetries: 3,
  loggingLevel: 'minimal',
};

export const DEFAULT_ADVANCED_RELAY_SETTINGS: AdvancedRelaySettings = {
  enabled: true,
  
  // Video Pipeline - optimized for quality
  pipeline: {
    hotSwitchThresholdMs: 50,
    minAcceptableFps: 15,
    enableParallelDecoding: true,
  },
  
  // WebRTC Relay - disabled by default for reliability
  webrtc: {
    enabled: false,
    virtualTurnEnabled: false,
    sdpManipulationEnabled: false,
    stealthMode: true,
  },
  
  // GPU Processing - disabled by default (unreliable on Android WebView)
  gpu: {
    enabled: false,
    qualityPreset: 'high',
    noiseInjection: false,
    noiseIntensity: 0.02,
  },
  
  // ASI - intelligent adaptation (reliable, canvas-only)
  asi: {
    enabled: true,
    siteFingerprinting: true,
    autoResolutionMatching: true,
    antiDetectionMeasures: true,
    storeHistory: true,
  },
  
  // Cross-Device - disabled by default
  crossDevice: {
    enabled: false,
    discoveryMethod: 'qr',
    targetLatencyMs: 100,
    autoReconnect: true,
  },
  
  // Crypto - disabled by default for reliability
  crypto: {
    enabled: false,
    frameSigning: false,
    tamperDetection: false,
    keyRotationIntervalMs: 3600000, // 1 hour
  },
  
  // Legacy domain filtering (preserved for compatibility)
  domains: [],
  blockByDefault: false,
  showBlockedNotification: false,
  autoAddCurrentSite: false,
};

// Legacy alias for backwards compatibility
export const DEFAULT_ALLOWLIST_SETTINGS = DEFAULT_ADVANCED_RELAY_SETTINGS;

export const DEFAULT_HOLOGRAPHIC_SETTINGS: HolographicSettings = {
  enabled: true,
  useWebSocketBridge: true,
  bridgePort: 8080,
  latencyMode: 'balanced',
  canvasResolution: '1080p',
  frameRate: 30,
  noiseInjectionLevel: 0.1,
  sdpMasquerade: true,
  emulatedDevice: 'iphone-front',
};

export const DEFAULT_PROTECTED_SETTINGS: ProtectedPreviewSettings = {
  bodyDetectionEnabled: true,
  sensitivityLevel: 'medium',
  replacementVideoId: null,
  showProtectedBadge: true,
  autoTriggerOnFace: true,
  blurFallback: true,
};

export const DEFAULT_HARNESS_SETTINGS: TestHarnessSettings = {
  overlayEnabled: true,
  showDebugInfo: true,
  captureFrameRate: 30,
  enableAudioPassthrough: false,
  mirrorVideo: false,
  testPatternOnNoVideo: true,
};

export const DEFAULT_WEBSOCKET_SETTINGS: WebSocketBridgeSettings = {
  enabled: true,
  port: 8765,
  resolution: '1080p',
  frameRate: 30,
  quality: 0.7,
  useSyntheticFallback: true,
  enableFrameInterpolation: false,
  showDebugOverlay: false,
  logFrameStats: false,
};

export const DEFAULT_WEBRTC_LOOPBACK_SETTINGS: WebRtcLoopbackSettings = {
  enabled: true,
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
};

export const DEFAULT_SENTINEL_SETTINGS: SentinelProtocolSettings = {
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
    rotationIntervalMs: 300000, // 5 minutes
  },

  telemetry: {
    enabled: true,
    collectPerformanceMetrics: true,
    collectThreatIntelligence: true,
    metricsIntervalMs: 2000,
    maxStoredSessions: 50,
  },
};

export const DEFAULT_PROTOCOL_SETTINGS: ProtocolSettings = {
  stealth: DEFAULT_STANDARD_SETTINGS,
  relay: DEFAULT_ALLOWLIST_SETTINGS,
  shield: { ...DEFAULT_PROTECTED_SETTINGS, ...DEFAULT_HARNESS_SETTINGS },
  bridge: { ...DEFAULT_WEBSOCKET_SETTINGS, ...DEFAULT_WEBRTC_LOOPBACK_SETTINGS },
  sentinel: DEFAULT_SENTINEL_SETTINGS,
  // Legacy aliases
  standard: DEFAULT_STANDARD_SETTINGS,
  allowlist: DEFAULT_ALLOWLIST_SETTINGS,
  protected: DEFAULT_PROTECTED_SETTINGS,
  harness: DEFAULT_HARNESS_SETTINGS,
  holographic: DEFAULT_HOLOGRAPHIC_SETTINGS,
  websocket: DEFAULT_WEBSOCKET_SETTINGS,
  webrtcLoopback: DEFAULT_WEBRTC_LOOPBACK_SETTINGS,
};

export const DEFAULT_DEVELOPER_MODE: DeveloperModeSettings = {
  // For safety in wider testing, developer mode defaults to disabled.
  enabled: false,
  // Default PIN requested by you: '0000'
  pinCode: '0000',
  showWatermark: true,
  showDebugInfo: false,
  allowProtocolEditing: true,
  allowAllowlistEditing: true,
  bypassSecurityChecks: false,
  enableBenchmarkMode: false,
  lastEnabledAt: null,
};

// Protocol metadata for UI display
export const PROTOCOL_METADATA: Record<ProtocolId, ProtocolConfig> = {
  stealth: {
    id: 'stealth',
    name: 'Stealth Protocol',
    description: 'Standard media injection with advanced stealth mode for internal testing and controlled environments.',
    enabled: true,
    isLive: true,
    requiresDeveloperMode: false,
  },
  relay: {
    id: 'relay',
    name: 'Relay Protocol',
    description: 'The most technically advanced video injection system featuring WebRTC relay, GPU processing, Adaptive Stream Intelligence, cross-device streaming, and cryptographic validation.',
    enabled: true,
    isLive: true,
    requiresDeveloperMode: true,
  },
  shield: {
    id: 'shield',
    name: 'Shield Protocol',
    description: 'Protected preview and local test harness with body detection, safe video swap, and sandbox testing.',
    enabled: true,
    isLive: true,
    requiresDeveloperMode: false,
  },
  bridge: {
    id: 'bridge',
    name: 'Bridge Protocol',
    description: 'WebSocket and WebRTC bridge for streaming video frames directly to WebView. Most reliable method for maximum compatibility.',
    enabled: true,
    isLive: true,
    requiresDeveloperMode: false,
  },
  sentinel: {
    id: 'sentinel',
    name: 'Sentinel Protocol',
    description: 'Zero-trust environment virtualization with multi-layer verification, adaptive fallback orchestration, hardened stream integrity, and environment fingerprint masking.',
    enabled: true,
    isLive: true,
    requiresDeveloperMode: true,
  },
};
