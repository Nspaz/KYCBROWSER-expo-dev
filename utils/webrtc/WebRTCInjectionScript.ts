/**
 * WebRTC Injection Script for WebView
 * 
 * This script runs in the WebView and:
 * 1. Receives WebRTC connection from React Native side
 * 2. Replaces getUserMedia with the received stream
 * 3. Handles signaling via window.ReactNativeWebView.postMessage
 */

export interface WebRTCInjectionConfig {
  debug?: boolean;
  stealthMode?: boolean;
  deviceLabel?: string;
  deviceId?: string;
  /** Maximum number of reconnection attempts (default: 3) */
  maxReconnectAttempts?: number;
  /** Delay between reconnection attempts in ms (default: 2000) */
  reconnectDelayMs?: number;
}

/**
 * Create WebRTC injection script for WebView
 */
export function createWebRTCInjectionScript(config: WebRTCInjectionConfig = {}): string {
  const {
    debug = true,
    stealthMode = true,
    deviceLabel = 'WebRTC Camera',
    deviceId = 'webrtc-camera-001',
    maxReconnectAttempts = 3,
    reconnectDelayMs = 2000,
  } = config;

  return `
(function() {
  'use strict';
  
  // ============================================================================
  // WEBRTC INJECTION SYSTEM
  // ============================================================================
  
  if (window.__webrtcInjectionActive) {
    console.log('[WebRTCInject] Already initialized');
    return;
  }
  window.__webrtcInjectionActive = true;
  
  var DEBUG = ${debug};
  var STEALTH = ${stealthMode};
  var DEVICE_LABEL = ${JSON.stringify(deviceLabel)};
  var DEVICE_ID = ${JSON.stringify(deviceId)};
  var MAX_RECONNECT_ATTEMPTS = ${maxReconnectAttempts};
  var RECONNECT_DELAY_MS = ${reconnectDelayMs};
  
  var log = DEBUG ? function() { console.log.apply(console, ['[WebRTCInject]'].concat(Array.prototype.slice.call(arguments))); } : function() {};
  var errorLog = function() { console.error.apply(console, ['[WebRTCInject]'].concat(Array.prototype.slice.call(arguments))); };
  
  log('========================================');
  log('WEBRTC INJECTION - INITIALIZING');
  log('Debug:', DEBUG);
  log('Stealth:', STEALTH);
  log('========================================');
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  var State = {
    pc: null,
    stream: null,
    ready: false,
    connecting: false,
    iceCandidates: [],
    reconnectAttempts: 0,
    pendingGetUserMedia: [],
  };
  
  // ============================================================================
  // SIGNALING
  // ============================================================================
  
  function sendMessage(type, payload) {
    var message = {
      type: type,
      payload: payload,
      timestamp: Date.now(),
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    };
    
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        webrtc: true,
        message: message,
      }));
      log('Sent message:', type);
    } else {
      errorLog('ReactNativeWebView not available');
    }
  }
  
  function handleMessage(message) {
    log('Received message:', message.type);
    
    switch (message.type) {
      case 'offer':
        handleOffer(message.payload);
        break;
      case 'ice-candidate':
        handleIceCandidate(message.payload);
        break;
      case 'connection-state':
        handleConnectionState(message.payload);
        break;
      case 'stats':
        handleStats(message.payload);
        break;
      default:
        log('Unknown message type:', message.type);
    }
  }
  
  // Expose message handler for React Native
  window.__webrtcHandleMessage = handleMessage;
  
  // ============================================================================
  // WEBRTC CONNECTION
  // ============================================================================
  
  function initializePeerConnection() {
    if (State.pc) {
      log('Closing existing peer connection for re-init');
      try { State.pc.close(); } catch(e) {}
      State.pc = null;
    }
    
    log('Creating peer connection...');
    
    var config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
      // Enable unified plan for better track management
      sdpSemantics: 'unified-plan',
    };
    
    State.pc = new RTCPeerConnection(config);
    
    // Setup event handlers
    State.pc.onicecandidate = function(event) {
      if (event.candidate) {
        log('ICE candidate:', event.candidate.candidate);
        sendMessage('ice-candidate', {
          candidate: event.candidate.toJSON(),
        });
      }
    };
    
    State.pc.ontrack = function(event) {
      log('Received track:', event.track.kind, event.track.label);
      
      if (event.streams && event.streams[0]) {
        State.stream = event.streams[0];
        log('Stream received:', State.stream.id, 'tracks:', State.stream.getTracks().length);
        
        // Mark as ready
        State.ready = true;
        State.connecting = false;
        State.reconnectAttempts = 0;
        sendMessage('ready', { streamId: State.stream.id });
        
        // Spoof track metadata
        spoofStreamMetadata(State.stream);
        
        // Resolve any pending getUserMedia calls
        resolvePendingGetUserMedia();
      }
    };
    
    State.pc.onconnectionstatechange = function() {
      if (!State.pc) return;
      log('Connection state:', State.pc.connectionState);
      
      if (State.pc.connectionState === 'failed' || State.pc.connectionState === 'disconnected') {
        handleConnectionFailure();
      }
    };
    
    State.pc.oniceconnectionstatechange = function() {
      if (!State.pc) return;
      log('ICE connection state:', State.pc.iceConnectionState);
      
      if (State.pc.iceConnectionState === 'failed') {
        // Try ICE restart
        if (State.pc.restartIce) {
          log('Attempting ICE restart...');
          try { State.pc.restartIce(); } catch(e) { log('ICE restart failed:', e); }
        }
      }
    };
    
    log('Peer connection created');
    return Promise.resolve();
  }
  
  function handleConnectionFailure() {
    if (State.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      State.reconnectAttempts++;
      log('Connection failed, attempting reconnect', State.reconnectAttempts, '/', MAX_RECONNECT_ATTEMPTS);
      
      State.connecting = false;
      State.ready = false;
      
      setTimeout(function() {
        initializePeerConnection().then(function() {
          sendMessage('reconnect', { attempt: State.reconnectAttempts });
        });
      }, RECONNECT_DELAY_MS);
    } else {
      errorLog('Max reconnect attempts reached');
      rejectPendingGetUserMedia('WebRTC connection failed after ' + MAX_RECONNECT_ATTEMPTS + ' attempts');
    }
  }
  
  function resolvePendingGetUserMedia() {
    while (State.pendingGetUserMedia.length > 0) {
      var pending = State.pendingGetUserMedia.shift();
      if (pending && pending.resolve && State.stream) {
        // Clear the timeout for this request
        if (pending.timeoutId) clearTimeout(pending.timeoutId);
        // Clone the stream so each caller gets their own instance
        var clonedStream = cloneStream(State.stream);
        pending.resolve(clonedStream);
      }
    }
  }
  
  function rejectPendingGetUserMedia(message) {
    while (State.pendingGetUserMedia.length > 0) {
      var pending = State.pendingGetUserMedia.shift();
      if (pending && pending.reject) {
        if (pending.timeoutId) clearTimeout(pending.timeoutId);
        pending.reject(new DOMException(message, 'NotReadableError'));
      }
    }
  }
  
  function cloneStream(original) {
    try {
      var cloned = original.clone();
      spoofStreamMetadata(cloned);
      return cloned;
    } catch (e) {
      log('Clone failed, returning original:', e);
      return original;
    }
  }
  
  function handleOffer(payload) {
    log('Handling offer...');
    
    if (!State.pc) {
      initializePeerConnection();
    }
    
    if (State.connecting) {
      log('Already connecting, ignoring duplicate offer');
      return;
    }
    
    State.connecting = true;
    
    var pc = State.pc;
    
    var offer = new RTCSessionDescription({
      type: payload.type,
      sdp: payload.sdp,
    });
    
    pc.setRemoteDescription(offer).then(function() {
      log('Remote description set');
      
      // Create answer
      return pc.createAnswer();
    }).then(function(answer) {
      return pc.setLocalDescription(answer).then(function() {
        log('Answer created');
        
        // Send answer
        sendMessage('answer', {
          type: answer.type,
          sdp: answer.sdp,
        });
      });
    }).then(function() {
      // Add any queued ICE candidates
      var promises = [];
      while (State.iceCandidates.length > 0) {
        var candidate = State.iceCandidates.shift();
        promises.push(pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(function(e) {
          log('Failed to add queued ICE candidate:', e);
        }));
      }
      return Promise.all(promises);
    }).catch(function(err) {
      errorLog('Failed to handle offer:', err);
      State.connecting = false;
      sendMessage('error', { message: err.message });
    });
  }
  
  function handleIceCandidate(payload) {
    log('Handling ICE candidate...');
    
    if (!State.pc || !State.pc.remoteDescription) {
      // Queue for later
      State.iceCandidates.push(payload.candidate);
      log('Queued ICE candidate (no remote description yet)');
      return;
    }
    
    var candidate = new RTCIceCandidate(payload.candidate);
    State.pc.addIceCandidate(candidate).then(function() {
      log('ICE candidate added');
    }).catch(function(err) {
      errorLog('Failed to add ICE candidate:', err);
    });
  }
  
  function handleConnectionState(payload) {
    log('Connection state update:', payload.state);
  }
  
  function handleStats(payload) {
    if (DEBUG) {
      log('Stats:', JSON.stringify(payload).substring(0, 100));
    }
  }
  
  // ============================================================================
  // STREAM METADATA SPOOFING
  // ============================================================================
  
  function spoofStreamMetadata(stream) {
    var tracks = stream.getVideoTracks();
    for (var i = 0; i < tracks.length; i++) {
      spoofTrack(tracks[i]);
    }
  }
  
  function spoofTrack(videoTrack) {
    if (!videoTrack) return;
    
    log('Spoofing track metadata...');
    
    var trackIdValue = 'track_webrtc_' + Date.now();
    
    // Spoof track ID
    try {
      Object.defineProperty(videoTrack, 'id', {
        get: function() { return trackIdValue; },
        configurable: true,
      });
    } catch(e) {}
    
    // Spoof label
    try {
      Object.defineProperty(videoTrack, 'label', {
        get: function() { return DEVICE_LABEL; },
        configurable: true,
      });
    } catch(e) {}
    
    // Spoof readyState
    try {
      Object.defineProperty(videoTrack, 'readyState', {
        get: function() { return 'live'; },
        configurable: true,
      });
    } catch(e) {}
    
    // Spoof enabled
    try {
      Object.defineProperty(videoTrack, 'enabled', {
        get: function() { return true; },
        set: function() {},
        configurable: true,
      });
    } catch(e) {}
    
    // Spoof muted
    try {
      Object.defineProperty(videoTrack, 'muted', {
        get: function() { return false; },
        configurable: true,
      });
    } catch(e) {}
    
    // Spoof getSettings
    var originalGetSettings = videoTrack.getSettings ? videoTrack.getSettings.bind(videoTrack) : null;
    videoTrack.getSettings = function() {
      var settings = originalGetSettings ? originalGetSettings() : {};
      return {
        width: settings.width || 1080,
        height: settings.height || 1920,
        frameRate: settings.frameRate || 30,
        aspectRatio: (settings.width || 1080) / (settings.height || 1920),
        deviceId: DEVICE_ID,
        groupId: 'webrtc_group',
        facingMode: 'user',
        resizeMode: 'none',
      };
    };
    
    // Spoof getCapabilities
    videoTrack.getCapabilities = function() {
      return {
        aspectRatio: { min: 0.5, max: 2.0 },
        deviceId: DEVICE_ID,
        facingMode: ['user'],
        frameRate: { min: 1, max: 60 },
        groupId: 'webrtc_group',
        height: { min: 1, max: 4320 },
        width: { min: 1, max: 7680 },
        resizeMode: ['none', 'crop-and-scale'],
      };
    };
    
    // Spoof getConstraints
    videoTrack.getConstraints = function() {
      return {
        facingMode: 'user',
        width: { ideal: 1080 },
        height: { ideal: 1920 },
        deviceId: { exact: DEVICE_ID },
      };
    };
    
    // Spoof applyConstraints
    videoTrack.applyConstraints = function() {
      return Promise.resolve();
    };
    
    log('Track metadata spoofed');
  }
  
  // ============================================================================
  // GETUSERMEDIA OVERRIDE
  // ============================================================================
  
  var originalGetUserMedia = navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    ? navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices) : null;
  var originalEnumerateDevices = navigator.mediaDevices && navigator.mediaDevices.enumerateDevices
    ? navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices) : null;
  
  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {};
  }
  
  navigator.mediaDevices.getUserMedia = function(constraints) {
    log('getUserMedia called:', JSON.stringify(constraints));
    
    var wantsVideo = !!(constraints && constraints.video);
    
    if (!wantsVideo) {
      // Audio only - pass through
      if (originalGetUserMedia) {
        return originalGetUserMedia(constraints);
      }
      return Promise.reject(new DOMException('Audio not available', 'NotFoundError'));
    }
    
    // If stream is already ready, return a clone immediately
    if (State.ready && State.stream) {
      log('Returning cached WebRTC stream (cloned)');
      return Promise.resolve(cloneStream(State.stream));
    }
    
    // Otherwise, wait for the WebRTC stream with timeout
    log('Waiting for WebRTC stream...');
    
    return new Promise(function(resolve, reject) {
      // Queue this request
      var entry = {
        resolve: resolve,
        reject: reject,
        constraints: constraints,
        timestamp: Date.now(),
        timeoutId: null,
      };
      
      // Set timeout for this specific request
      var timeoutMs = 15000;
      entry.timeoutId = setTimeout(function() {
        // Check if still pending
        var idx = State.pendingGetUserMedia.indexOf(entry);
        if (idx >= 0) {
          State.pendingGetUserMedia.splice(idx, 1);
          errorLog('getUserMedia timed out after', timeoutMs, 'ms');
          reject(new DOMException('Could not start video source', 'NotReadableError'));
        }
      }, timeoutMs);
      
      State.pendingGetUserMedia.push(entry);
    });
  };
  
  navigator.mediaDevices.enumerateDevices = function() {
    log('enumerateDevices called');
    
    if (STEALTH) {
      return Promise.resolve([{
        deviceId: DEVICE_ID,
        groupId: 'webrtc_group',
        kind: 'videoinput',
        label: DEVICE_LABEL,
        toJSON: function() { return this; }
      }]);
    }
    
    if (originalEnumerateDevices) {
      return originalEnumerateDevices();
    }
    
    return Promise.resolve([]);
  };
  
  // Override permissions API to always grant camera permission
  try {
    if (navigator.permissions && typeof navigator.permissions.query === 'function') {
      var originalQuery = navigator.permissions.query.bind(navigator.permissions);
      navigator.permissions.query = function(desc) {
        if (desc && (desc.name === 'camera' || desc.name === 'microphone')) {
          return Promise.resolve({
            state: 'granted',
            name: desc.name,
            onchange: null,
            addEventListener: function() {},
            removeEventListener: function() {},
            dispatchEvent: function() { return true; },
          });
        }
        return originalQuery(desc);
      };
    }
  } catch(e) {}
  
  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  // Initialize peer connection
  initializePeerConnection().then(function() {
    log('WebRTC injection ready, signaling React Native...');
    sendMessage('ready', { initialized: true });
  }).catch(function(err) {
    errorLog('Initialization failed:', err);
    sendMessage('error', { message: err.message });
  });
  
  log('========================================');
  log('WEBRTC INJECTION - READY');
  log('========================================');
  
})();
true;
`;
}
