/**
 * Tests for WebRTC and Virtual Camera system improvements
 *
 * Validates:
 * 1. WebRTC injection script structure and correctness
 * 2. WebRTC signaling channel message handling
 * 3. Virtual Camera WebView Bridge configuration
 * 4. useWebRTCInjection hook interface
 * 5. Connection state management
 */

import {
  createWebRTCInjectionScript,
} from '@/utils/webrtc/WebRTCInjectionScript';

import {
  SignalingChannel,
  createSignalingChannel,
  createSignalingMessage,
  parseSignalingMessage,
  generateMessageId,
  DEFAULT_WEBRTC_CONFIG,
} from '@/utils/webrtc/WebRTCSignaling';

import {
  VirtualCameraWebViewBridge,
  createVirtualCameraReceiverScript,
} from '@/utils/virtualCameraWebViewBridge';

describe('WebRTC Injection Script', () => {
  describe('createWebRTCInjectionScript', () => {
    it('should produce valid JavaScript', () => {
      const script = createWebRTCInjectionScript();
      // Validate syntax by constructing a Function
      expect(() => new Function(script)).not.toThrow();
    });

    it('should include the IIFE wrapper', () => {
      const script = createWebRTCInjectionScript();
      expect(script).toContain('(function()');
      expect(script).toContain("'use strict'");
    });

    it('should include initialization guard', () => {
      const script = createWebRTCInjectionScript();
      expect(script).toContain('__webrtcInjectionActive');
    });

    it('should include getUserMedia override', () => {
      const script = createWebRTCInjectionScript();
      expect(script).toContain('navigator.mediaDevices.getUserMedia');
    });

    it('should include enumerateDevices override', () => {
      const script = createWebRTCInjectionScript();
      expect(script).toContain('navigator.mediaDevices.enumerateDevices');
    });

    it('should include connection retry logic', () => {
      const script = createWebRTCInjectionScript();
      expect(script).toContain('MAX_RECONNECT_ATTEMPTS');
      expect(script).toContain('handleConnectionFailure');
      expect(script).toContain('reconnectAttempts');
    });

    it('should include pending getUserMedia queue', () => {
      const script = createWebRTCInjectionScript();
      expect(script).toContain('pendingGetUserMedia');
      expect(script).toContain('resolvePendingGetUserMedia');
      expect(script).toContain('rejectPendingGetUserMedia');
    });

    it('should include stream cloning', () => {
      const script = createWebRTCInjectionScript();
      expect(script).toContain('cloneStream');
    });

    it('should allow configuring reconnect parameters', () => {
      const script = createWebRTCInjectionScript({
        maxReconnectAttempts: 5,
        reconnectDelayMs: 3000,
      });
      expect(script).toContain('MAX_RECONNECT_ATTEMPTS = 5');
      expect(script).toContain('RECONNECT_DELAY_MS = 3000');
    });

    it('should include timeout cleanup in pending getUserMedia', () => {
      const script = createWebRTCInjectionScript();
      expect(script).toContain('timeoutId');
      expect(script).toContain('clearTimeout');
    });

    it('should include ICE restart support', () => {
      const script = createWebRTCInjectionScript();
      expect(script).toContain('restartIce');
    });

    it('should include permissions API override', () => {
      const script = createWebRTCInjectionScript();
      expect(script).toContain('navigator.permissions.query');
      expect(script).toContain("'granted'");
    });

    it('should include track metadata spoofing', () => {
      const script = createWebRTCInjectionScript();
      expect(script).toContain('spoofTrack');
      expect(script).toContain('getSettings');
      expect(script).toContain('getCapabilities');
      expect(script).toContain('getConstraints');
      expect(script).toContain('applyConstraints');
    });

    it('should embed custom device label and ID', () => {
      const script = createWebRTCInjectionScript({
        deviceLabel: 'Test Camera HD',
        deviceId: 'test-cam-42',
      });
      expect(script).toContain('Test Camera HD');
      expect(script).toContain('test-cam-42');
    });

    it('should respect debug flag', () => {
      const debugScript = createWebRTCInjectionScript({ debug: true });
      const silentScript = createWebRTCInjectionScript({ debug: false });
      expect(debugScript).toContain('DEBUG = true');
      expect(silentScript).toContain('DEBUG = false');
    });

    it('should respect stealth flag', () => {
      const stealthScript = createWebRTCInjectionScript({ stealthMode: true });
      const openScript = createWebRTCInjectionScript({ stealthMode: false });
      expect(stealthScript).toContain('STEALTH = true');
      expect(openScript).toContain('STEALTH = false');
    });

    it('should use postMessage for signaling', () => {
      const script = createWebRTCInjectionScript();
      expect(script).toContain('ReactNativeWebView');
      expect(script).toContain('postMessage');
      expect(script).toContain("webrtc: true");
    });

    it('should expose __webrtcHandleMessage for React Native', () => {
      const script = createWebRTCInjectionScript();
      expect(script).toContain('window.__webrtcHandleMessage = handleMessage');
    });

    it('should handle offer, ice-candidate, connection-state, and stats messages', () => {
      const script = createWebRTCInjectionScript();
      expect(script).toContain("case 'offer':");
      expect(script).toContain("case 'ice-candidate':");
      expect(script).toContain("case 'connection-state':");
      expect(script).toContain("case 'stats':");
    });

    it('should use unified-plan SDP semantics', () => {
      const script = createWebRTCInjectionScript();
      expect(script).toContain('unified-plan');
    });
  });
});

