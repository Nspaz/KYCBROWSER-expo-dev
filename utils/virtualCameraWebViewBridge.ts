/**
 * Virtual Camera → WebView Bridge
 *
 * Bridges the native VirtualCamera module output (base64 JPEG frames)
 * to the WebView injection system. On Android this pulls frames from
 * the VirtualCameraModule.getCurrentFrame() API and pushes them into
 * the WebView canvas via injectJavaScript.
 *
 * Architecture:
 * ┌───────────────────┐     base64      ┌──────────────────────┐
 * │ VirtualCamera      │ ──────────────► │  WebView Canvas      │
 * │ (native Kotlin)    │  injectJS      │  (injection script)   │
 * │ getCurrentFrame()  │                │  → getUserMedia()     │
 * └───────────────────┘                └──────────────────────┘
 *
 * This bridge runs on the React Native side, polling the native module
 * for frames and delivering them to the WebView's injection script.
 */

import { Platform } from 'react-native';
import type { RefObject } from 'react';
import type { WebView } from 'react-native-webview';

export interface VirtualCameraWebViewBridgeConfig {
  /** Target frames per second for delivery */
  fps: number;
  /** Target resolution width */
  width: number;
  /** Target resolution height */
  height: number;
  /** Enable debug logging */
  debug: boolean;
  /** JPEG quality for frame encoding (0-100) */
  jpegQuality: number;
  /** Maximum consecutive errors before stopping */
  maxConsecutiveErrors: number;
}

export interface VirtualCameraWebViewBridgeState {
  isRunning: boolean;
  framesDelivered: number;
  frameErrors: number;
  currentFps: number;
  lastError: string | null;
}

const DEFAULT_CONFIG: VirtualCameraWebViewBridgeConfig = {
  fps: 15, // Lower default for base64 frame delivery (bandwidth-limited)
  width: 640,
  height: 480,
  debug: false,
  jpegQuality: 70,
  maxConsecutiveErrors: 10,
};

export class VirtualCameraWebViewBridge {
  private config: VirtualCameraWebViewBridgeConfig;
  private state: VirtualCameraWebViewBridgeState;
  private webViewRef: RefObject<WebView | null> | null = null;
  private virtualCameraModule: any = null;
  private frameInterval: ReturnType<typeof setInterval> | null = null;
  private consecutiveErrors: number = 0;
  private frameTimestamps: number[] = [];
  private onStateChange: ((state: VirtualCameraWebViewBridgeState) => void) | null = null;

  constructor(config: Partial<VirtualCameraWebViewBridgeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = {
      isRunning: false,
      framesDelivered: 0,
      frameErrors: 0,
      currentFps: 0,
      lastError: null,
    };
  }

  /**
   * Set the WebView reference for frame delivery
   */
  setWebViewRef(ref: RefObject<WebView | null>): void {
    this.webViewRef = ref;
  }

  /**
   * Set the native VirtualCamera module instance
   */
  setVirtualCameraModule(module: any): void {
    this.virtualCameraModule = module;
  }

  /**
   * Register state change callback
   */
  onStateUpdate(callback: (state: VirtualCameraWebViewBridgeState) => void): void {
    this.onStateChange = callback;
  }

  /**
   * Start frame delivery loop
   */
  async start(): Promise<void> {
    if (this.state.isRunning) {
      this.log('Bridge already running');
      return;
    }

    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      this.log('Virtual camera bridge only supported on native platforms');
      return;
    }

    if (!this.virtualCameraModule) {
      // Try to load the module
      try {
        const VirtualCamera = require('../modules/virtual-camera/src').default;
        if (VirtualCamera && VirtualCamera.isAvailable()) {
          this.virtualCameraModule = VirtualCamera;
        }
      } catch (e) {
        this.state.lastError = 'VirtualCamera module not available';
        this.updateState();
        return;
      }
    }

    this.log('Starting virtual camera → WebView bridge...');

    const frameTimeMs = Math.floor(1000 / this.config.fps);
    this.frameInterval = setInterval(() => {
      this.deliverFrame();
    }, frameTimeMs);

    this.state.isRunning = true;
    this.consecutiveErrors = 0;
    this.updateState();
    this.log('Bridge started at', this.config.fps, 'fps');
  }

  /**
   * Stop frame delivery
   */
  stop(): void {
    if (this.frameInterval) {
      clearInterval(this.frameInterval);
      this.frameInterval = null;
    }
    this.state.isRunning = false;
    this.updateState();
    this.log('Bridge stopped');
  }

  /**
   * Get current bridge state
   */
  getState(): VirtualCameraWebViewBridgeState {
    return { ...this.state };
  }

  /**
   * Deliver a single frame from the native module to the WebView
   */
  private async deliverFrame(): Promise<void> {
    const webView = this.webViewRef?.current;
    if (!webView || !this.virtualCameraModule) {
      return;
    }

    try {
      // Get current frame as base64 from native module
      const base64Frame = await this.virtualCameraModule.getCurrentFrame();

      if (!base64Frame) {
        // No frame available yet - not necessarily an error
        return;
      }

      // Deliver the frame to the WebView injection script
      // The injection script will draw it to the canvas
      webView.injectJavaScript(`
        (function() {
          try {
            if (window.__wsBridgeReceiveFrame) {
              window.__wsBridgeReceiveFrame({
                frame: {
                  data: ${JSON.stringify(base64Frame)},
                  width: ${this.config.width},
                  height: ${this.config.height},
                  timestamp: ${Date.now()},
                  seq: ${this.state.framesDelivered}
                }
              });
            }
          } catch(e) {}
        })();
        true;
      `);

      this.state.framesDelivered++;
      this.consecutiveErrors = 0;

      // Update FPS tracking
      const now = Date.now();
      this.frameTimestamps.push(now);
      // Keep only last second of timestamps
      const oneSecondAgo = now - 1000;
      this.frameTimestamps = this.frameTimestamps.filter(t => t > oneSecondAgo);
      this.state.currentFps = this.frameTimestamps.length;

      // Periodic state update
      if (this.state.framesDelivered % 30 === 0) {
        this.updateState();
      }
    } catch (error: any) {
      this.consecutiveErrors++;
      this.state.frameErrors++;
      this.state.lastError = error?.message || 'Frame delivery failed';

      if (this.consecutiveErrors >= this.config.maxConsecutiveErrors) {
        this.log('Too many consecutive errors, stopping bridge');
        this.stop();
      }
    }
  }

  private updateState(): void {
    if (this.onStateChange) {
      this.onStateChange({ ...this.state });
    }
  }

  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[VCWebViewBridge]', ...args);
    }
  }
}

