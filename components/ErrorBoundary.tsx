import React, { Component, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { exportLogsReadable } from '@/utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showStackTrace: boolean;
  copied: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showStackTrace: false,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    console.error('[ErrorBoundary] Caught error:', error.message);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Error details:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
    
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    console.log('[ErrorBoundary] Attempting retry...');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showStackTrace: false,
      copied: false,
    });
  };

  handleCopyLogs = async (): Promise<void> => {
    try {
      const { error, errorInfo } = this.state;
      
      let fullReport = exportLogsReadable();
      
      fullReport += '\n\n' + '═'.repeat(60) + '\n';
      fullReport += '🔴 CRASH ERROR DETAILS\n';
      fullReport += '═'.repeat(60) + '\n\n';
      fullReport += `Error: ${error?.message || 'Unknown'}\n`;
      fullReport += `Stack: ${error?.stack || 'No stack'}\n`;
      if (errorInfo?.componentStack) {
        fullReport += `\nComponent Stack: ${errorInfo.componentStack}\n`;
      }
      
      await Clipboard.setStringAsync(fullReport);
      this.setState({ copied: true });
      
      setTimeout(() => {
        this.setState({ copied: false });
      }, 3000);
      
      console.log('[ErrorBoundary] Logs copied to clipboard');
    } catch (e) {
      console.error('[ErrorBoundary] Failed to copy logs:', e);
    }
  };

  toggleStackTrace = (): void => {
    this.setState(prev => ({ showStackTrace: !prev.showStackTrace }));
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, showStackTrace, copied } = this.state;
    const { children, fallback, showDetails = true } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <AlertTriangle size={48} color="#ff4757" />
            </View>
            
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              {error?.message || 'An unexpected error occurred'}
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
                <RefreshCw size={18} color="#0a0a0a" />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.copyLogsButton, copied && styles.copyLogsButtonCopied]} 
                onPress={this.handleCopyLogs}
              >
                {copied ? (
                  <Check size={18} color="#00ff88" />
                ) : (
                  <Copy size={18} color="#ffffff" />
                )}
                <Text style={[styles.copyLogsButtonText, copied && styles.copyLogsButtonTextCopied]}>
                  {copied ? 'Copied!' : 'Copy All Logs'}
                </Text>
              </TouchableOpacity>
            </View>

            {showDetails && error && (
              <TouchableOpacity 
                style={styles.detailsToggle} 
                onPress={this.toggleStackTrace}
              >
                <Text style={styles.detailsToggleText}>
                  {showStackTrace ? 'Hide Details' : 'Show Details'}
                </Text>
                {showStackTrace ? (
                  <ChevronUp size={16} color="rgba(255,255,255,0.5)" />
                ) : (
                  <ChevronDown size={16} color="rgba(255,255,255,0.5)" />
                )}
              </TouchableOpacity>
            )}

            {showStackTrace && (
              <ScrollView style={styles.stackTraceContainer}>
                <Text style={styles.stackTraceTitle}>Error Stack:</Text>
                <Text style={styles.stackTraceText}>
                  {error?.stack || 'No stack trace available'}
                </Text>
                {errorInfo?.componentStack && (
                  <>
                    <Text style={styles.stackTraceTitle}>Component Stack:</Text>
                    <Text style={styles.stackTraceText}>
                      {errorInfo.componentStack}
                    </Text>
                  </>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      );
    }

    return children;
  }
}

interface ErrorDisplayProps {
  error: string | Error | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
}

export function ErrorDisplay({ error, onRetry, onDismiss, compact = false }: ErrorDisplayProps) {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;

  if (compact) {
    return (
      <View style={styles.compactError}>
        <AlertTriangle size={16} color="#ff4757" />
        <Text style={styles.compactErrorText} numberOfLines={2}>
          {errorMessage}
        </Text>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <Text style={styles.dismissButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.errorCard}>
      <View style={styles.errorCardHeader}>
        <AlertTriangle size={20} color="#ff4757" />
        <Text style={styles.errorCardTitle}>Error</Text>
      </View>
      <Text style={styles.errorCardMessage}>{errorMessage}</Text>
      <View style={styles.errorCardActions}>
        {onRetry && (
          <TouchableOpacity style={styles.errorCardButton} onPress={onRetry}>
            <RefreshCw size={14} color="#00ff88" />
            <Text style={styles.errorCardButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
        {onDismiss && (
          <TouchableOpacity style={styles.errorCardButtonSecondary} onPress={onDismiss}>
            <Text style={styles.errorCardButtonTextSecondary}>Dismiss</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 71, 87, 0.3)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00ff88',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#0a0a0a',
  },
  copyLogsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  copyLogsButtonCopied: {
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  copyLogsButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  copyLogsButtonTextCopied: {
    color: '#00ff88',
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 6,
  },
  detailsToggleText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  stackTraceContainer: {
    marginTop: 16,
    maxHeight: 200,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
  },
  stackTraceTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#ff4757',
    marginBottom: 8,
    marginTop: 8,
  },
  stackTraceText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 16,
  },
  compactError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    borderRadius: 8,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.3)',
  },
  compactErrorText: {
    flex: 1,
    fontSize: 13,
    color: '#ff4757',
  },
  dismissButton: {
    padding: 4,
  },
  dismissButtonText: {
    fontSize: 18,
    color: '#ff4757',
    fontWeight: '600' as const,
  },
  errorCard: {
    backgroundColor: 'rgba(255, 71, 87, 0.08)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.2)',
  },
  errorCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  errorCardTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#ff4757',
  },
  errorCardMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 12,
  },
  errorCardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  errorCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  errorCardButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#00ff88',
  },
  errorCardButtonSecondary: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorCardButtonTextSecondary: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

export default ErrorBoundary;
