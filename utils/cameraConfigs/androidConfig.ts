import type { CaptureDevice, CameraMode } from '@/types/device';
import {
  DEFAULT_PHOTO_RESOLUTIONS,
  DEFAULT_VIDEO_RESOLUTIONS,
  ULTRA_PHOTO_RESOLUTIONS,
  ULTRA_VIDEO_RESOLUTIONS,
} from '@/constants/cameraResolutions';

interface AndroidDeviceFlags {
  isSamsung: boolean;
  isPixel: boolean;
  isXiaomi: boolean;
  isOppo: boolean;
  isVivo: boolean;
  isSony: boolean;
  isUltra: boolean;
  isPro: boolean;
  isPlus: boolean;
  isMax: boolean;
  isFold: boolean;
  isFlip: boolean;
  isFlagship: boolean;
}

function detectAndroidFlags(brand: string, modelName: string): AndroidDeviceFlags {
  const lowerBrand = brand.toLowerCase();
  const lowerModel = modelName.toLowerCase();

  const isSamsung = lowerBrand.includes('samsung');
  const isPixel = lowerBrand.includes('google') || lowerModel.includes('pixel');
  const isXiaomi = lowerBrand.includes('xiaomi') || lowerBrand.includes('redmi') || lowerBrand.includes('poco');
  const isOppo = lowerBrand.includes('oppo') || lowerBrand.includes('realme');
  const isVivo = lowerBrand.includes('vivo');
  const isSony = lowerBrand.includes('sony');
  
  const isUltra = lowerModel.includes('ultra');
  const isPro = lowerModel.includes('pro');
  const isPlus = lowerModel.includes('plus') || lowerModel.includes('+');
  const isMax = lowerModel.includes('max');
  const isFold = lowerModel.includes('fold');
  const isFlip = lowerModel.includes('flip');
  const isFlagship = isUltra || isPro || isPlus || isMax || isFold || isFlip;

  return {
    isSamsung,
    isPixel,
    isXiaomi,
    isOppo,
    isVivo,
    isSony,
    isUltra,
    isPro,
    isPlus,
    isMax,
    isFold,
    isFlip,
    isFlagship,
  };
}

