import type { CaptureDevice, CameraMode } from '@/types/device';
import {
  DEFAULT_PHOTO_RESOLUTIONS,
  DEFAULT_VIDEO_RESOLUTIONS,
  PRO_PHOTO_RESOLUTIONS,
  PRO_VIDEO_RESOLUTIONS,
  FRONT_PHOTO_RESOLUTIONS,
  FRONT_VIDEO_RESOLUTIONS,
  PRO_CAMERA_MODES,
  STANDARD_CAMERA_MODES,
} from '@/constants/cameraResolutions';

interface iOSDeviceFlags {
  isiPhonePro: boolean;
  isiPhoneProMax: boolean;
  isiPhone11: boolean;
  isiPhone12: boolean;
  isiPhone13: boolean;
  isiPhone14: boolean;
  isiPhone15: boolean;
  isiPhone16: boolean;
  isiPhone17: boolean;
  isiPadPro: boolean;
  isLatestPro: boolean;
  isProMaxLatest: boolean;
}

function detectiOSFlags(modelName: string): iOSDeviceFlags {
  const lowerModel = modelName.toLowerCase();
  const isiPhonePro = lowerModel.includes('pro');
  const isiPhoneProMax = lowerModel.includes('pro max');
  const isiPhone11 = lowerModel.includes('11');
  const isiPhone12 = lowerModel.includes('12');
  const isiPhone13 = lowerModel.includes('13');
  const isiPhone14 = lowerModel.includes('14');
  const isiPhone15 = lowerModel.includes('15');
  const isiPhone16 = lowerModel.includes('16');
  const isiPhone17 = lowerModel.includes('17');
  const isiPadPro = lowerModel.includes('ipad') && lowerModel.includes('pro');
  const isLatestPro = (isiPhone15 || isiPhone16 || isiPhone17) && isiPhonePro;
  const isProMaxLatest = (isiPhone15 || isiPhone16 || isiPhone17) && isiPhoneProMax;

  return {
    isiPhonePro,
    isiPhoneProMax,
    isiPhone11,
    isiPhone12,
    isiPhone13,
    isiPhone14,
    isiPhone15,
    isiPhone16,
    isiPhone17,
    isiPadPro,
    isLatestPro,
    isProMaxLatest,
  };
}

