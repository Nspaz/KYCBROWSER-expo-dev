export interface DeviceFingerprintProfile {
  navigator: {
    userAgent: string;
    platform: string;
    vendor: string;
    language: string;
    languages: string[];
    hardwareConcurrency: number;
    deviceMemory: number;
    maxTouchPoints: number;
  };
  screen: {
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
    colorDepth: number;
    pixelDepth: number;
    devicePixelRatio: number;
  };
  webgl: {
    vendor: string;
    renderer: string;
    version: string;
    shadingLanguageVersion: string;
    unmaskedVendor: string;
    unmaskedRenderer: string;
  };
  mediaCapabilities: {
    facingMode: 'user' | 'environment';
    frameRate: { min: number; max: number; ideal: number };
    width: { min: number; max: number; ideal: number };
    height: { min: number; max: number; ideal: number };
    aspectRatio: { min: number; max: number; ideal: number };
    resizeMode: string[];
    echoCancellation: boolean;
    autoGainControl: boolean;
    noiseSuppression: boolean;
    sampleRate: number;
    sampleSize: number;
    channelCount: number;
  };
  audio: {
    sampleRate: number;
    maxChannelCount: number;
    numberOfInputs: number;
    numberOfOutputs: number;
    channelCountMode: string;
    channelInterpretation: string;
  };
  battery: {
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    level: number;
  };
  fonts: string[];
}

export const IPHONE_15_PRO_PROFILE: DeviceFingerprintProfile = {
  navigator: {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    vendor: 'Apple Computer, Inc.',
    language: 'en-US',
    languages: ['en-US', 'en'],
    hardwareConcurrency: 6,
    deviceMemory: 8,
    maxTouchPoints: 5,
  },
  screen: {
    width: 393,
    height: 852,
    availWidth: 393,
    availHeight: 852,
    colorDepth: 24,
    pixelDepth: 24,
    devicePixelRatio: 3,
  },
  webgl: {
    vendor: 'WebKit',
    renderer: 'WebKit WebGL',
    version: 'WebGL 2.0 (OpenGL ES 3.0)',
    shadingLanguageVersion: 'WebGL GLSL ES 3.00',
    unmaskedVendor: 'Apple Inc.',
    unmaskedRenderer: 'Apple GPU',
  },
  mediaCapabilities: {
    facingMode: 'user',
    frameRate: { min: 1, max: 60, ideal: 30 },
    width: { min: 1, max: 4032, ideal: 1080 },
    height: { min: 1, max: 3024, ideal: 1920 },
    aspectRatio: { min: 0.5, max: 2.0, ideal: 0.5625 },
    resizeMode: ['none', 'crop-and-scale'],
    echoCancellation: true,
    autoGainControl: true,
    noiseSuppression: true,
    sampleRate: 48000,
    sampleSize: 16,
    channelCount: 1,
  },
  audio: {
    sampleRate: 48000,
    maxChannelCount: 2,
    numberOfInputs: 1,
    numberOfOutputs: 1,
    channelCountMode: 'explicit',
    channelInterpretation: 'speakers',
  },
  battery: {
    charging: false,
    chargingTime: Infinity,
    dischargingTime: 28800,
    level: 0.85,
  },
  fonts: [
    'Arial',
    'Helvetica',
    'Helvetica Neue',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Courier New',
    'SF Pro Display',
    'SF Pro Text',
    'SF Mono',
  ],
};

export const IPHONE_14_PROFILE: DeviceFingerprintProfile = {
  navigator: {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    vendor: 'Apple Computer, Inc.',
    language: 'en-US',
    languages: ['en-US', 'en'],
    hardwareConcurrency: 6,
    deviceMemory: 6,
    maxTouchPoints: 5,
  },
  screen: {
    width: 390,
    height: 844,
    availWidth: 390,
    availHeight: 844,
    colorDepth: 24,
    pixelDepth: 24,
    devicePixelRatio: 3,
  },
  webgl: {
    vendor: 'WebKit',
    renderer: 'WebKit WebGL',
    version: 'WebGL 2.0 (OpenGL ES 3.0)',
    shadingLanguageVersion: 'WebGL GLSL ES 3.00',
    unmaskedVendor: 'Apple Inc.',
    unmaskedRenderer: 'Apple GPU',
  },
  mediaCapabilities: {
    facingMode: 'user',
    frameRate: { min: 1, max: 60, ideal: 30 },
    width: { min: 1, max: 4032, ideal: 1080 },
    height: { min: 1, max: 3024, ideal: 1920 },
    aspectRatio: { min: 0.5, max: 2.0, ideal: 0.5625 },
    resizeMode: ['none', 'crop-and-scale'],
    echoCancellation: true,
    autoGainControl: true,
    noiseSuppression: true,
    sampleRate: 48000,
    sampleSize: 16,
    channelCount: 1,
  },
  audio: {
    sampleRate: 48000,
    maxChannelCount: 2,
    numberOfInputs: 1,
    numberOfOutputs: 1,
    channelCountMode: 'explicit',
    channelInterpretation: 'speakers',
  },
  battery: {
    charging: true,
    chargingTime: 3600,
    dischargingTime: Infinity,
    level: 0.72,
  },
  fonts: [
    'Arial',
    'Helvetica',
    'Helvetica Neue',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Courier New',
    'SF Pro Display',
    'SF Pro Text',
  ],
};

