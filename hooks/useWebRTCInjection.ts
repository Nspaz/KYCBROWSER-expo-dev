/**
 * React Native Hook for WebRTC Video Injection
 * 
 * Manages WebRTC connection between React Native and WebView
 * to stream video into the WebView's getUserMedia.
 * 
 * EXPO GO COMPATIBILITY: ✅ FULLY COMPATIBLE
 * ------------------------------------------
 * This hook works in Expo Go because:
 * - Uses WebView-based injection (no native modules)
 * - WebRTC APIs run in the browser context within WebView
 * - SignalingChannel uses standard postMessage communication
 * - CanvasVideoSource runs entirely in the WebView
 * 
 * No development build required for this hook to function.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  SignalingChannel, 
  createSignalingChannel,
} from '@/utils/webrtc/WebRTCSignaling';
import {
  WebRTCBridge,
  createWebRTCBridge,
  ConnectionState,
  WebRTCBridgeConfig,
} from '@/utils/webrtc/WebRTCBridge';
import { 
  createWebRTCInjectionScript,
  WebRTCInjectionConfig,
} from '@/utils/webrtc/WebRTCInjectionScript';
import type { ConnectionStats } from '@/utils/webrtc/WebRTCSignaling';

export interface UseWebRTCInjectionConfig {
  videoConfig: {
    width: number;
    height: number;
    fps: number;
  };
  injectionConfig?: WebRTCInjectionConfig;
  debug?: boolean;
  autoConnect?: boolean;
}

export interface WebRTCInjectionState {
  connectionState: ConnectionState;
  stats: ConnectionStats | null;
  error: string | null;
  isReady: boolean;
}

export interface UseWebRTCInjectionReturn {
  // Scripts to inject
  injectionScript: string;
  
  // State
  state: WebRTCInjectionState;
  
  // Methods
  connect: () => Promise<void>;
  disconnect: () => void;
  handleWebViewMessage: (event: any) => void;
  
  /** Set the WebView ref so the bridge can send messages back */
  setWebViewRef: (ref: any) => void;
  
  // Refs (for advanced usage)
  bridgeRef: React.MutableRefObject<WebRTCBridge | null>;
  signalingRef: React.MutableRefObject<SignalingChannel | null>;
}

/**
 * Hook for WebRTC video injection into WebView
 */
export function useWebRTCInjection(
  config: UseWebRTCInjectionConfig
): UseWebRTCInjectionReturn {
  const {
    videoConfig,
    injectionConfig = {},
    debug = false,
    autoConnect = true,
  } = config;

  // Refs
  const bridgeRef = useRef<WebRTCBridge | null>(null);
  const signalingRef = useRef<SignalingChannel | null>(null);
  const webViewRef = useRef<any>(null);

  // State
  const [state, setState] = useState<WebRTCInjectionState>({
    connectionState: 'disconnected',
    stats: null,
    error: null,
    isReady: false,
  });

  // Generate injection script
  const injectionScript = createWebRTCInjectionScript({
    ...injectionConfig,
    debug,
  });

  /**
   * Initialize signaling channel and bridge
   */
  const initialize = useCallback(() => {
    if (signalingRef.current || bridgeRef.current) {
      return; // Already initialized
    }

    // Create signaling channel
    signalingRef.current = createSignalingChannel(debug);

    // Create bridge configuration
    const bridgeConfig: WebRTCBridgeConfig = {
      videoConfig,
      debug,
      useCanvas: true, // Use canvas for now
    };

    // Create bridge
    bridgeRef.current = createWebRTCBridge(bridgeConfig, signalingRef.current);

    // Setup state callbacks
    bridgeRef.current.setStateChangeCallback((connectionState) => {
      setState(prev => ({
        ...prev,
        connectionState,
        isReady: connectionState === 'connected',
      }));
    });

    bridgeRef.current.setStatsCallback((stats) => {
      setState(prev => ({
        ...prev,
        stats,
      }));
    });

    if (debug) {
      console.log('[useWebRTCInjection] Initialized');
    }
  }, [videoConfig, debug]);

  /**
   * Connect to WebView
   */
  const connect = useCallback(async () => {
    try {
      if (!bridgeRef.current || !signalingRef.current) {
        initialize();
      }

      if (!bridgeRef.current || !signalingRef.current) {
        throw new Error('Failed to initialize bridge');
      }

      setState(prev => ({ ...prev, error: null }));

      // Initialize bridge
      await bridgeRef.current.initialize();

      // Mark signaling as ready
      signalingRef.current.setReady();

      // Create and send offer
      await bridgeRef.current.createOffer();

      if (debug) {
        console.log('[useWebRTCInjection] Connected');
      }
    } catch (error: any) {
      console.error('[useWebRTCInjection] Connection error:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Connection failed',
      }));
    }
  }, [initialize, debug]);

  /**
   * Disconnect
   */
  const disconnect = useCallback(() => {
    if (bridgeRef.current) {
      bridgeRef.current.close();
      bridgeRef.current = null;
    }

    if (signalingRef.current) {
      signalingRef.current.clear();
      signalingRef.current = null;
    }

    setState({
      connectionState: 'disconnected',
      stats: null,
      error: null,
      isReady: false,
    });

    if (debug) {
      console.log('[useWebRTCInjection] Disconnected');
    }
  }, [debug]);

  /**
   * Handle messages from WebView
   */
  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      // Check if it's a WebRTC message
      if (!data.webrtc || !data.message) {
        return; // Not a WebRTC message
      }

      const message = data.message;

      if (debug) {
        console.log('[useWebRTCInjection] Received from WebView:', message.type);
      }

      // Pass to signaling channel
      if (signalingRef.current) {
        signalingRef.current.receive(message);
      }

    } catch (error) {
      console.error('[useWebRTCInjection] Failed to handle message:', error);
    }
  }, [debug]);

  /**
   * Set WebView reference for sending messages back to the injection script
   */
  const setWebViewRef = useCallback((ref: any) => {
    webViewRef.current = ref;
  }, []);

  /**
   * Setup message sender for bridge - sends signaling messages to WebView via injectJavaScript
   */
  useEffect(() => {
    // Instead of relying on window global, provide a function that
    // uses the WebView ref to inject signaling messages
    const sendMessage = (message: any) => {
      const webView = webViewRef.current;
      if (webView && webView.injectJavaScript) {
        const serialized = JSON.stringify(message);
        // Double-stringify to safely embed JSON as a string literal in JS
        const escaped = JSON.stringify(serialized);
        webView.injectJavaScript(`
          (function() {
            try {
              if (window.__webrtcHandleMessage) {
                window.__webrtcHandleMessage(JSON.parse(${escaped}));
              }
            } catch(e) { console.error('[WebRTCBridge] Message handling error:', e); }
          })();
          true;
        `);
      } else if (typeof window !== 'undefined') {
        // Fallback for web context
        if ((window as any).__webrtcHandleMessage) {
          (window as any).__webrtcHandleMessage(message);
        }
      }
    };

    if (typeof window !== 'undefined') {
      (window as any).__webrtcBridgeSendMessage = sendMessage;
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__webrtcBridgeSendMessage;
      }
    };
  }, []);

  /**
   * Auto-connect on mount
   */
  useEffect(() => {
    if (autoConnect) {
      // Small delay to ensure WebView is ready
      const timer = setTimeout(() => {
        connect();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [autoConnect, connect]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    injectionScript,
    state,
    connect,
    disconnect,
    handleWebViewMessage,
    setWebViewRef,
    bridgeRef,
    signalingRef,
  };
}