describe('WebRTC Signaling', () => {
  describe('SignalingChannel', () => {
    let channel: SignalingChannel;

    beforeEach(() => {
      channel = createSignalingChannel(false);
    });

    it('should queue messages when not ready', () => {
      const handler = jest.fn();
      channel.on('offer', handler);

      const message = createSignalingMessage('offer', { sdp: 'test' });
      channel.receive(message);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should process messages when ready', () => {
      const handler = jest.fn();
      channel.on('offer', handler);

      channel.setReady();

      const message = createSignalingMessage('offer', { sdp: 'test' });
      channel.receive(message);

      expect(handler).toHaveBeenCalledWith({ sdp: 'test' });
    });

    it('should process queued messages when setReady is called', () => {
      const handler = jest.fn();
      channel.on('answer', handler);

      const message1 = createSignalingMessage('answer', { sdp: 'a' });
      const message2 = createSignalingMessage('answer', { sdp: 'b' });
      channel.receive(message1);
      channel.receive(message2);

      expect(handler).not.toHaveBeenCalled();

      channel.setReady();
      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenCalledWith({ sdp: 'a' });
      expect(handler).toHaveBeenCalledWith({ sdp: 'b' });
    });

    it('should support multiple handlers for same type', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      channel.on('ice-candidate', handler1);
      channel.on('ice-candidate', handler2);
      channel.setReady();

      const message = createSignalingMessage('ice-candidate', { candidate: 'c' });
      channel.receive(message);

      expect(handler1).toHaveBeenCalledWith({ candidate: 'c' });
      expect(handler2).toHaveBeenCalledWith({ candidate: 'c' });
    });

    it('should allow unregistering handlers', () => {
      const handler = jest.fn();
      channel.on('stats', handler);
      channel.off('stats', handler);
      channel.setReady();

      const message = createSignalingMessage('stats', {});
      channel.receive(message);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should clear all handlers and queue on clear()', () => {
      const handler = jest.fn();
      channel.on('offer', handler);
      channel.setReady();
      channel.clear();

      const message = createSignalingMessage('offer', { sdp: 'test' });
      channel.receive(message);

      expect(handler).not.toHaveBeenCalled();
      expect(channel.isChannelReady()).toBe(false);
    });

    it('should not throw if handler errors', () => {
      channel.on('error', () => { throw new Error('handler error'); });
      channel.setReady();

      const message = createSignalingMessage('error', { msg: 'fail' });
      expect(() => channel.receive(message)).not.toThrow();
    });
  });

  describe('createSignalingMessage', () => {
    it('should create a message with correct structure', () => {
      const msg = createSignalingMessage('offer', { sdp: 'v=0...' });
      expect(msg.type).toBe('offer');
      expect(msg.payload).toEqual({ sdp: 'v=0...' });
      expect(msg.timestamp).toBeDefined();
      expect(msg.id).toMatch(/^msg_/);
    });
  });

  describe('parseSignalingMessage', () => {
    it('should parse valid JSON message', () => {
      const original = createSignalingMessage('answer', { sdp: 'test' });
      const json = JSON.stringify(original);
      const parsed = parseSignalingMessage(json);
      expect(parsed).not.toBeNull();
      expect(parsed!.type).toBe('answer');
    });

    it('should return null for invalid JSON', () => {
      expect(parseSignalingMessage('not json')).toBeNull();
    });

    it('should return null for missing required fields', () => {
      expect(parseSignalingMessage(JSON.stringify({ type: 'offer' }))).toBeNull();
    });
  });

  describe('generateMessageId', () => {
    it('should return unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateMessageId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('DEFAULT_WEBRTC_CONFIG', () => {
    it('should include STUN servers', () => {
      expect(DEFAULT_WEBRTC_CONFIG.iceServers).toBeDefined();
      expect(DEFAULT_WEBRTC_CONFIG.iceServers.length).toBeGreaterThan(0);
      expect(DEFAULT_WEBRTC_CONFIG.iceServers[0].urls).toContain('stun:');
    });

    it('should use iceTransportPolicy all', () => {
      expect(DEFAULT_WEBRTC_CONFIG.iceTransportPolicy).toBe('all');
    });
  });
});

