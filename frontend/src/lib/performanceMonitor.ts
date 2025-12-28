/**
 * Performance Monitoring Utility
 * Tracks performance metrics and provides optimization insights
 */

export interface PerformanceMetric {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
  category: string;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private observers: Set<(metric: PerformanceMetric) => void> = new Set();
  private thresholds: Record<string, number> = {
    'api-call': 3000,
    'ai-processing': 5000,
    'blockchain': 10000,
    'data-fetch': 2000,
  };

  /**
   * Start measuring performance
   */
  start(name: string, category: string = 'general'): string {
    const id = `${name}-${Date.now()}`;
    const startTime = performance.now();

    return id;
  }

  /**
   * End measurement and record metric
   */
  end(id: string, metadata?: Record<string, any>): PerformanceMetric | null {
    const [name] = id.split('-');
    const parts = id.split('-');
    const startTime = parseInt(parts[parts.length - 1]);
    const endTime = performance.now();
    const duration = endTime - startTime;
    const category = metadata?.category || 'general';

    const metric: PerformanceMetric = {
      name,
      duration,
      startTime,
      endTime,
      category,
      metadata,
    };

    this.metrics.set(id, metric);

    // Check if threshold exceeded
    const threshold = this.thresholds[category];
    if (threshold && duration > threshold) {
      console.warn(`⚠️ Performance: ${name} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`);
    }

    this.notifyObservers(metric);
    return metric;
  }

  /**
   * Subscribe to metric updates
   */
  subscribe(callback: (metric: PerformanceMetric) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  /**
   * Notify all observers
   */
  private notifyObservers(metric: PerformanceMetric): void {
    this.observers.forEach(callback => callback(metric));
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get metrics by category
   */
  getMetricsByCategory(category: string): PerformanceMetric[] {
    return Array.from(this.metrics.values()).filter(m => m.category === category);
  }

  /**
   * Get average duration for category
   */
  getAverageDuration(category: string): number {
    const metrics = this.getMetricsByCategory(category);
    if (metrics.length === 0) return 0;

    const sum = metrics.reduce((acc, m) => acc + m.duration, 0);
    return sum / metrics.length;
  }

  /**
   * Get performance report
   */
  getReport(): {
    categories: Record<string, {
      count: number;
      avgDuration: number;
      minDuration: number;
      maxDuration: number;
      slowMetrics: PerformanceMetric[];
    }>;
    totalMetrics: number;
    timestamp: number;
  } {
    const categories: Record<string, PerformanceMetric[]> = {};

    // Group by category
    this.metrics.forEach(metric => {
      if (!categories[metric.category]) {
        categories[metric.category] = [];
      }
      categories[metric.category].push(metric);
    });

    const report: any = {
      categories: {},
      totalMetrics: this.metrics.size,
      timestamp: Date.now(),
    };

    Object.entries(categories).forEach(([category, metrics]) => {
      const durations = metrics.map(m => m.duration);
      const slowMetrics = metrics.filter(m => {
        const threshold = this.thresholds[category] || Infinity;
        return m.duration > threshold;
      });

      report.categories[category] = {
        count: metrics.length,
        avgDuration: durations.reduce((a, b) => a + b, 0) / metrics.length,
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations),
        slowMetrics: slowMetrics.slice(0, 5), // Top 5 slowest
      };
    });

    return report;
  }

  /**
   * Clear metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Set performance threshold
   */
  setThreshold(category: string, ms: number): void {
    this.thresholds[category] = ms;
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const report = this.getReport();

    Object.entries(report.categories).forEach(([category, stats]) => {
      const typedStats = stats as any;
      if (typedStats.avgDuration > (this.thresholds[category] || 5000)) {
        recommendations.push(
          `⚡ ${category}: Average duration is ${typedStats.avgDuration.toFixed(0)}ms, consider optimization`
        );
      }

      if (typedStats.slowMetrics.length > 0) {
        recommendations.push(
          `🐢 ${category}: ${typedStats.slowMetrics.length} operations exceeded threshold`
        );
      }
    });

    return recommendations;
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance decorator for async functions
 */
export function measurePerformance(
  category: string,
  name?: string
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const measureName = name || `${target.name}.${propertyKey}`;
      const id = performanceMonitor.start(measureName, category);

      try {
        const result = await originalMethod.apply(this, args);
        performanceMonitor.end(id, { category });
        return result;
      } catch (error) {
        performanceMonitor.end(id, { category, error: true });
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Hook for React component performance monitoring
 */
export function usePerformanceMonitor(
  componentName: string,
  category: string = 'react-component'
) {
  return {
    start: (name: string) => performanceMonitor.start(`${componentName}.${name}`, category),
    end: (id: string, metadata?: Record<string, any>) => 
      performanceMonitor.end(id, { ...metadata, category }),
  };
}
