import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import { Upload, FileVideo, CheckCircle, Loader } from 'lucide-react-native';

export interface ImportProgress {
  progress: number;
  stage: 'copying' | 'processing' | 'generating_thumbnail' | 'extracting_metadata' | 'complete' | 'error';
  message: string;
}

interface ImportProgressModalProps {
  visible: boolean;
  progress: ImportProgress;
  videoName?: string;
}

const getStageIcon = (stage: ImportProgress['stage']) => {
  switch (stage) {
    case 'copying':
      return <Upload size={32} color="#00ff88" />;
    case 'processing':
      return <FileVideo size={32} color="#00aaff" />;
    case 'generating_thumbnail':
      return <FileVideo size={32} color="#ffaa00" />;
    case 'extracting_metadata':
      return <Loader size={32} color="#00aaff" />;
    case 'complete':
      return <CheckCircle size={32} color="#00ff88" />;
    default:
      return <Upload size={32} color="#00ff88" />;
  }
};

const getStageColor = (stage: ImportProgress['stage']) => {
  switch (stage) {
    case 'copying':
      return '#00ff88';
    case 'processing':
      return '#00aaff';
    case 'generating_thumbnail':
      return '#ffaa00';
    case 'extracting_metadata':
      return '#00aaff';
    case 'complete':
      return '#00ff88';
    case 'error':
      return '#ff4444';
    default:
      return '#00ff88';
  }
};

export default function ImportProgressModal({
  visible,
  progress,
  videoName,
}: ImportProgressModalProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress.progress,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [progress.progress, progressAnim]);

  useEffect(() => {
    if (visible && progress.stage !== 'complete') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      const rotate = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      rotate.start();

      return () => {
        pulse.stop();
        rotate.stop();
      };
    } else {
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
    }
  }, [visible, progress.stage, pulseAnim, rotateAnim]);

  const stageColor = getStageColor(progress.stage);
  const progressPercent = Math.round(progress.progress * 100);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Animated.View 
            style={[
              styles.iconContainer,
              { 
                transform: [
                  { scale: pulseAnim },
                  { rotate: progress.stage === 'extracting_metadata' ? spin : '0deg' },
                ],
              },
            ]}
          >
            {getStageIcon(progress.stage)}
          </Animated.View>

          <Text style={styles.title}>Importing Video</Text>
          
          {videoName && (
            <Text style={styles.videoName} numberOfLines={1}>
              {videoName}
            </Text>
          )}

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressWidth,
                    backgroundColor: stageColor,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: stageColor }]}>
              {progressPercent}%
            </Text>
          </View>

          <Text style={styles.stageMessage}>{progress.message}</Text>

          <View style={styles.stagesContainer}>
            <StageIndicator
              label="Copying"
              isActive={progress.stage === 'copying'}
              isComplete={['processing', 'generating_thumbnail', 'extracting_metadata', 'complete'].includes(progress.stage)}
            />
            <View style={styles.stageDivider} />
            <StageIndicator
              label="Processing"
              isActive={progress.stage === 'processing'}
              isComplete={['generating_thumbnail', 'extracting_metadata', 'complete'].includes(progress.stage)}
            />
            <View style={styles.stageDivider} />
            <StageIndicator
              label="Thumbnail"
              isActive={progress.stage === 'generating_thumbnail'}
              isComplete={['extracting_metadata', 'complete'].includes(progress.stage)}
            />
            <View style={styles.stageDivider} />
            <StageIndicator
              label="Analyzing"
              isActive={progress.stage === 'extracting_metadata'}
              isComplete={progress.stage === 'complete'}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const StageIndicator = ({
  label,
  isActive,
  isComplete,
}: {
  label: string;
  isActive: boolean;
  isComplete: boolean;
}) => {
  const color = isComplete ? '#00ff88' : isActive ? '#00aaff' : 'rgba(255,255,255,0.3)';
  
  return (
    <View style={styles.stageIndicator}>
      <View
        style={[
          styles.stageDot,
          {
            backgroundColor: isComplete || isActive ? color : 'transparent',
            borderColor: color,
          },
        ]}
      />
      <Text style={[styles.stageLabel, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,255,136,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#ffffff',
    marginBottom: 8,
  },
  videoName: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 24,
    maxWidth: '100%',
  },
  progressContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700' as const,
    minWidth: 48,
    textAlign: 'right',
  },
  stageMessage: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 24,
    textAlign: 'center',
  },
  stagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  stageIndicator: {
    alignItems: 'center',
    gap: 6,
  },
  stageDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  stageLabel: {
    fontSize: 10,
    fontWeight: '500' as const,
  },
  stageDivider: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 4,
    marginBottom: 18,
  },
});