export interface VideoNaturalVariation {
  brightnessJitter: { min: number; max: number; frequency: number };
  colorTemperatureShift: { min: number; max: number; frequency: number };
  microShake: { amplitude: number; frequency: number };
  frameDropProbability: number;
  autoExposureDelay: number;
  autoFocusHuntProbability: number;
  sensorNoise: { intensity: number; grain: number };
  rollingShutterEffect: boolean;
  lensDistortion: { k1: number; k2: number };
}

export const NATURAL_CAMERA_VARIATIONS: VideoNaturalVariation = {
  brightnessJitter: { min: -0.02, max: 0.02, frequency: 0.3 },
  colorTemperatureShift: { min: -50, max: 50, frequency: 0.1 },
  microShake: { amplitude: 0.5, frequency: 2.0 },
  frameDropProbability: 0.001,
  autoExposureDelay: 150,
  autoFocusHuntProbability: 0.0005,
  sensorNoise: { intensity: 0.008, grain: 0.003 },
  rollingShutterEffect: false,
  lensDistortion: { k1: 0.0, k2: 0.0 },
};

export interface TimingProfile {
  getUserMediaDelay: { min: number; max: number };
  enumerateDevicesDelay: { min: number; max: number };
  trackStartDelay: { min: number; max: number };
  capabilitiesQueryDelay: { min: number; max: number };
  settingsQueryDelay: { min: number; max: number };
  frameIntervalJitter: number;
}

export const REALISTIC_TIMING: TimingProfile = {
  getUserMediaDelay: { min: 180, max: 450 },
  enumerateDevicesDelay: { min: 5, max: 25 },
  trackStartDelay: { min: 50, max: 150 },
  capabilitiesQueryDelay: { min: 1, max: 5 },
  settingsQueryDelay: { min: 1, max: 3 },
  frameIntervalJitter: 2.0,
};

export interface WebRTCStealthConfig {
  blockLocalIPs: boolean;
  spoofPublicIP: boolean;
  spoofedIP: string;
  disableSTUN: boolean;
  disableTURN: boolean;
  modifySDPFingerprint: boolean;
  randomizeCandidatePriority: boolean;
}

export const WEBRTC_STEALTH_CONFIG: WebRTCStealthConfig = {
  blockLocalIPs: true,
  spoofPublicIP: false,
  spoofedIP: '',
  disableSTUN: false,
  disableTURN: false,
  modifySDPFingerprint: true,
  randomizeCandidatePriority: true,
};

export interface CanvasStealthConfig {
  addNoise: boolean;
  noiseIntensity: number;
  modifyGetImageData: boolean;
  modifyToDataURL: boolean;
  modifyToBlob: boolean;
  consistentNoiseSeed: boolean;
}

export const CANVAS_STEALTH_CONFIG: CanvasStealthConfig = {
  addNoise: true,
  noiseIntensity: 0.005,
  modifyGetImageData: true,
  modifyToDataURL: true,
  modifyToBlob: true,
  consistentNoiseSeed: true,
};

export interface AudioStealthConfig {
  modifyAnalyserNode: boolean;
  modifyOscillator: boolean;
  addMicroVariations: boolean;
  spoofSampleRate: boolean;
  targetSampleRate: number;
}

export const AUDIO_STEALTH_CONFIG: AudioStealthConfig = {
  modifyAnalyserNode: true,
  modifyOscillator: true,
  addMicroVariations: true,
  spoofSampleRate: true,
  targetSampleRate: 48000,
};

export const STEALTH_DETECTION_CHECKS = [
  'webdriver',
  'selenium',
  'phantom',
  'nightmare',
  'puppeteer',
  'playwright',
  'cypress',
  'chromedriver',
  'automationProtocol',
  '__webdriver_script_fn',
  '__driver_evaluate',
  '__webdriver_evaluate',
  '__selenium_evaluate',
  '__fxdriver_evaluate',
  '__driver_unwrapped',
  '__webdriver_unwrapped',
  '__selenium_unwrapped',
  '__fxdriver_unwrapped',
  '_Selenium_IDE_Recorder',
  '_selenium',
  'calledSelenium',
  '$cdc_',
  '$chrome_',
  '__nightmare',
  '__puppeteer',
  'domAutomation',
  'domAutomationController',
];

export const PROPERTIES_TO_DELETE = [
  'cdc_adoQpoasnfa76pfcZLmcfl_Array',
  'cdc_adoQpoasnfa76pfcZLmcfl_Promise',
  'cdc_adoQpoasnfa76pfcZLmcfl_Symbol',
  'cdc_adoQpoasnfa76pfcZLmcfl_JSON',
  'cdc_adoQpoasnfa76pfcZLmcfl_Object',
  'cdc_adoQpoasnfa76pfcZLmcfl_Proxy',
  '__webdriver_script_fn',
  '__driver_evaluate',
  '__webdriver_evaluate',
  '__selenium_evaluate',
  '__fxdriver_evaluate',
  '__driver_unwrapped',
  '__webdriver_unwrapped',
  '__selenium_unwrapped',
  '__fxdriver_unwrapped',
  '_Selenium_IDE_Recorder',
  '_selenium',
  'calledSelenium',
];

export function getRandomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function addNaturalJitter(value: number, jitterPercent: number): number {
  const jitter = value * (jitterPercent / 100) * (Math.random() * 2 - 1);
  return value + jitter;
}

export function generateConsistentNoise(seed: number, x: number, y: number): number {
  const n = Math.sin(seed * 12.9898 + x * 78.233 + y * 43.1234) * 43758.5453;
  return n - Math.floor(n);
}
