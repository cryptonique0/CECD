/**
 * Testing Utilities
 * Helper functions for testing services and components
 */

export interface MockData {
  incidents: any[];
  users: any[];
  donations: any[];
  notifications: any[];
}

class TestingUtilities {
  /**
   * Generate mock incident
   */
  static generateMockIncident(overrides: any = {}): any {
    return {
      id: Math.floor(Math.random() * 10000),
      title: 'Test Incident ' + Math.random().toString(36).substr(2, 9),
      description: 'This is a test incident for development and testing purposes.',
      category: Math.floor(Math.random() * 5),
      severity: Math.floor(Math.random() * 4),
      latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
      longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
      reportedBy: `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      createdAt: Math.floor(Date.now() / 1000),
      status: 0,
      ...overrides,
    };
  }

  /**
   * Generate multiple mock incidents
   */
  static generateMockIncidents(count: number = 10): any[] {
    return Array.from({ length: count }, () => this.generateMockIncident());
  }

  /**
   * Generate mock donation
   */
  static generateMockDonation(overrides: any = {}): any {
    return {
      id: `donation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      donor: `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      amount: (Math.random() * 1000).toFixed(2),
      currency: ['cUSD', 'cEUR', 'cREAL'][Math.floor(Math.random() * 3)],
      incidentId: Math.floor(Math.random() * 10000),
      timestamp: Date.now(),
      txHash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      status: 'confirmed',
      ...overrides,
    };
  }

  /**
   * Generate mock user
   */
  static generateMockUser(overrides: any = {}): any {
    const firstName = ['John', 'Jane', 'Bob', 'Alice'][Math.floor(Math.random() * 4)];
    const lastName = ['Smith', 'Johnson', 'Williams', 'Brown'][Math.floor(Math.random() * 4)];

    return {
      id: Math.floor(Math.random() * 10000),
      address: `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      name: `${firstName} ${lastName}`,
      email: `user${Math.random().toString(36).substr(2, 9)}@example.com`,
      role: ['volunteer', 'citizen', 'leader'][Math.floor(Math.random() * 3)],
      joinedAt: Math.floor(Date.now() / 1000) - Math.random() * 10000000,
      ...overrides,
    };
  }

  /**
   * Generate mock notification
   */
  static generateMockNotification(overrides: any = {}): any {
    return {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: ['incident', 'alert', 'volunteer', 'announcement'][Math.floor(Math.random() * 4)],
      title: 'Test Notification',
      message: 'This is a test notification',
      severity: ['info', 'warning', 'error', 'critical'][Math.floor(Math.random() * 4)],
      timestamp: Date.now(),
      read: false,
      ...overrides,
    };
  }

  /**
   * Delay execution
   */
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Assert condition
   */
  static assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  /**
   * Assert equals
   */
  static assertEquals(actual: any, expected: any, message?: string): void {
    if (actual !== expected) {
      throw new Error(
        `Assertion failed: ${message || ''}\nExpected: ${expected}\nActual: ${actual}`
      );
    }
  }

  /**
   * Assert array contains
   */
  static assertArrayContains<T>(array: T[], item: T, message?: string): void {
    if (!array.includes(item)) {
      throw new Error(
        `Assertion failed: ${message || ''}\nArray does not contain item: ${item}`
      );
    }
  }

  /**
   * Create mock local storage
   */
  static createMockLocalStorage(): Storage {
    let store: Record<string, string> = {};

    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
      key: (index: number) => Object.keys(store)[index] || null,
      length: Object.keys(store).length,
    };
  }

  /**
   * Create mock fetch
   */
  static createMockFetch(responses: Record<string, any>) {
    return async (url: string, options?: any) => {
      const method = options?.method || 'GET';
      const key = `${method} ${url}`;

      const responseData = responses[key] || responses[url] || { ok: true, data: {} };

      return {
        ok: responseData.ok !== false,
        status: responseData.status || 200,
        statusText: responseData.statusText || 'OK',
        json: async () => responseData.data || responseData,
        text: async () => JSON.stringify(responseData.data || responseData),
        headers: new Map(),
      };
    };
  }

  /**
   * Simulate network delay
   */
  static async simulateNetworkDelay(minMs: number = 100, maxMs: number = 500): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    await this.delay(Math.floor(delay));
  }

  /**
   * Test performance of function
   */
  static async measurePerformance<T>(
    fn: () => Promise<T> | T,
    iterations: number = 1
  ): Promise<{ result: T; duration: number; avgDuration: number }> {
    const durations: number[] = [];

    let result: T;
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      result = await Promise.resolve(fn());
      const end = performance.now();
      durations.push(end - start);
    }

    const totalDuration = durations.reduce((a, b) => a + b, 0);
    const avgDuration = totalDuration / iterations;

    return {
      result: result!,
      duration: totalDuration,
      avgDuration,
    };
  }

  /**
   * Create test suite
   */
  static createTestSuite(name: string) {
    const tests: Array<{ name: string; fn: () => Promise<void> | void }> = [];
    let passed = 0;
    let failed = 0;

    return {
      test: (testName: string, fn: () => Promise<void> | void) => {
        tests.push({ name: testName, fn });
      },
      run: async () => {
        console.log(`\n📋 Test Suite: ${name}\n`);

        for (const test of tests) {
          try {
            await Promise.resolve(test.fn());
            console.log(`✅ ${test.name}`);
            passed++;
          } catch (error) {
            console.log(`❌ ${test.name}`);
            console.error(`   ${error}`);
            failed++;
          }
        }

        console.log(
          `\n📊 Results: ${passed} passed, ${failed} failed out of ${tests.length} tests\n`
        );

        return { passed, failed, total: tests.length };
      },
    };
  }
}

export default TestingUtilities;

/**
 * Helper to create test data
 */
export const testData = {
  incidents: TestingUtilities.generateMockIncidents(5),
  users: Array.from({ length: 5 }, () => TestingUtilities.generateMockUser()),
  donations: Array.from({ length: 5 }, () => TestingUtilities.generateMockDonation()),
  notifications: Array.from({ length: 5 }, () => TestingUtilities.generateMockNotification()),
};
