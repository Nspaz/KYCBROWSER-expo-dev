import type { CaptureDevice } from '@/types/device';
import { VIDEO_SIMULATION_TEST_SCRIPT } from '@/constants/browserScripts';
import { IPHONE_FRONT_CAMERA_RESOLUTIONS, DEFAULT_PORTRAIT_RESOLUTION } from '@/constants/sampleVideos';

export interface VideoSimulationTestResult {
  timestamp: string;
  success: boolean;
  steps: TestStep[];
  errors: string[];
  streamInfo: StreamInfo | null;
  testId: string;
}

export interface TestStep {
  step: string;
  status: 'running' | 'success' | 'failed';
  data?: Record<string, unknown>;
  error?: string;
}

export interface StreamInfo {
  label: string;
  width: number;
  height: number;
  frameRate: number;
  aspectRatio: number;
  isPortrait: boolean;
  facingMode: string;
}

export interface SimulationTestConfig {
  targetWidth: number;
  targetHeight: number;
  targetFps: number;
  requirePortrait: boolean;
  deviceName?: string;
}

export const DEFAULT_TEST_CONFIG: SimulationTestConfig = {
  targetWidth: DEFAULT_PORTRAIT_RESOLUTION.width,
  targetHeight: DEFAULT_PORTRAIT_RESOLUTION.height,
  targetFps: DEFAULT_PORTRAIT_RESOLUTION.fps,
  requirePortrait: true,
};

export const IPHONE_TEST_CONFIG: SimulationTestConfig = {
  targetWidth: IPHONE_FRONT_CAMERA_RESOLUTIONS.default.width,
  targetHeight: IPHONE_FRONT_CAMERA_RESOLUTIONS.default.height,
  targetFps: IPHONE_FRONT_CAMERA_RESOLUTIONS.default.fps,
  requirePortrait: true,
  deviceName: 'iPhone Front Camera',
};

export function generateTestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 6);
  return `VST-${timestamp}-${random}`.toUpperCase();
}

export function getVideoSimulationTestScript(): string {
  return VIDEO_SIMULATION_TEST_SCRIPT;
}

export function createTestMessage(config: SimulationTestConfig = DEFAULT_TEST_CONFIG): string {
  return JSON.stringify({
    type: 'runVideoSimTest',
    payload: {
      testId: generateTestId(),
      config,
    },
  });
}

export function parseTestResult(messageData: string): VideoSimulationTestResult | null {
  try {
    const data = JSON.parse(messageData);
    if (data.type === 'videoSimTestResult' && data.payload) {
      return {
        ...data.payload,
        testId: data.payload.testId || generateTestId(),
      };
    }
    return null;
  } catch (error) {
    console.error('[VideoSimTest] Failed to parse test result:', error);
    return null;
  }
}

