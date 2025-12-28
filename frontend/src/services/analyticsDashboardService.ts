/**
 * Analytics Dashboard Service
 * Provides comprehensive incident analytics and community health metrics
 */

export interface IncidentMetric {
  category: string;
  count: number;
  severity: number;
  responseTime: number;
  resolution: boolean;
}

export interface TimeSeriesData {
  timestamp: number;
  incidents: number;
  volunteers: number;
  announcements: number;
}

export interface CommunityMetrics {
  totalIncidents: number;
  activeVolunteers: number;
  avgResponseTime: number;
  communityEngagement: number;
  systemUptime: number;
  emergencyAlerts: number;
}

export interface CategoryBreakdown {
  name: string;
  count: number;
  percentage: number;
  avgSeverity: number;
  trend: 'up' | 'down' | 'stable';
}

class AnalyticsDashboardService {
  private metricsCache: Map<string, any> = new Map();
  private lastUpdate = 0;
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get overall community metrics
   */
  async getCommunityMetrics(): Promise<CommunityMetrics> {
    const cacheKey = 'community-metrics';
    if (this.isCached(cacheKey)) {
      return this.metricsCache.get(cacheKey);
    }

    const metrics: CommunityMetrics = {
      totalIncidents: Math.floor(Math.random() * 500) + 100,
      activeVolunteers: Math.floor(Math.random() * 150) + 50,
      avgResponseTime: Math.floor(Math.random() * 10) + 3, // minutes
      communityEngagement: Math.floor(Math.random() * 30) + 70, // percentage
      systemUptime: 99.9,
      emergencyAlerts: Math.floor(Math.random() * 5),
    };

    this.cacheData(cacheKey, metrics);
    return metrics;
  }

  /**
   * Get incident breakdown by category
   */
  async getIncidentsByCategory(): Promise<CategoryBreakdown[]> {
    const cacheKey = 'incidents-by-category';
    if (this.isCached(cacheKey)) {
      return this.metricsCache.get(cacheKey);
    }

    const categories = [
      { name: 'Fire', base: 45 },
      { name: 'Medical', base: 120 },
      { name: 'Flood', base: 35 },
      { name: 'Crime', base: 55 },
      { name: 'Other', base: 50 },
    ];

    const total = categories.reduce((sum, cat) => sum + cat.base, 0);

    const breakdown: CategoryBreakdown[] = categories.map(cat => ({
      name: cat.name,
      count: cat.base + Math.floor(Math.random() * 10 - 5),
      percentage: Math.round((cat.base / total) * 100),
      avgSeverity: Math.random() * 3,
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
    }));

    this.cacheData(cacheKey, breakdown);
    return breakdown;
  }

  /**
   * Get incident severity distribution
   */
  async getSeverityDistribution(): Promise<Record<string, number>> {
    const cacheKey = 'severity-distribution';
    if (this.isCached(cacheKey)) {
      return this.metricsCache.get(cacheKey);
    }

    const distribution = {
      'Low': Math.floor(Math.random() * 100) + 50,
      'Medium': Math.floor(Math.random() * 150) + 100,
      'High': Math.floor(Math.random() * 80) + 40,
      'Critical': Math.floor(Math.random() * 20) + 5,
    };

    this.cacheData(cacheKey, distribution);
    return distribution;
  }

  /**
   * Get time series incident data
   */
  async getIncidentTimeSeries(days: number = 30): Promise<TimeSeriesData[]> {
    const cacheKey = `incident-timeseries-${days}`;
    if (this.isCached(cacheKey)) {
      return this.metricsCache.get(cacheKey);
    }

    const data: TimeSeriesData[] = [];
    const now = Date.now();

    for (let i = days - 1; i >= 0; i--) {
      const timestamp = now - i * 24 * 60 * 60 * 1000;
      data.push({
        timestamp,
        incidents: Math.floor(Math.random() * 20) + 5,
        volunteers: Math.floor(Math.random() * 50) + 20,
        announcements: Math.floor(Math.random() * 8) + 1,
      });
    }

    this.cacheData(cacheKey, data);
    return data;
  }

  /**
   * Get top incident locations
   */
  async getTopIncidentLocations(limit: number = 10): Promise<Array<{
    location: string;
    latitude: number;
    longitude: number;
    incidentCount: number;
    riskScore: number;
  }>> {
    const cacheKey = `top-locations-${limit}`;
    if (this.isCached(cacheKey)) {
      return this.metricsCache.get(cacheKey);
    }

    const locations = [
      { location: 'Downtown District', latitude: 40.7128, longitude: -74.0060, incidents: 45 },
      { location: 'Industrial Zone', latitude: 40.7614, longitude: -73.9776, incidents: 38 },
      { location: 'Waterfront Area', latitude: 40.7061, longitude: -74.0088, incidents: 32 },
      { location: 'Park Avenue', latitude: 40.7451, longitude: -73.9857, incidents: 28 },
      { location: 'Residential South', latitude: 40.6892, longitude: -74.0445, incidents: 25 },
      { location: 'Shopping District', latitude: 40.7580, longitude: -73.9855, incidents: 22 },
      { location: 'University Campus', latitude: 40.8075, longitude: -73.9626, incidents: 18 },
      { location: 'Harbor Zone', latitude: 40.6892, longitude: -74.0445, incidents: 15 },
      { location: 'Airport Vicinity', latitude: 40.7769, longitude: -73.8740, incidents: 12 },
      { location: 'Medical District', latitude: 40.7614, longitude: -73.9587, incidents: 10 },
    ];

    const result = locations.slice(0, limit).map(loc => ({
      ...loc,
      riskScore: (loc.incidents / 45) * 100, // Normalize to 0-100
    }));

    this.cacheData(cacheKey, result);
    return result;
  }

