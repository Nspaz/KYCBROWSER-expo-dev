import { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { WebView } from 'react-native-webview';
import { ChevronLeft, Play, Square, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import { useDeveloperMode } from '@/contexts/DeveloperModeContext';
import TestingWatermark from '@/components/TestingWatermark';
import {
  DEEP_INJECTION_PROTOCOLS,
  type InjectionConfig,
} from '@/utils/deepInjectionProtocols';

type ProtocolStatus = 'idle' | 'testing' | 'success' | 'failed' | 'unknown';

interface ProtocolTest {
  id: string;
  name: string;
  description: string;
  status: ProtocolStatus;
  result: string;
  scriptGenerator: (config: Partial<InjectionConfig>) => string;
}

const PROTOCOLS: ProtocolTest[] = [
  {
    id: 'protocol0',
    name: 'Protocol 0: Ultra-Early Hook',
    description: 'Hooks getUserMedia before page scripts load. Best for early detection sites.',
    status: 'idle',
    result: '',
    scriptGenerator: DEEP_INJECTION_PROTOCOLS.protocol0,
  },
  {
    id: 'protocol1',
    name: 'Protocol 1: MediaStream Override',
    description: 'Intercepts MediaStream constructor. Works for sites that construct streams.',
    status: 'idle',
    result: '',
    scriptGenerator: DEEP_INJECTION_PROTOCOLS.protocol1,
  },
  {
    id: 'protocol2',
    name: 'Protocol 2: Descriptor Hook',
    description: 'Overrides property descriptors at the lowest level.',
    status: 'idle',
    result: '',
    scriptGenerator: DEEP_INJECTION_PROTOCOLS.protocol2,
  },
  {
    id: 'protocol3',
    name: 'Protocol 3: Proxy Intercept',
    description: 'Uses JavaScript Proxy to intercept all method calls.',
    status: 'idle',
    result: '',
    scriptGenerator: DEEP_INJECTION_PROTOCOLS.protocol3,
  },
];

export default function ProtocolTesterScreen() {
  const webViewRef = useRef<WebView>(null);
  const { developerMode } = useDeveloperMode();
  
  const [testUrl, setTestUrl] = useState('https://webcamtests.com/recorder');
  const [protocols, setProtocols] = useState<ProtocolTest[]>(PROTOCOLS);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [webViewKey, setWebViewKey] = useState(0);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log('[ProtocolTester]', message);
  }, []);

  const updateProtocolStatus = useCallback((protocolId: string, status: ProtocolStatus, result: string) => {
    setProtocols(prev => prev.map(p => 
      p.id === protocolId ? { ...p, status, result } : p
    ));
    addLog(`${protocolId}: ${status.toUpperCase()} - ${result}`);
  }, [addLog]);

  const resetProtocols = useCallback(() => {
    setProtocols(PROTOCOLS.map(p => ({ ...p, status: 'idle', result: '' })));
    setCurrentTest(null);
    setTestLogs([]);
    addLog('All protocols reset');
  }, [addLog]);

  const reloadWebView = useCallback(() => {
    setWebViewKey(prev => prev + 1);
    resetProtocols();
    addLog('WebView reloaded');
  }, [resetProtocols, addLog]);

  const testProtocol = useCallback(async (protocolId: string) => {
    const protocol = protocols.find(p => p.id === protocolId);
    if (!protocol) return;

    addLog(`Starting test for ${protocol.name}`);
    setCurrentTest(protocolId);
    updateProtocolStatus(protocolId, 'testing', 'Initializing test...');

    try {
      // Reload page to get clean state
      reloadWebView();
      
      // Wait for page load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Inject protocol
      const injectionConfig: Partial<InjectionConfig> = {
        width: 1080,
        height: 1920,
        fps: 30,
        deviceLabel: `${protocol.name} Test Camera`,
        deviceId: `test-${protocolId}`,
        showDebugOverlay: true,
        useTestPattern: true,
      };
      
      const script = protocol.scriptGenerator(injectionConfig);
      
      if (webViewRef.current) {
        addLog(`Injecting ${protocol.name}...`);
        webViewRef.current.injectJavaScript(script);
        
        // Wait for injection to settle
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Test getUserMedia
        const testScript = `
(function() {
  const startTime = Date.now();
  
  console.log('[Test] Attempting getUserMedia...');
  
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(function(stream) {
      console.log('[Test] ✓ getUserMedia succeeded');
      
      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      
      const result = {
        success: true,
        duration: Date.now() - startTime,
        tracks: stream.getTracks().length,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
        resolution: settings.width + 'x' + settings.height,
        fps: settings.frameRate || 'unknown',
        label: videoTrack.label,
        deviceId: settings.deviceId,
        facingMode: settings.facingMode,
      };
      
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'testResult',
        protocolId: '${protocolId}',
        result: result
      }));
      
      // Keep stream for 2 seconds for visual verification
      setTimeout(function() {
        stream.getTracks().forEach(function(track) { track.stop(); });
      }, 2000);
      
    })
    .catch(function(error) {
      console.error('[Test] ✗ getUserMedia failed:', error);
      
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'testResult',
        protocolId: '${protocolId}',
        result: {
          success: false,
          error: error.name + ': ' + error.message,
          duration: Date.now() - startTime
        }
      }));
    });
})();
true;
        `;
        
        webViewRef.current.injectJavaScript(testScript);
        addLog(`Test script executed for ${protocol.name}`);
        
        // Set timeout for test
        setTimeout(() => {
          if (protocols.find(p => p.id === protocolId)?.status === 'testing') {
            updateProtocolStatus(
              protocolId,
              'unknown',
              'Test timed out after 10 seconds. Check console logs.'
            );
            setCurrentTest(null);
          }
        }, 10000);
        
      } else {
        throw new Error('WebView reference not available');
      }
      
    } catch (error: any) {
      addLog(`Error testing ${protocol.name}: ${error.message}`);
      updateProtocolStatus(protocolId, 'failed', `Error: ${error.message}`);
      setCurrentTest(null);
    }
  }, [protocols, webViewRef, addLog, updateProtocolStatus, reloadWebView]);

  const testAllProtocols = useCallback(async () => {
    addLog('Starting sequential test of all protocols...');
    
    for (const protocol of PROTOCOLS) {
      await testProtocol(protocol.id);
      // Wait between tests
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    addLog('All protocol tests completed');
    
    // Show summary
    const results = protocols.map(p => ({
      name: p.name,
      status: p.status
    }));
    
    const passed = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'failed').length;
    
    Alert.alert(
      'Test Results',
      `Passed: ${passed}\nFailed: ${failed}\n\nCheck the results below for details.`,
      [{ text: 'OK' }]
    );
  }, [testProtocol, protocols, addLog]);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'testResult') {
        const { protocolId, result } = data;
        
        if (result.success) {
          const resultText = `✓ SUCCESS\nResolution: ${result.resolution}\nFPS: ${result.fps}\nLabel: ${result.label}\nTracks: ${result.videoTracks} video, ${result.audioTracks} audio\nDuration: ${result.duration}ms`;
          updateProtocolStatus(protocolId, 'success', resultText);
        } else {
          const resultText = `✗ FAILED\n${result.error}\nDuration: ${result.duration}ms`;
          updateProtocolStatus(protocolId, 'failed', resultText);
        }
        
        setCurrentTest(null);
      } else if (data.type === 'protocol0Ready' || data.type === 'protocol1Ready' || data.type === 'protocol2Ready' || data.type === 'protocol3Ready') {
        addLog(`${data.type}: Protocol initialized successfully`);
      }
    } catch (error: any) {
      console.log('[ProtocolTester] WebView message:', event.nativeEvent.data);
    }
  }, [updateProtocolStatus, addLog]);

  const getStatusIcon = (status: ProtocolStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} color="#00ff88" />;
      case 'failed':
        return <XCircle size={20} color="#ff4444" />;
      case 'testing':
        return <AlertCircle size={20} color="#ffaa00" />;
      default:
        return <AlertCircle size={20} color="#666" />;
    }
  };

  const getStatusColor = (status: ProtocolStatus) => {
    switch (status) {
      case 'success': return '#00ff88';
      case 'failed': return '#ff4444';
      case 'testing': return '#ffaa00';
      case 'unknown': return '#888';
      default: return '#666';
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.unavailableText}>
          Protocol Tester is only available on iOS and Android.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TestingWatermark 
        visible={developerMode.showWatermark}
        position="top-right"
        variant="minimal"
      />
      
      <Stack.Screen
        options={{
          title: 'Protocol Tester',
          headerStyle: { backgroundColor: '#0a0a0a' },
          headerTintColor: '#ffffff',
          headerLeft: () => (
            <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
              <ChevronLeft size={24} color="#00ff88" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* URL Input */}
        <View style={styles.urlCard}>
          <Text style={styles.urlLabel}>Test URL:</Text>
          <TextInput
            style={styles.urlInput}
            value={testUrl}
            onChangeText={setTestUrl}
            placeholder="https://webcamtests.com/recorder"
            placeholderTextColor="#666"
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.reloadButton} onPress={reloadWebView}>
            <RefreshCw size={16} color="#fff" />
            <Text style={styles.reloadButtonText}>Reload</Text>
          </TouchableOpacity>
        </View>

        {/* WebView */}
        <View style={styles.webViewCard}>
          <Text style={styles.webViewLabel}>Website Preview:</Text>
          <WebView
            key={webViewKey}
            ref={webViewRef}
            source={{ uri: testUrl }}
            style={styles.webView}
            onMessage={handleWebViewMessage}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              addLog(`WebView error: ${nativeEvent.description}`);
            }}
            onLoadEnd={() => {
              addLog('WebView loaded successfully');
            }}
          />
        </View>

        {/* Controls */}
        <View style={styles.controlsCard}>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={testAllProtocols}
            disabled={!!currentTest}
          >
            <Play size={16} color="#000" />
            <Text style={styles.buttonText}>Test All Protocols</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={resetProtocols}
            disabled={!!currentTest}
          >
            <Square size={16} color="#fff" />
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Reset All</Text>
          </TouchableOpacity>
        </View>

        {/* Protocol Results */}
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>Protocol Test Results:</Text>
          
          {protocols.map((protocol) => (
            <View
              key={protocol.id}
              style={[
                styles.protocolCard,
                { borderColor: getStatusColor(protocol.status) }
              ]}
            >
              <View style={styles.protocolHeader}>
                <View style={styles.protocolHeaderLeft}>
                  {getStatusIcon(protocol.status)}
                  <View style={styles.protocolInfo}>
                    <Text style={styles.protocolName}>{protocol.name}</Text>
                    <Text style={styles.protocolDesc}>{protocol.description}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.testButton,
                    currentTest === protocol.id && styles.testButtonActive
                  ]}
                  onPress={() => testProtocol(protocol.id)}
                  disabled={!!currentTest}
                >
                  <Text style={styles.testButtonText}>Test</Text>
                </TouchableOpacity>
              </View>
              
              {protocol.result && (
                <View style={styles.protocolResult}>
                  <Text style={styles.protocolResultText}>{protocol.result}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Logs */}
        <View style={styles.logsSection}>
          <Text style={styles.sectionTitle}>Test Logs:</Text>
          <ScrollView style={styles.logsScroll} nestedScrollEnabled>
            {testLogs.length === 0 ? (
              <Text style={styles.logsEmpty}>No logs yet. Run tests to see output.</Text>
            ) : (
              testLogs.map((log, index) => (
                <Text key={index} style={styles.logEntry}>{log}</Text>
              ))
            )}
          </ScrollView>
        </View>

        {/* Summary */}
        {protocols.some(p => p.status !== 'idle') && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>📊 Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tested:</Text>
              <Text style={styles.summaryValue}>
                {protocols.filter(p => p.status !== 'idle').length} / {protocols.length}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: '#00ff88' }]}>Passed:</Text>
              <Text style={[styles.summaryValue, { color: '#00ff88' }]}>
                {protocols.filter(p => p.status === 'success').length}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: '#ff4444' }]}>Failed:</Text>
              <Text style={[styles.summaryValue, { color: '#ff4444' }]}>
                {protocols.filter(p => p.status === 'failed').length}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  unavailableText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
    paddingHorizontal: 32,
  },
  urlCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  urlLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  urlInput: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: '#fff',
    fontSize: 13,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00ff88',
    padding: 10,
    borderRadius: 8,
  },
  reloadButtonText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '600',
  },
  webViewCard: {
    marginBottom: 12,
  },
  webViewLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  webView: {
    height: 300,
    borderRadius: 12,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  controlsCard: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 10,
  },
  buttonPrimary: {
    backgroundColor: '#00ff88',
  },
  buttonSecondary: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  buttonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#fff',
  },
  resultsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  protocolCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
  },
  protocolHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  protocolHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  protocolInfo: {
    flex: 1,
  },
  protocolName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  protocolDesc: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    lineHeight: 16,
  },
  testButton: {
    backgroundColor: '#00ff88',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  testButtonActive: {
    backgroundColor: '#ffaa00',
  },
  testButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },
  protocolResult: {
    marginTop: 12,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
  },
  protocolResultText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 16,
  },
  logsSection: {
    marginBottom: 16,
  },
  logsScroll: {
    maxHeight: 200,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  logsEmpty: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontStyle: 'italic',
  },
  logEntry: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
  summaryCard: {
    backgroundColor: 'rgba(0,255,136,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.3)',
  },
  summaryTitle: {
    color: '#00ff88',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
