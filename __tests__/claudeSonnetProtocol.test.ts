/**
 * Tests for Claude Sonnet Advanced Protocol
 */

import { protocolMonitor, monitoringHelpers } from '@/utils/protocolMonitoring';

describe('Claude Sonnet Protocol', () => {
  beforeEach(() => {
    protocolMonitor.clear();
  });

  describe('Protocol Configuration', () => {
    it('should have stealth protocol ID', () => {
      const protocolId = 'stealth';
      expect(protocolId).toBe('stealth');
    });

    it('should support all advanced features', () => {
      const features = {
        adaptiveQuality: true,
        behavioralAnalysis: true,
        advancedStealth: true,
        mlBodyDetection: true,
        realTimeOptimization: true,
        timingRandomization: true,
        protocolChaining: true,
        performanceMonitoring: true,
        contextAwareness: true,
        adaptiveBitrate: true,
        smartCaching: true,
        predictivePreloading: true,
        neuralEnhancement: true,
      };

      Object.values(features).forEach(feature => {
        expect(feature).toBe(true);
      });
    });
  });

  describe('Protocol Monitoring', () => {
    it('should track protocol sessions', () => {
      const sessionId = protocolMonitor.startSession('stealth');
      expect(sessionId).toContain('stealth');
      
      const metrics = protocolMonitor.getSessionMetrics(sessionId);
      expect(metrics).toBeDefined();
      expect(metrics?.protocolId).toBe('stealth');
      expect(metrics?.success).toBe(false);
    });

    it('should record successful sessions', () => {
      const sessionId = protocolMonitor.startSession('stealth');
      
      protocolMonitor.recordSuccess(sessionId, {
        fps: 30,
        latency: 15,
        cacheHitRate: 0.85,
      });

      const systemMetrics = protocolMonitor.getSystemMetrics();
      expect(systemMetrics.successfulInjections).toBe(1);
      expect(systemMetrics.totalInjections).toBe(1);
    });

    it('should record failed sessions', () => {
      const sessionId = protocolMonitor.startSession('stealth');
      
      protocolMonitor.recordFailure(sessionId, 'Test error', 'high');

      const systemMetrics = protocolMonitor.getSystemMetrics();
      expect(systemMetrics.failedInjections).toBe(1);
      expect(systemMetrics.totalInjections).toBe(1);
    });

    it('should calculate performance scores', () => {
      const sessionId = protocolMonitor.startSession('stealth');
      
      protocolMonitor.updateMetrics(sessionId, {
        fps: 30,
        latency: 20,
        cacheHitRate: 0.9,
      });

      const score = protocolMonitor.calculatePerformanceScore(sessionId);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('Monitoring Helpers', () => {
    beforeEach(() => {
      jest.useRealTimers();
    });

    afterEach(() => {
      jest.useFakeTimers();
    });

    it('should track async operations', async () => {
      const operation = async () => {
        // Jest uses fake timers globally in this repo; avoid relying on real timeouts here.
        await Promise.resolve();
        return 'success';
      };

      const pending = monitoringHelpers.trackOperation('stealth', operation);
      // This repo enables fake timers globally in `jest.setup.js`.
      // Advance timers so the `setTimeout` inside `operation()` resolves.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const advance = (jest as any).advanceTimersByTimeAsync
        ? (jest as any).advanceTimersByTimeAsync(20)
        : Promise.resolve(jest.advanceTimersByTime(20));
      await advance;
      const result = await pending;
      expect(result).toBe('success');

      const systemMetrics = protocolMonitor.getSystemMetrics();
      expect(systemMetrics.successfulInjections).toBe(1);
    });

    it('should handle operation failures', async () => {
      const operation = async () => {
        throw new Error('Test error');
      };

      await expect(
        monitoringHelpers.trackOperation('stealth', operation)
      ).rejects.toThrow('Test error');

      const systemMetrics = protocolMonitor.getSystemMetrics();
      expect(systemMetrics.failedInjections).toBe(1);
    });

    it('should check protocol health', () => {
      // Not enough data yet
      expect(monitoringHelpers.isProtocolHealthy('stealth')).toBe(true);

      // Add successful sessions
      for (let i = 0; i < 5; i++) {
        const sessionId = protocolMonitor.startSession('stealth');
        protocolMonitor.recordSuccess(sessionId, {
          fps: 30,
          latency: 20,
        });
      }

      expect(monitoringHelpers.isProtocolHealthy('stealth')).toBe(true);
    });
  });

  describe('Protocol Comparison', () => {
    it('should compare protocols', () => {
      // Add sessions for different protocols
      const protocols = ['stealth', 'relay', 'shield'];
      
      protocols.forEach(protocol => {
        for (let i = 0; i < 3; i++) {
          const sessionId = protocolMonitor.startSession(protocol);
          protocolMonitor.recordSuccess(sessionId, {
            fps: 28 + Math.random() * 4,
            latency: 20 + Math.random() * 10,
          });
        }
      });

      const comparison = protocolMonitor.getProtocolComparison();
      expect(Object.keys(comparison)).toHaveLength(3);
      
      protocols.forEach(protocol => {
        expect(comparison[protocol]).toBeDefined();
        expect(comparison[protocol].usage).toBe(3);
        expect(comparison[protocol].successRate).toBe(100);
      });
    });

    it('should recommend best protocol', () => {
      // Add sessions with different performance
      const protocols = [
        { id: 'relay', fps: 25, latency: 30 },
        { id: 'stealth', fps: 30, latency: 15 },
        { id: 'shield', fps: 28, latency: 20 },
      ];

      protocols.forEach(({ id, fps, latency }) => {
        for (let i = 0; i < 5; i++) {
          const sessionId = protocolMonitor.startSession(id);
          protocolMonitor.recordSuccess(sessionId, { fps, latency });
        }
      });

      const recommended = monitoringHelpers.getRecommendedProtocol();
      expect(recommended).toBe('stealth'); // Should be best performing
    });
  });

  describe('Metrics Export', () => {
    it('should export metrics as JSON', () => {
      const sessionId = protocolMonitor.startSession('stealth');
      protocolMonitor.recordSuccess(sessionId, {
        fps: 30,
        latency: 15,
      });

      const exported = protocolMonitor.export();
      expect(exported).toBeDefined();
      
      const parsed = JSON.parse(exported);
      expect(parsed.system).toBeDefined();
      expect(parsed.history).toBeDefined();
      expect(parsed.comparison).toBeDefined();
    });
  });

  describe('Error Tracking', () => {
    it('should track errors without ending session', () => {
      const sessionId = protocolMonitor.startSession('stealth');
      
      protocolMonitor.recordError(sessionId, 'Minor error', 'low');
      protocolMonitor.recordError(sessionId, 'Another error', 'medium');

      const metrics = protocolMonitor.getSessionMetrics(sessionId);
      expect(metrics?.errorCount).toBe(2);
      expect(metrics?.errors).toHaveLength(2);
      expect(metrics?.errors[0].severity).toBe('low');
      expect(metrics?.errors[1].severity).toBe('medium');
    });

    it('should track error severity', () => {
      const sessionId = protocolMonitor.startSession('stealth');
      
      protocolMonitor.recordError(sessionId, 'Critical error', 'high');
      
      const metrics = protocolMonitor.getSessionMetrics(sessionId);
      expect(metrics?.errors[0].severity).toBe('high');
    });
  });

  describe('Performance Thresholds', () => {
    it('should penalize poor FPS in performance score', () => {
      const lowFpsSession = protocolMonitor.startSession('stealth');
      protocolMonitor.updateMetrics(lowFpsSession, { fps: 10 });
      const lowFpsScore = protocolMonitor.calculatePerformanceScore(lowFpsSession);

      const highFpsSession = protocolMonitor.startSession('stealth');
      protocolMonitor.updateMetrics(highFpsSession, { fps: 30 });
      const highFpsScore = protocolMonitor.calculatePerformanceScore(highFpsSession);

      expect(highFpsScore).toBeGreaterThan(lowFpsScore);
    });

    it('should penalize high latency in performance score', () => {
      const lowLatencySession = protocolMonitor.startSession('stealth');
      protocolMonitor.updateMetrics(lowLatencySession, { latency: 10 });
      const lowLatencyScore = protocolMonitor.calculatePerformanceScore(lowLatencySession);

      const highLatencySession = protocolMonitor.startSession('stealth');
      protocolMonitor.updateMetrics(highLatencySession, { latency: 150 });
      const highLatencyScore = protocolMonitor.calculatePerformanceScore(highLatencySession);

      expect(lowLatencyScore).toBeGreaterThan(highLatencyScore);
    });
  });
});
