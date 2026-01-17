export interface IdealVideoSpecs {
  width: number;
  height: number;
  aspectRatio: string;
  fps: number;
  format: string;
  codec: string;
  maxFileSizeMB: number;
  maxDurationSeconds: number;
}

export interface AcceptableSpecs {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  aspectRatioTolerance: number;
  acceptableFormats: string[];
  acceptableFps: number[];
}

export type CompatibilityStatus = 'perfect' | 'compatible' | 'warning' | 'incompatible';

export interface CompatibilityCheckItem {
  name: string;
  status: CompatibilityStatus;
  currentValue: string;
  idealValue: string;
  message: string;
  fixSuggestion?: string;
}

export interface CompatibilityResult {
  overallStatus: CompatibilityStatus;
  score: number;
  items: CompatibilityCheckItem[];
  summary: string;
  readyForSimulation: boolean;
  requiresModification: boolean;
  modifications: string[];
}
