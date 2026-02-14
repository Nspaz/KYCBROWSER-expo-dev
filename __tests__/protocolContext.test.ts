import { mergeProtocolsWithDefaults, isProtocolType, ProtocolType } from '@/contexts/ProtocolContext';

describe('ProtocolContext helpers', () => {
  it('enriches stored protocols with new AI variants', () => {
    const merged = mergeProtocolsWithDefaults({
      websocket: {
        id: 'websocket',
        name: 'ws',
        description: 'ws',
        enabled: false,
        settings: {},
      },
    });

    expect(merged['claude-sonnet']).toBeDefined();
    expect(merged.claude).toBeDefined();
    expect(merged.sonnet).toBeDefined();
    expect(merged.websocket.enabled).toBe(false);
  });

  it('identifies all supported protocol types', () => {
    const supported: ProtocolType[] = [
      'standard',
      'allowlist',
      'protected',
      'harness',
      'holographic',
      'websocket',
      'webrtc-loopback',
      'claude-sonnet',
      'claude',
      'sonnet',
    ];

    supported.forEach((protocol) => {
      expect(isProtocolType(protocol)).toBe(true);
    });

    expect(isProtocolType('unknown')).toBe(false);
  });
});