export function createAndroidCameraDevices(brand: string, modelName: string): CaptureDevice[] {
  const devices: CaptureDevice[] = [];
  const flags = detectAndroidFlags(brand, modelName);
  let sensorIndex = 0;

  const flagshipPhotoRes = flags.isUltra ? ULTRA_PHOTO_RESOLUTIONS : [
    { width: 8160, height: 6120, megapixels: 50, label: '50MP Full' },
    { width: 4080, height: 3060, megapixels: 12.5, label: '12.5MP Binned' },
  ];

  const flagshipVideoRes = flags.isUltra ? ULTRA_VIDEO_RESOLUTIONS : [
    { width: 3840, height: 2160, label: '4K UHD', maxFps: 60 },
    { width: 1920, height: 1080, label: '1080p Super Steady', maxFps: 60 },
    { width: 1920, height: 1080, label: '1080p SlowMo', maxFps: 480 },
  ];

  const flagshipModes: CameraMode[] = ['photo', 'video', 'portrait', 'night', 'slowmo', 'timelapse', 'pano'];
  if (flags.isUltra) flagshipModes.push('prores');

  devices.push({
    id: 'android_main_wide',
    name: 'Main Wide Camera (1x)',
    type: 'camera',
    facing: 'back',
    lensType: 'wide',
    zoomFactor: '1x',
    equivalentFocalLength: '23mm',
    sensorIndex: sensorIndex++,
    isPrimary: true,
    isDefault: true,
    tested: false,
    simulationEnabled: false,
    capabilities: {
      photoResolutions: flags.isFlagship ? flagshipPhotoRes : DEFAULT_PHOTO_RESOLUTIONS,
      videoResolutions: flags.isFlagship ? flagshipVideoRes : DEFAULT_VIDEO_RESOLUTIONS,
      supportedModes: flags.isFlagship ? flagshipModes : ['photo', 'video', 'portrait', 'night'],
      hasOIS: true,
      hasAutoFocus: true,
      hasPhaseDetection: true,
      hasLaserAF: flags.isFlagship,
      hasFlash: true,
      supportsHDR: true,
      supportsHDR10: flags.isFlagship,
      supportsDolbyVision: flags.isUltra,
      supportsNightMode: true,
      supportsPortrait: true,
      supportsSlowMo: true,
      slowMoFps: flags.isUltra ? [120, 240, 480, 960] : [120, 240],
      supportsQuadBayer: flags.isFlagship,
      supportsPixelBinning: true,
      supports48MP: flags.isFlagship && !flags.isUltra,
      supports200MP: flags.isUltra && flags.isSamsung,
      maxOpticalZoom: 1,
      aperture: flags.isFlagship ? 'f/1.7' : 'f/1.8',
    },
    hardwareInfo: {
      manufacturer: flags.isSamsung ? 'Samsung' : (flags.isPixel ? 'Samsung' : 'Sony'),
      sensorModel: (flags.isUltra && flags.isSamsung) ? 'ISOCELL HP2' : 'IMX766',
      megapixels: (flags.isUltra && flags.isSamsung) ? 200 : (flags.isFlagship ? 50 : 12),
      aperture: flags.isFlagship ? 'f/1.7' : 'f/1.8',
    },
  });

  devices.push({
    id: 'android_front',
    name: 'Front Selfie Camera',
    type: 'camera',
    facing: 'front',
    lensType: 'wide',
    zoomFactor: '1x',
    sensorIndex: sensorIndex++,
    isPrimary: true,
    isDefault: false,
    tested: false,
    simulationEnabled: false,
    capabilities: {
      photoResolutions: [{ width: 4000, height: 3000, megapixels: 12, label: '12MP 4:3' }],
      videoResolutions: [
        { width: 3840, height: 2160, label: '4K', maxFps: 60 },
        { width: 1920, height: 1080, label: '1080p', maxFps: 60 },
      ],
      supportedModes: ['photo', 'video', 'portrait'],
      hasAutoFocus: flags.isFlagship,
      supportsHDR: true,
      supportsPortrait: true,
      aperture: 'f/2.2',
    },
    hardwareInfo: { megapixels: 12, aperture: 'f/2.2' },
  });

  devices.push({
    id: 'android_ultrawide',
    name: 'Ultra Wide Camera (0.6x)',
    type: 'camera',
    facing: 'back',
    lensType: 'ultrawide',
    zoomFactor: '0.6x',
    equivalentFocalLength: '12mm',
    sensorIndex: sensorIndex++,
    isPrimary: false,
    isDefault: false,
    tested: false,
    simulationEnabled: false,
    capabilities: {
      photoResolutions: [{ width: 4000, height: 3000, megapixels: 12, label: '12MP 4:3' }],
      videoResolutions: [
        { width: 3840, height: 2160, label: '4K', maxFps: 30 },
        { width: 1920, height: 1080, label: '1080p Super Steady', maxFps: 60 },
      ],
      supportedModes: ['photo', 'video', 'night'],
      hasAutoFocus: flags.isFlagship,
      supportsHDR: true,
      supportsNightMode: flags.isFlagship,
      aperture: 'f/2.2',
    },
    hardwareInfo: { megapixels: 12, aperture: 'f/2.2' },
  });

  if (flags.isFlagship) {
    const telephotoZoom = flags.isUltra ? '3x' : '2x';
    devices.push({
      id: 'android_telephoto',
      name: `Telephoto Camera (${telephotoZoom})`,
      type: 'camera',
      facing: 'back',
      lensType: 'telephoto',
      zoomFactor: telephotoZoom,
      equivalentFocalLength: flags.isUltra ? '69mm' : '52mm',
      sensorIndex: sensorIndex++,
      isPrimary: false,
      isDefault: false,
      tested: false,
      simulationEnabled: false,
      capabilities: {
        photoResolutions: [{ width: 4000, height: 3000, megapixels: 12, label: '12MP 4:3' }],
        videoResolutions: [
          { width: 3840, height: 2160, label: '4K', maxFps: 30 },
          { width: 1920, height: 1080, label: '1080p', maxFps: 60 },
        ],
        supportedModes: ['photo', 'video', 'portrait'],
        hasOIS: true,
        hasAutoFocus: true,
        supportsHDR: true,
        supportsPortrait: true,
        maxOpticalZoom: parseFloat(telephotoZoom),
        aperture: 'f/2.4',
      },
      hardwareInfo: { megapixels: 12, aperture: 'f/2.4' },
    });
  }

  if (flags.isUltra) {
    devices.push({
      id: 'android_periscope',
      name: 'Periscope Telephoto (10x)',
      type: 'camera',
      facing: 'back',
      lensType: 'periscope',
      zoomFactor: '10x',
      equivalentFocalLength: '230mm',
      sensorIndex: sensorIndex++,
      isPrimary: false,
      isDefault: false,
      tested: false,
      simulationEnabled: false,
      capabilities: {
        photoResolutions: [{ width: 4000, height: 3000, megapixels: 12, label: '12MP 4:3' }],
        videoResolutions: [{ width: 3840, height: 2160, label: '4K', maxFps: 30 }],
        supportedModes: ['photo', 'video'],
        hasOIS: true,
        hasAutoFocus: true,
        supportsHDR: true,
        maxOpticalZoom: 10,
        maxDigitalZoom: 100,
        aperture: 'f/4.9',
      },
      hardwareInfo: {
        megapixels: 12,
        aperture: 'f/4.9',
        sensorModel: 'Folded Optics',
      },
    });
  }

  if (flags.isSamsung || flags.isXiaomi || flags.isOppo || flags.isVivo) {
    devices.push({
      id: 'android_macro',
      name: 'Macro Camera',
      type: 'camera',
      facing: 'back',
      lensType: 'macro',
      zoomFactor: '1x-macro',
      sensorIndex: sensorIndex++,
      isPrimary: false,
      isDefault: false,
      tested: false,
      simulationEnabled: false,
      capabilities: {
        photoResolutions: [{ width: 2560, height: 1920, megapixels: 5, label: '5MP Macro' }],
        videoResolutions: [{ width: 1920, height: 1080, label: '1080p', maxFps: 30 }],
        supportedModes: ['photo', 'video', 'macro'],
        hasAutoFocus: true,
        supportsMacro: true,
        aperture: 'f/2.4',
      },
      hardwareInfo: { megapixels: 5, aperture: 'f/2.4' },
    });
  }

  if (flags.isFlagship || flags.isPixel) {
    devices.push({
      id: 'android_depth',
      name: 'Depth/ToF Sensor',
      type: 'camera',
      facing: 'back',
      lensType: 'tof',
      sensorIndex: sensorIndex++,
      isPrimary: false,
      isDefault: false,
      tested: false,
      simulationEnabled: false,
      capabilities: { photoResolutions: [], videoResolutions: [], supportedModes: [] },
      hardwareInfo: { sensorModel: 'Time-of-Flight Sensor' },
    });
  }

  if (flags.isFold) {
    devices.push({
      id: 'android_cover_camera',
      name: 'Cover Screen Camera',
      type: 'camera',
      facing: 'front',
      lensType: 'wide',
      zoomFactor: '1x',
      sensorIndex: sensorIndex++,
      isPrimary: false,
      isDefault: false,
      tested: false,
      simulationEnabled: false,
      capabilities: {
        photoResolutions: [{ width: 4000, height: 3000, megapixels: 10, label: '10MP 4:3' }],
        videoResolutions: [{ width: 3840, height: 2160, label: '4K', maxFps: 30 }],
        supportedModes: ['photo', 'video', 'portrait'],
        hasAutoFocus: false,
        supportsPortrait: true,
        aperture: 'f/2.2',
      },
      hardwareInfo: { megapixels: 10, aperture: 'f/2.2' },
    });

    devices.push({
      id: 'android_under_display',
      name: 'Under Display Camera',
      type: 'camera',
      facing: 'front',
      lensType: 'wide',
      zoomFactor: '1x',
      sensorIndex: sensorIndex++,
      isPrimary: false,
      isDefault: false,
      tested: false,
      simulationEnabled: false,
      capabilities: {
        photoResolutions: [{ width: 3200, height: 2400, megapixels: 4, label: '4MP UDC' }],
        videoResolutions: [{ width: 1920, height: 1080, label: '1080p', maxFps: 30 }],
        supportedModes: ['photo', 'video'],
        aperture: 'f/1.8',
      },
      hardwareInfo: { megapixels: 4, sensorModel: 'Under Panel Camera' },
    });
  }

  if (flags.isFlip) {
    devices.push({
      id: 'android_cover_selfie',
      name: 'Cover Display Selfie Camera',
      type: 'camera',
      facing: 'front',
      lensType: 'wide',
      zoomFactor: '1x',
      sensorIndex: sensorIndex++,
      isPrimary: false,
      isDefault: false,
      tested: false,
      simulationEnabled: false,
      capabilities: {
        photoResolutions: [{ width: 4000, height: 3000, megapixels: 10, label: '10MP 4:3' }],
        videoResolutions: [{ width: 3840, height: 2160, label: '4K', maxFps: 30 }],
        supportedModes: ['photo', 'video', 'portrait'],
        supportsPortrait: true,
        aperture: 'f/2.2',
      },
      hardwareInfo: { megapixels: 10 },
    });
  }

  if (flags.isSony) {
    devices.push({
      id: 'android_monochrome',
      name: 'Monochrome Sensor',
      type: 'camera',
      facing: 'back',
      lensType: 'monochrome',
      sensorIndex: sensorIndex++,
      isPrimary: false,
      isDefault: false,
      tested: false,
      simulationEnabled: false,
      capabilities: {
        photoResolutions: [{ width: 4000, height: 3000, megapixels: 12, label: '12MP B&W' }],
        videoResolutions: [],
        supportedModes: ['photo'],
        aperture: 'f/2.4',
      },
      hardwareInfo: { megapixels: 12, sensorModel: 'Dedicated B&W Sensor' },
    });
  }

  return devices;
}