export function validateStreamAgainstConfig(
  streamInfo: StreamInfo,
  config: SimulationTestConfig
): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (config.requirePortrait && !streamInfo.isPortrait) {
    issues.push(`Stream is not in portrait orientation. Got ${streamInfo.width}x${streamInfo.height}`);
  }

  if (config.requirePortrait) {
    const aspectRatio = streamInfo.width / streamInfo.height;
    const targetAspectRatio = 9 / 16;
    const tolerance = 0.1;
    
    if (Math.abs(aspectRatio - targetAspectRatio) > tolerance) {
      issues.push(`Aspect ratio mismatch. Expected 9:16 (${targetAspectRatio.toFixed(3)}), got ${aspectRatio.toFixed(3)}`);
    }
  }

  const widthTolerance = config.targetWidth * 0.2;
  const heightTolerance = config.targetHeight * 0.2;
  
  if (Math.abs(streamInfo.width - config.targetWidth) > widthTolerance) {
    issues.push(`Width out of tolerance. Expected ~${config.targetWidth}, got ${streamInfo.width}`);
  }
  
  if (Math.abs(streamInfo.height - config.targetHeight) > heightTolerance) {
    issues.push(`Height out of tolerance. Expected ~${config.targetHeight}, got ${streamInfo.height}`);
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

export function formatTestResultSummary(result: VideoSimulationTestResult): string {
  const lines: string[] = [];
  
  lines.push(`Test ID: ${result.testId}`);
  lines.push(`Status: ${result.success ? '✓ PASSED' : '✗ FAILED'}`);
  lines.push(`Timestamp: ${result.timestamp}`);
  lines.push('');
  
  lines.push('Steps:');
  result.steps.forEach((step, index) => {
    const icon = step.status === 'success' ? '✓' : step.status === 'failed' ? '✗' : '○';
    lines.push(`  ${index + 1}. ${icon} ${step.step}: ${step.status}`);
    if (step.data) {
      lines.push(`     Data: ${JSON.stringify(step.data)}`);
    }
    if (step.error) {
      lines.push(`     Error: ${step.error}`);
    }
  });
  
  if (result.streamInfo) {
    lines.push('');
    lines.push('Stream Info:');
    lines.push(`  Resolution: ${result.streamInfo.width}x${result.streamInfo.height}`);
    lines.push(`  Portrait: ${result.streamInfo.isPortrait ? 'Yes' : 'No'}`);
    lines.push(`  Frame Rate: ${result.streamInfo.frameRate || 'N/A'} fps`);
    lines.push(`  Facing Mode: ${result.streamInfo.facingMode || 'N/A'}`);
    lines.push(`  Label: ${result.streamInfo.label || 'N/A'}`);
  }
  
  if (result.errors.length > 0) {
    lines.push('');
    lines.push('Errors:');
    result.errors.forEach(error => {
      lines.push(`  • ${error}`);
    });
  }
  
  return lines.join('\n');
}

export function isVideoCompatibleWithDevice(
  videoWidth: number,
  videoHeight: number,
  device: CaptureDevice
): { compatible: boolean; reason?: string } {
  const isPortrait = videoHeight > videoWidth;
  
  if (!isPortrait) {
    return {
      compatible: false,
      reason: `Video must be in portrait orientation (9:16). Current: ${videoWidth}x${videoHeight} (landscape)`,
    };
  }
  
  const aspectRatio = videoWidth / videoHeight;
  const targetRatio = 9 / 16;
  const tolerance = 0.08;
  
  if (Math.abs(aspectRatio - targetRatio) > tolerance) {
    return {
      compatible: false,
      reason: `Video aspect ratio must be 9:16 for iPhone simulation. Current: ${(aspectRatio * 16).toFixed(1)}:16`,
    };
  }
  
  const minWidth = 480;
  const minHeight = 854;
  
  if (videoWidth < minWidth || videoHeight < minHeight) {
    return {
      compatible: false,
      reason: `Video resolution too low. Minimum: ${minWidth}x${minHeight}. Current: ${videoWidth}x${videoHeight}`,
    };
  }
  
  return { compatible: true };
}

export function getRecommendedVideoSpecs(device?: CaptureDevice): {
  width: number;
  height: number;
  fps: number;
  aspectRatio: string;
  description: string;
} {
  if (device?.facing === 'front') {
    return {
      width: 1080,
      height: 1920,
      fps: 30,
      aspectRatio: '9:16',
      description: 'iPhone Front Camera (TrueDepth) - 1080x1920 @ 30fps Portrait',
    };
  }
  
  return {
    width: 1080,
    height: 1920,
    fps: 30,
    aspectRatio: '9:16',
    description: 'Standard Portrait Video - 1080x1920 @ 30fps (9:16)',
  };
}

export const VIDEO_SIM_TEST_CHECKLIST = [
  {
    id: 'portrait_orientation',
    name: 'Portrait Orientation',
    description: 'Video must be in 9:16 portrait orientation',
    check: (w: number, h: number) => h > w,
  },
  {
    id: 'aspect_ratio',
    name: '9:16 Aspect Ratio',
    description: 'Video aspect ratio must be 9:16 (±8% tolerance)',
    check: (w: number, h: number) => Math.abs((w / h) - (9 / 16)) <= 0.08,
  },
  {
    id: 'min_resolution',
    name: 'Minimum Resolution',
    description: 'Video must be at least 480x854',
    check: (w: number, h: number) => w >= 480 && h >= 854,
  },
  {
    id: 'recommended_resolution',
    name: 'Recommended Resolution',
    description: 'Video should be 1080x1920 for best quality',
    check: (w: number, h: number) => w >= 1080 && h >= 1920,
  },
];

export function runVideoChecklist(width: number, height: number): {
  passed: string[];
  failed: string[];
  warnings: string[];
} {
  const passed: string[] = [];
  const failed: string[] = [];
  const warnings: string[] = [];
  
  VIDEO_SIM_TEST_CHECKLIST.forEach(item => {
    const result = item.check(width, height);
    if (result) {
      passed.push(item.name);
    } else if (item.id === 'recommended_resolution') {
      warnings.push(`${item.name}: ${item.description}`);
    } else {
      failed.push(`${item.name}: ${item.description}`);
    }
  });
  
  return { passed, failed, warnings };
}

export function logTestResult(result: VideoSimulationTestResult): void {
  console.log('='.repeat(60));
  console.log('[VideoSimTest] TEST RESULT');
  console.log('='.repeat(60));
  console.log(formatTestResultSummary(result));
  console.log('='.repeat(60));
}