/**
 * Create the WebView-side injection script that receives base64 frames
 * from the VirtualCameraWebViewBridge and renders them to a canvas
 * for getUserMedia consumption.
 *
 * This is a companion to the WebSocket Bridge injection script and can
 * be used alongside it - the __wsBridgeReceiveFrame handler is shared.
 */
export function createVirtualCameraReceiverScript(config: {
  width: number;
  height: number;
  fps: number;
  deviceLabel?: string;
  deviceId?: string;
  debug?: boolean;
}): string {
  const {
    width = 640,
    height = 480,
    fps = 15,
    deviceLabel = 'Virtual Camera',
    deviceId = 'virtual-camera-001',
    debug = false,
  } = config;

  return `
(function() {
  'use strict';
  
  if (window.__virtualCameraReceiverActive) return;
  window.__virtualCameraReceiverActive = true;
  
  var DEBUG = ${debug};
  var DEVICE_LABEL = ${JSON.stringify(deviceLabel)};
  var DEVICE_ID = ${JSON.stringify(deviceId)};
  var WIDTH = ${width};
  var HEIGHT = ${height};
  var FPS = ${fps};
  
  var log = DEBUG ? function() { console.log.apply(console, ['[VCReceiver]'].concat(Array.prototype.slice.call(arguments))); } : function() {};
  
  log('Initializing Virtual Camera Receiver');
  
  // Canvas for frame rendering
  var canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  canvas.style.cssText = 'position:fixed;top:-9999px;left:-9999px;';
  var ctx = canvas.getContext('2d', { alpha: false });
  var frameCount = 0;
  var stream = null;
  
  if (document.body) {
    document.body.appendChild(canvas);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      if (document.body) document.body.appendChild(canvas);
    });
  }
  
  // Handle incoming base64 frames
  var existingHandler = window.__wsBridgeReceiveFrame;
  window.__wsBridgeReceiveFrame = function(message) {
    if (existingHandler) existingHandler(message);
    if (!message || !message.frame || !message.frame.data) return;
    
    var img = new Image();
    img.onload = function() {
      if (ctx && canvas) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        frameCount++;
      }
    };
    img.src = 'data:image/jpeg;base64,' + message.frame.data;
  };
  
  function getStream() {
    if (!stream && canvas) {
      try {
        stream = canvas.captureStream(FPS);
        // Spoof track metadata
        var tracks = stream.getVideoTracks();
        for (var i = 0; i < tracks.length; i++) {
          var track = tracks[i];
          try { Object.defineProperty(track, 'label', { get: function() { return DEVICE_LABEL; }, configurable: true }); } catch(e) {}
          track.getSettings = function() {
            return { width: WIDTH, height: HEIGHT, frameRate: FPS, deviceId: DEVICE_ID, groupId: 'vc-group', facingMode: 'user', resizeMode: 'none' };
          };
          track.getCapabilities = function() {
            return { width: { min: 1, max: 7680 }, height: { min: 1, max: 4320 }, frameRate: { min: 1, max: 60 }, deviceId: DEVICE_ID, facingMode: ['user'] };
          };
        }
      } catch(e) {
        log('Failed to create stream:', e);
      }
    }
    return stream;
  }
  
  // Paint a green frame so the canvas is not blank before first frame arrives
  if (ctx) {
    ctx.fillStyle = '#00cc00';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
  
  // Start capturing immediately so stream is ready
  getStream();
  
  // Override getUserMedia
  var origGUM = navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    ? navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices) : null;
  
  if (!navigator.mediaDevices) navigator.mediaDevices = {};
  
  navigator.mediaDevices.getUserMedia = function(constraints) {
    if (constraints && constraints.video) {
      log('getUserMedia → returning virtual camera stream');
      var s = getStream();
      if (s) return Promise.resolve(s.clone ? s.clone() : s);
      return Promise.reject(new DOMException('Virtual camera not ready', 'NotReadableError'));
    }
    if (origGUM) return origGUM(constraints);
    return Promise.reject(new DOMException('getUserMedia not available', 'NotSupportedError'));
  };
  
  var origEnum = navigator.mediaDevices.enumerateDevices
    ? navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices) : null;
  
  navigator.mediaDevices.enumerateDevices = function() {
    return Promise.resolve([
      { deviceId: DEVICE_ID, groupId: 'vc-group', kind: 'videoinput', label: DEVICE_LABEL, toJSON: function() { return this; } }
    ]);
  };
  
  log('Virtual Camera Receiver ready');
})();
true;
`;
}
