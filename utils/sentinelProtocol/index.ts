/**
 * Sentinel Protocol – barrel export
 */
export {
  SentinelEngine,
  getSentinelEngine,
  destroySentinelEngine,
  DEFAULT_SENTINEL_CONFIG,
} from './SentinelEngine';

export type {
  SentinelConfig,
  SentinelState,
  SentinelMetrics,
  SentinelEvent,
  EnvironmentAttestation,
  AttestationCheck,
} from './SentinelEngine';
