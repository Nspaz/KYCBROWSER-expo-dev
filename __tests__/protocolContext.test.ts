import { mergeProtocolsWithDefaults, isProtocolType, ProtocolType } from '@/contexts/ProtocolContext';

describe('ProtocolContext helpers', () => {
  it('merges stored protocols with defaults', () => {
    const merged = mergeProtocolsWithDefaults({
      bridge: {
        id: 'bridge',
        name: 'bridge-custom',
        description: 'custom',
        enabled: false,
        settings: {},
      },
    });

    expect(merged.stealth).toBeDefined();
    expect(merged.relay).toBeDefined();
    expect(merged.shield).toBeDefined();
    expect(merged.bridge.enabled).toBe(false);
  });

  it('identifies all supported protocol types', () => {
    const supported: ProtocolType[] = [
      'stealth',
      'relay',
      'bridge',
      'shield',
    ];

    supported.forEach((protocol) => {
      expect(isProtocolType(protocol)).toBe(true);
    });

    expect(isProtocolType('unknown')).toBe(false);
    // Old protocol IDs should no longer be valid
    expect(isProtocolType('standard')).toBe(false);
    expect(isProtocolType('allowlist')).toBe(false);
    expect(isProtocolType('websocket')).toBe(false);
  });
});
