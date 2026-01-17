import { Alert, Platform } from 'react-native';

export enum ErrorCode {
  UNKNOWN = 'UNKNOWN',
  NETWORK = 'NETWORK',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  STORAGE = 'STORAGE',
  SENSOR_UNAVAILABLE = 'SENSOR_UNAVAILABLE',
  CAMERA_ERROR = 'CAMERA_ERROR',
  MICROPHONE_ERROR = 'MICROPHONE_ERROR',
  VIDEO_LOAD_ERROR = 'VIDEO_LOAD_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  DEVICE_NOT_FOUND = 'DEVICE_NOT_FOUND',
  WEBVIEW_ERROR = 'WEBVIEW_ERROR',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  originalError?: Error | unknown;
  recoverable: boolean;
  timestamp: string;
}

export function createAppError(
  code: ErrorCode,
  message: string,
  originalError?: Error | unknown,
  recoverable = true
): AppError {
  const error: AppError = {
    code,
    message,
    originalError,
    recoverable,
    timestamp: new Date().toISOString(),
  };
  
  console.error(`[AppError] ${code}: ${message}`, {
    originalError,
    timestamp: error.timestamp,
  });
  
  return error;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'An unexpected error occurred';
}

export function isNetworkError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('timeout') ||
    message.includes('offline')
  );
}

export function isPermissionError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes('permission') ||
    message.includes('denied') ||
    message.includes('not allowed') ||
    message.includes('access')
  );
}

export function handleAsyncError<T>(
  promise: Promise<T>,
  errorCode: ErrorCode = ErrorCode.UNKNOWN
): Promise<[T | null, AppError | null]> {
  return promise
    .then((data) => [data, null] as [T, null])
    .catch((error) => {
      const appError = createAppError(
        errorCode,
        getErrorMessage(error),
        error
      );
      return [null, appError] as [null, AppError];
    });
}

export function showErrorAlert(
  title: string,
  message: string,
  onRetry?: () => void,
  onCancel?: () => void
): void {
  const buttons: { text: string; onPress?: () => void; style?: 'cancel' | 'default' | 'destructive' }[] = [];
  
  if (onCancel) {
    buttons.push({
      text: 'Cancel',
      style: 'cancel',
      onPress: onCancel,
    });
  }
  
  if (onRetry) {
    buttons.push({
      text: 'Retry',
      onPress: onRetry,
    });
  }
  
  if (buttons.length === 0) {
    buttons.push({ text: 'OK' });
  }
  
  Alert.alert(title, message, buttons);
}

export function validateUrl(url: string): { valid: boolean; error?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }
  
  const trimmed = url.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'URL cannot be empty' };
  }
  
  if (trimmed.length > 2048) {
    return { valid: false, error: 'URL is too long' };
  }
  
  try {
    if (trimmed.match(/^https?:\/\//i)) {
      new URL(trimmed);
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

export function validateVideoUrl(url: string): { valid: boolean; error?: string } {
  const urlValidation = validateUrl(url);
  if (!urlValidation.valid) {
    return urlValidation;
  }
  
  const supportedExtensions = ['.mp4', '.webm', '.mov', '.m4v', '.avi'];
  const hasValidExtension = supportedExtensions.some(ext => 
    url.toLowerCase().includes(ext)
  );
  
  if (!hasValidExtension && !url.includes('blob:') && !url.includes('data:')) {
    console.warn('[Validation] Video URL may not have a recognized video extension:', url);
  }
  
  return { valid: true };
}

export function validateTemplateName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Template name is required' };
  }
  
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Template name cannot be empty' };
  }
  
  if (trimmed.length < 2) {
    return { valid: false, error: 'Template name must be at least 2 characters' };
  }
  
  if (trimmed.length > 100) {
    return { valid: false, error: 'Template name must be less than 100 characters' };
  }
  
  return { valid: true };
}

export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('[SafeJsonParse] Failed to parse JSON:', error);
    return fallback;
  }
}

export function safeJsonStringify(data: unknown): string | null {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error('[SafeJsonStringify] Failed to stringify data:', error);
    return null;
  }
}

export function withErrorLogging<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context: string
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.catch((error: unknown) => {
          console.error(`[${context}] Async error:`, error);
          throw error;
        });
      }
      return result;
    } catch (error) {
      console.error(`[${context}] Sync error:`, error);
      throw error;
    }
  }) as T;
}

export function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    let retries = 0;
    
    const attempt = async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        retries++;
        console.log(`[RetryWithBackoff] Attempt ${retries}/${maxRetries} failed:`, error);
        
        if (retries >= maxRetries) {
          reject(error);
          return;
        }
        
        const delay = initialDelay * Math.pow(2, retries - 1);
        console.log(`[RetryWithBackoff] Retrying in ${delay}ms...`);
        setTimeout(attempt, delay);
      }
    };
    
    attempt();
  });
}

export function debounceError(
  fn: (error: AppError) => void,
  delay = 1000
): (error: AppError) => void {
  let lastError: string | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (error: AppError) => {
    const errorKey = `${error.code}:${error.message}`;
    
    if (errorKey === lastError) {
      return;
    }
    
    lastError = errorKey;
    fn(error);
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      lastError = null;
    }, delay);
  };
}

export function getPlatformSpecificError(error: unknown): string {
  const baseMessage = getErrorMessage(error);
  
  if (Platform.OS === 'web') {
    if (baseMessage.includes('getUserMedia')) {
      return 'Camera/microphone access is not available in this browser. Please use a mobile device.';
    }
    if (baseMessage.includes('DeviceMotion')) {
      return 'Motion sensors are not available in this browser. Please use a mobile device.';
    }
  }
  
  return baseMessage;
}