describe('VirtualCameraWebViewBridge', () => {
  describe('constructor', () => {
    it('should create bridge with default config', () => {
      const bridge = new VirtualCameraWebViewBridge();
      const state = bridge.getState();
      expect(state.isRunning).toBe(false);
      expect(state.framesDelivered).toBe(0);
      expect(state.frameErrors).toBe(0);
      expect(state.currentFps).toBe(0);
      expect(state.lastError).toBeNull();
    });

    it('should accept custom config', () => {
      const bridge = new VirtualCameraWebViewBridge({
        fps: 24,
        width: 1920,
        height: 1080,
        debug: true,
      });
      expect(bridge.getState().isRunning).toBe(false);
    });
  });

  describe('state management', () => {
    it('should notify on state changes', () => {
      const bridge = new VirtualCameraWebViewBridge();
      const callback = jest.fn();
      bridge.onStateUpdate(callback);

      // stop() updates state even if not running
      bridge.stop();
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        isRunning: false,
      }));
    });
  });
});

describe('VirtualCameraReceiverScript', () => {
  describe('createVirtualCameraReceiverScript', () => {
    it('should produce valid JavaScript', () => {
      const script = createVirtualCameraReceiverScript({
        width: 640,
        height: 480,
        fps: 15,
      });
      expect(() => new Function(script)).not.toThrow();
    });

    it('should include initialization guard', () => {
      const script = createVirtualCameraReceiverScript({
        width: 640,
        height: 480,
        fps: 15,
      });
      expect(script).toContain('__virtualCameraReceiverActive');
    });

    it('should override getUserMedia', () => {
      const script = createVirtualCameraReceiverScript({
        width: 640,
        height: 480,
        fps: 15,
      });
      expect(script).toContain('navigator.mediaDevices.getUserMedia');
    });

    it('should override enumerateDevices', () => {
      const script = createVirtualCameraReceiverScript({
        width: 640,
        height: 480,
        fps: 15,
      });
      expect(script).toContain('navigator.mediaDevices.enumerateDevices');
    });

    it('should handle __wsBridgeReceiveFrame messages', () => {
      const script = createVirtualCameraReceiverScript({
        width: 640,
        height: 480,
        fps: 15,
      });
      expect(script).toContain('__wsBridgeReceiveFrame');
      expect(script).toContain("'data:image/jpeg;base64,'");
    });

    it('should embed custom device label', () => {
      const script = createVirtualCameraReceiverScript({
        width: 640,
        height: 480,
        fps: 15,
        deviceLabel: 'My Custom Camera',
        deviceId: 'custom-cam-1',
      });
      expect(script).toContain('My Custom Camera');
      expect(script).toContain('custom-cam-1');
    });

    it('should include initial green frame for canvas', () => {
      const script = createVirtualCameraReceiverScript({
        width: 640,
        height: 480,
        fps: 15,
      });
      expect(script).toContain('#00cc00');
    });
  });
});