export function createiOSCameraDevices(modelName: string): CaptureDevice[] {
  const devices: CaptureDevice[] = [];
  const flags = detectiOSFlags(modelName);
  let sensorIndex = 0;

  const proModes: CameraMode[] = [...PRO_CAMERA_MODES];
  if (flags.isProMaxLatest) proModes.push('spatial');
  if (flags.isLatestPro) proModes.push('action');

  const hasModernFeatures = flags.isiPhone12 || flags.isiPhone13 || flags.isiPhone14 || flags.isiPhone15 || flags.isiPhone16 || flags.isiPhone17;
  const hasNewerFeatures = flags.isiPhone13 || flags.isiPhone14 || flags.isiPhone15 || flags.isiPhone16 || flags.isiPhone17;

  devices.push({
    id: 'ios_main_wide',
    name: 'Main Wide Camera (1x)',
    type: 'camera',
    facing: 'back',
    lensType: 'wide',
    zoomFactor: '1x',
    equivalentFocalLength: '24mm',
    sensorIndex: sensorIndex++,
    isPrimary: true,
    isDefault: true,
    tested: false,
    simulationEnabled: false,
    capabilities: {
      photoResolutions: flags.isiPhonePro ? PRO_PHOTO_RESOLUTIONS : DEFAULT_PHOTO_RESOLUTIONS,
      videoResolutions: flags.isiPhonePro ? PRO_VIDEO_RESOLUTIONS : DEFAULT_VIDEO_RESOLUTIONS,
      supportedModes: flags.isiPhonePro ? proModes : STANDARD_CAMERA_MODES,
      hasOIS: true,
      hasAutoFocus: true,
      hasPhaseDetection: true,
      hasFlash: true,
      hasTrueTone: true,
      supportsHDR: true,
      supportsDolbyVision: hasModernFeatures,
      supportsNightMode: true,
      supportsPortrait: true,
      supportsCinematic: hasNewerFeatures,
      supportsProRAW: flags.isiPhonePro,
      supportsProRes: flags.isiPhonePro,
      supportsSpatialVideo: flags.isProMaxLatest,
      supportsActionMode: flags.isLatestPro,
      supportsSlowMo: true,
      slowMoFps: [120, 240],
      supportsLivePhoto: true,
      supportsSmartHDR: true,
      smartHDRVersion: (flags.isiPhone15 || flags.isiPhone16 || flags.isiPhone17) ? 5 : 4,
      supportsDeepFusion: true,
      supports48MP: flags.isiPhonePro || flags.isiPhone15 || flags.isiPhone16 || flags.isiPhone17,
      maxOpticalZoom: 1,
      aperture: flags.isiPhonePro ? 'f/1.78' : 'f/1.6',
    },
    hardwareInfo: {
      manufacturer: 'Sony',
      sensorModel: flags.isiPhonePro ? 'IMX803' : 'IMX714',
      megapixels: (flags.isiPhonePro || flags.isiPhone15 || flags.isiPhone16 || flags.isiPhone17) ? 48 : 12,
      aperture: flags.isiPhonePro ? 'f/1.78' : 'f/1.6',
      focalLength: '24mm equivalent',
    },
  });

  devices.push({
    id: 'ios_front_truedepth',
    name: 'TrueDepth Front Camera',
    type: 'camera',
    facing: 'front',
    lensType: 'truedepth',
    zoomFactor: '1x',
    equivalentFocalLength: '23mm',
    sensorIndex: sensorIndex++,
    isPrimary: true,
    isDefault: false,
    tested: false,
    simulationEnabled: false,
    capabilities: {
      photoResolutions: FRONT_PHOTO_RESOLUTIONS,
      videoResolutions: FRONT_VIDEO_RESOLUTIONS,
      supportedModes: ['photo', 'video', 'portrait', 'slowmo', 'cinematic'],
      hasAutoFocus: true,
      supportsHDR: true,
      supportsPortrait: true,
      supportsCinematic: hasNewerFeatures,
      supportsNightMode: hasModernFeatures,
      supportsSlowMo: true,
      slowMoFps: [120],
      supportsLivePhoto: true,
      supportsSmartHDR: true,
      aperture: 'f/1.9',
    },
    hardwareInfo: {
      manufacturer: 'Sony',
      megapixels: 12,
      aperture: 'f/1.9',
      focalLength: '23mm equivalent',
    },
  });

  const hasUltrawide = flags.isiPhone11 || hasModernFeatures || flags.isiPadPro;
  if (hasUltrawide) {
    devices.push({
      id: 'ios_ultrawide',
      name: 'Ultra Wide Camera (0.5x)',
      type: 'camera',
      facing: 'back',
      lensType: 'ultrawide',
      zoomFactor: '0.5x',
      equivalentFocalLength: '13mm',
      sensorIndex: sensorIndex++,
      isPrimary: false,
      isDefault: false,
      tested: false,
      simulationEnabled: false,
      capabilities: {
        photoResolutions: [{ width: 4032, height: 3024, megapixels: 12, label: '12MP 4:3' }],
        videoResolutions: [
          { width: 3840, height: 2160, label: '4K', maxFps: 60 },
          { width: 1920, height: 1080, label: '1080p', maxFps: 60 },
        ],
        supportedModes: ['photo', 'video', 'night', 'timelapse'],
        hasAutoFocus: hasNewerFeatures,
        supportsHDR: true,
        supportsNightMode: hasNewerFeatures,
        supportsMacro: flags.isiPhonePro && hasNewerFeatures,
        supportsLivePhoto: true,
        aperture: 'f/2.2',
      },
      hardwareInfo: {
        megapixels: 12,
        aperture: 'f/2.2',
        focalLength: '13mm equivalent',
      },
    });
  }

  if (flags.isiPhonePro) {
    const telephotoZoom = flags.isProMaxLatest ? '5x' : (flags.isLatestPro ? '3x' : '2x');
    const isTetrapism = flags.isProMaxLatest && (flags.isiPhone15 || flags.isiPhone16 || flags.isiPhone17);
    
    devices.push({
      id: 'ios_telephoto',
      name: `Telephoto Camera (${telephotoZoom})`,
      type: 'camera',
      facing: 'back',
      lensType: isTetrapism ? 'periscope' : 'telephoto',
      zoomFactor: telephotoZoom,
      equivalentFocalLength: isTetrapism ? '120mm' : (flags.isLatestPro ? '77mm' : '52mm'),
      sensorIndex: sensorIndex++,
      isPrimary: false,
      isDefault: false,
      tested: false,
      simulationEnabled: false,
      capabilities: {
        photoResolutions: [{ width: 4032, height: 3024, megapixels: 12, label: '12MP 4:3' }],
        videoResolutions: [
          { width: 3840, height: 2160, label: '4K', maxFps: 60 },
          { width: 1920, height: 1080, label: '1080p', maxFps: 60 },
        ],
        supportedModes: ['photo', 'video', 'portrait', 'night'],
        hasOIS: true,
        hasAutoFocus: true,
        supportsHDR: true,
        supportsNightMode: true,
        supportsPortrait: true,
        maxOpticalZoom: parseFloat(telephotoZoom),
        aperture: isTetrapism ? 'f/2.8' : 'f/2.2',
      },
      hardwareInfo: {
        megapixels: 12,
        aperture: isTetrapism ? 'f/2.8' : 'f/2.2',
        focalLength: isTetrapism ? '120mm' : (flags.isLatestPro ? '77mm' : '52mm'),
      },
    });

    if (flags.isLatestPro && !isTetrapism) {
      devices.push({
        id: 'ios_telephoto_2x',
        name: 'Telephoto Camera (2x)',
        type: 'camera',
        facing: 'back',
        lensType: 'telephoto',
        zoomFactor: '2x',
        equivalentFocalLength: '48mm',
        sensorIndex: sensorIndex++,
        isPrimary: false,
        isDefault: false,
        tested: false,
        simulationEnabled: false,
        capabilities: {
          photoResolutions: [{ width: 4032, height: 3024, megapixels: 12, label: '12MP Sensor Crop' }],
          videoResolutions: [{ width: 3840, height: 2160, label: '4K', maxFps: 60 }],
          supportedModes: ['photo', 'video', 'portrait'],
          hasOIS: true,
          supportsHDR: true,
          supportsPortrait: true,
          maxOpticalZoom: 2,
          aperture: 'f/1.78',
        },
        hardwareInfo: {
          megapixels: 12,
          aperture: 'f/1.78 (via main sensor)',
        },
      });
    }

    if (hasModernFeatures) {
      devices.push({
        id: 'ios_lidar',
        name: 'LiDAR Scanner',
        type: 'camera',
        facing: 'back',
        lensType: 'lidar',
        sensorIndex: sensorIndex++,
        isPrimary: false,
        isDefault: false,
        tested: false,
        simulationEnabled: false,
        capabilities: { photoResolutions: [], videoResolutions: [], supportedModes: [] },
        hardwareInfo: { sensorModel: 'LiDAR ToF Sensor' },
      });
    }

    if (hasNewerFeatures) {
      devices.push({
        id: 'ios_macro_mode',
        name: 'Macro Photography Mode',
        type: 'camera',
        facing: 'back',
        lensType: 'macro',
        zoomFactor: '0.5x-macro',
        sensorIndex: sensorIndex++,
        isPrimary: false,
        isDefault: false,
        tested: false,
        simulationEnabled: false,
        capabilities: {
          photoResolutions: [{ width: 4032, height: 3024, megapixels: 12, label: '12MP Macro' }],
          videoResolutions: [{ width: 1920, height: 1080, label: '1080p Macro Video', maxFps: 30 }],
          supportedModes: ['photo', 'video', 'macro'],
          hasAutoFocus: true,
          supportsMacro: true,
        },
        hardwareInfo: { sensorModel: 'Via Ultra Wide Sensor' },
      });
    }
  }

  devices.push({
    id: 'ios_front_faceid_ir',
    name: 'Face ID Infrared Camera',
    type: 'camera',
    facing: 'front',
    lensType: 'infrared',
    sensorIndex: sensorIndex++,
    isPrimary: false,
    isDefault: false,
    tested: false,
    simulationEnabled: false,
    capabilities: { photoResolutions: [], videoResolutions: [], supportedModes: [] },
    hardwareInfo: { sensorModel: 'Infrared Face ID Sensor' },
  });

  devices.push({
    id: 'ios_front_dot_projector',
    name: 'Face ID Dot Projector',
    type: 'camera',
    facing: 'front',
    lensType: 'depth',
    sensorIndex: sensorIndex++,
    isPrimary: false,
    isDefault: false,
    tested: false,
    simulationEnabled: false,
    capabilities: { photoResolutions: [], videoResolutions: [], supportedModes: [] },
    hardwareInfo: { sensorModel: '30,000 point Dot Projector' },
  });

  return devices;
}
