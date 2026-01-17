import type { SavedVideo } from '../videoManager';
import type { CompatibilityCheckItem, CompatibilityResult, CompatibilityStatus } from './types';
import {
  checkResolution,
  checkOrientation,
  checkAspectRatio,
  checkFormat,
  checkFileSize,
  checkDuration,
} from './checks';

export const checkVideoCompatibility = async (
  video: SavedVideo
): Promise<CompatibilityResult> => {
  console.log('[CompatibilityChecker] ========== CHECK VIDEO START ==========');
  console.log('[CompatibilityChecker] Video name:', video.name);
  console.log('[CompatibilityChecker] Video URI:', video.uri);
  console.log('[CompatibilityChecker] File size:', video.fileSize);
  console.log('[CompatibilityChecker] Metadata:', JSON.stringify(video.metadata, null, 2));
  
  const items: CompatibilityCheckItem[] = [];
  const modifications: string[] = [];
  
  const metadata = video.metadata;
  const width = metadata?.width;
  const height = metadata?.height;
  
  items.push(checkOrientation(width, height));
  items.push(checkAspectRatio(metadata?.aspectRatio, width, height));
  items.push(checkResolution(width, height));
  items.push(checkFormat(video.uri, video.name));
  items.push(checkFileSize(video.fileSize));
  items.push(checkDuration(metadata?.duration));
  
  let perfectCount = 0;
  let compatibleCount = 0;
  let warningCount = 0;
  let incompatibleCount = 0;
  
  items.forEach(item => {
    switch (item.status) {
      case 'perfect':
        perfectCount++;
        break;
      case 'compatible':
        compatibleCount++;
        break;
      case 'warning':
        warningCount++;
        break;
      case 'incompatible':
        incompatibleCount++;
        if (item.fixSuggestion) {
          modifications.push(item.fixSuggestion);
        }
        break;
    }
  });
  
  const score = Math.round(
    ((perfectCount * 100) + (compatibleCount * 75) + (warningCount * 50)) / items.length
  );
  
  let overallStatus: CompatibilityStatus;
  let summary: string;
  let readyForSimulation: boolean;
  
  if (incompatibleCount > 0) {
    overallStatus = 'incompatible';
    summary = `${incompatibleCount} issue(s) need to be fixed before simulation`;
    readyForSimulation = false;
  } else if (warningCount > items.length / 2) {
    overallStatus = 'warning';
    summary = 'Video may work but some properties could not be verified';
    readyForSimulation = true;
  } else if (perfectCount === items.length) {
    overallStatus = 'perfect';
    summary = 'Video is 100% compatible - identical to tested sample videos!';
    readyForSimulation = true;
  } else {
    overallStatus = 'compatible';
    summary = 'Video is compatible and ready for simulation';
    readyForSimulation = true;
  }
  
  console.log('[CompatibilityChecker] ========== CHECK RESULTS ==========');
  console.log('[CompatibilityChecker] Status counts:', { perfectCount, compatibleCount, warningCount, incompatibleCount });
  console.log('[CompatibilityChecker] Final result:', {
    overallStatus,
    score,
    readyForSimulation,
    itemsCount: items.length,
  });
  console.log('[CompatibilityChecker] Items detail:', items.map(i => ({ name: i.name, status: i.status })));
  console.log('[CompatibilityChecker] ========== CHECK VIDEO END ==========');
  
  return {
    overallStatus,
    score,
    items,
    summary,
    readyForSimulation,
    requiresModification: incompatibleCount > 0,
    modifications,
  };
};