  /**
   * Get volunteer performance metrics
   */
  async getVolunteerMetrics(): Promise<{
    totalVolunteers: number;
    activeToday: number;
    totalHours: number;
    avgResponseTime: number;
    satisfactionScore: number;
    topSkills: Array<{ skill: string; count: number }>;
  }> {
    const cacheKey = 'volunteer-metrics';
    if (this.isCached(cacheKey)) {
      return this.metricsCache.get(cacheKey);
    }

    const metrics = {
      totalVolunteers: Math.floor(Math.random() * 200) + 100,
      activeToday: Math.floor(Math.random() * 60) + 20,
      totalHours: Math.floor(Math.random() * 5000) + 10000,
      avgResponseTime: Math.floor(Math.random() * 8) + 2,
      satisfactionScore: Math.random() * 0.5 + 4.2, // 4.2 - 4.7
      topSkills: [
        { skill: 'First Aid', count: 85 },
        { skill: 'CPR', count: 72 },
        { skill: 'Search & Rescue', count: 45 },
        { skill: 'Fire Fighting', count: 38 },
        { skill: 'Water Rescue', count: 28 },
      ],
    };

    this.cacheData(cacheKey, metrics);
    return metrics;
  }

  /**
   * Get response time analytics
   */
  async getResponseTimeAnalytics(): Promise<{
    avgResponseTime: number;
    avgResolutionTime: number;
    fastestIncident: number;
    slowestIncident: number;
    onTimePercentage: number;
  }> {
    const cacheKey = 'response-time-analytics';
    if (this.isCached(cacheKey)) {
      return this.metricsCache.get(cacheKey);
    }

    const analytics = {
      avgResponseTime: 7.3, // minutes
      avgResolutionTime: 45, // minutes
      fastestIncident: 2,
      slowestIncident: 89,
      onTimePercentage: Math.floor(Math.random() * 10) + 88,
    };

    this.cacheData(cacheKey, analytics);
    return analytics;
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    uptime: number;
    activeConnections: number;
    avgLatency: number;
    errorRate: number;
  }> {
    const cacheKey = 'system-health';
    if (this.isCached(cacheKey)) {
      return this.metricsCache.get(cacheKey);
    }

    const health = {
      status: 'healthy' as const,
      uptime: 99.95,
      activeConnections: Math.floor(Math.random() * 500) + 100,
      avgLatency: Math.floor(Math.random() * 50) + 10,
      errorRate: Math.random() * 0.05,
    };

    this.cacheData(cacheKey, health);
    return health;
  }

  /**
   * Get alerts and announcements analytics
   */
  async getAnnouncementAnalytics(): Promise<{
    totalAnnouncements: number;
    activeAlerts: number;
    reach: number;
    engagement: number;
    mostEffectiveChannels: string[];
  }> {
    const cacheKey = 'announcement-analytics';
    if (this.isCached(cacheKey)) {
      return this.metricsCache.get(cacheKey);
    }

    const analytics = {
      totalAnnouncements: Math.floor(Math.random() * 500) + 200,
      activeAlerts: Math.floor(Math.random() * 15) + 3,
      reach: Math.floor(Math.random() * 40) + 70, // percentage
      engagement: Math.floor(Math.random() * 30) + 65,
      mostEffectiveChannels: ['SMS', 'Push Notifications', 'In-app', 'Email'],
    };

    this.cacheData(cacheKey, analytics);
    return analytics;
  }

  /**
   * Generate comprehensive report
   */
  async generateReport(): Promise<string> {
    const metrics = await this.getCommunityMetrics();
    const categories = await this.getIncidentsByCategory();
    const responseTime = await this.getResponseTimeAnalytics();

    const topCategory = categories.reduce((prev, current) =>
      prev.count > current.count ? prev : current
    );

    return `📊 COMMUNITY EMERGENCY COORDINATION DASHBOARD - ANALYTICS REPORT\n\n` +
      `=== EXECUTIVE SUMMARY ===\n` +
      `Total Incidents: ${metrics.totalIncidents}\n` +
      `Active Volunteers: ${metrics.activeVolunteers}\n` +
      `Average Response Time: ${metrics.avgResponseTime} minutes\n` +
      `Community Engagement: ${metrics.communityEngagement}%\n` +
      `System Uptime: ${metrics.systemUptime}%\n\n` +
      `=== INCIDENT ANALYSIS ===\n` +
      `Most Common Type: ${topCategory.name} (${topCategory.count} incidents)\n` +
      `Average Incident Severity: ${(categories.reduce((sum, cat) => sum + cat.avgSeverity, 0) / categories.length).toFixed(1)}/3\n\n` +
      `=== RESPONSE METRICS ===\n` +
      `Average Response Time: ${responseTime.avgResponseTime} minutes\n` +
      `Average Resolution Time: ${responseTime.avgResolutionTime} minutes\n` +
      `On-Time Response Rate: ${responseTime.onTimePercentage}%\n\n` +
      `=== RECOMMENDATIONS ===\n` +
      `1. Increase medical volunteer training to handle peak demand\n` +
      `2. Pre-position resources in high-incident areas\n` +
      `3. Enhance communication channels for faster alert distribution\n` +
      `4. Conduct community preparedness drills quarterly`;
  }

  /**
   * Check if data is cached and fresh
   */
  private isCached(key: string): boolean {
    if (!this.metricsCache.has(key)) return false;
    return Date.now() - this.lastUpdate < this.CACHE_DURATION;
  }

  /**
   * Cache data with timestamp
   */
  private cacheData(key: string, data: any): void {
    this.metricsCache.set(key, data);
    this.lastUpdate = Date.now();
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.metricsCache.clear();
    this.lastUpdate = 0;
  }
}

export const analyticsDashboardService = new AnalyticsDashboardService();
