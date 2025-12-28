/**
 * HTTP Client with Advanced Features
 * Handles API requests with retry logic, caching, and request pooling
 */

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheDuration?: number;
}

export interface CachedRequest {
  data: any;
  timestamp: number;
  duration: number;
}

class HTTPClient {
  private baseURL: string;
  private cache: Map<string, CachedRequest> = new Map();
  private requestPool: Map<string, Promise<any>> = new Map();
  private defaultTimeout = 30000; // 30 seconds
  private defaultRetries = 3;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  /**
   * Make HTTP request with advanced features
   */
  async request<T = any>(
    url: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const fullURL = this.buildURL(url);
    const cacheKey = `${config.method || 'GET'}:${fullURL}`;

    // Check cache
    if (config.cache !== false && config.method !== 'POST' && config.method !== 'DELETE') {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached as T;
      }
    }

    // Check request pool to avoid duplicate requests
    if (this.requestPool.has(cacheKey)) {
      return this.requestPool.get(cacheKey)!;
    }

    // Create and pool request
    const requestPromise = this.executeRequest<T>(fullURL, config);
    this.requestPool.set(cacheKey, requestPromise);

    try {
      const response = await requestPromise;

      // Cache response if enabled
      if (config.cache !== false && config.method !== 'POST' && config.method !== 'DELETE') {
        this.setCache(cacheKey, response, config.cacheDuration || 5 * 60 * 1000);
      }

      return response;
    } finally {
      this.requestPool.delete(cacheKey);
    }
  }

  /**
   * Execute request with retry logic
   */
  private async executeRequest<T>(
    url: string,
    config: RequestConfig,
    attempt: number = 1
  ): Promise<T> {
    const retries = config.retries ?? this.defaultRetries;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        config.timeout ?? this.defaultTimeout
      );

      const response = await fetch(url, {
        method: config.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (attempt < retries && this.isRetryableError(error)) {
        // Exponential backoff
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeRequest<T>(url, config, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    // Network errors, timeouts, 5xx errors
    return (
      error.name === 'AbortError' ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('5xx')
    );
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(
    url: string,
    body?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(url, { ...config, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    url: string,
    body?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(url, { ...config, method: 'PUT', body });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    url: string,
    body?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(url, { ...config, method: 'PATCH', body });
  }

  /**
   * Build full URL
   */
  private buildURL(url: string): string {
    if (url.startsWith('http')) {
      return url;
    }
    return `${this.baseURL}${url}`;
  }

  /**
   * Get from cache
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.duration) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Set cache
   */
  private setCache(key: string, data: any, duration: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      duration,
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Set base URL
   */
  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }
}

export const httpClient = new HTTPClient();
