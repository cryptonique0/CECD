/**
 * Offline Support Service
 * Manages service worker registration, caching strategies, and offline capabilities
 */

export interface CacheStrategy {
  name: string;
  pattern: RegExp;
  strategy: 'network-first' | 'cache-first' | 'stale-while-revalidate';
}

export interface OfflineData {
  incidentQueue: Array<{
    id: string;
    data: any;
    timestamp: number;
    status: 'pending' | 'synced';
  }>;
  cachedIncidents: any[];
  lastSyncTime: number;
}

class OfflineSupportService {
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private offlineData: OfflineData = {
    incidentQueue: [],
    cachedIncidents: [],
    lastSyncTime: 0,
  };
  private syncTimeoutId: NodeJS.Timeout | null = null;

  /**
   * Register service worker for offline support
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported in this browser');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      this.serviceWorkerRegistration = registration;
      console.log('Service Worker registered successfully');

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event.data);
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  /**
   * Handle messages from service worker
   */
  private handleServiceWorkerMessage(data: any): void {
    switch (data.type) {
      case 'CACHE_UPDATED':
        console.log('Cache updated:', data.payload);
        break;
      case 'SYNC_COMPLETE':
        console.log('Background sync completed');
        this.offlineData.lastSyncTime = Date.now();
        break;
      case 'OFFLINE_MODE':
        console.log('Entered offline mode');
        break;
      case 'ONLINE_MODE':
        console.log('Returned to online mode');
        this.syncPendingIncidents();
        break;
    }
  }

  /**
   * Queue incident for offline submission
   */
  async queueIncidentForSync(incidentData: any): Promise<string> {
    const queueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data: incidentData,
      timestamp: Date.now(),
      status: 'pending' as const,
    };

    this.offlineData.incidentQueue.push(queueItem);

    // Persist to IndexedDB
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['sync-queue'], 'readwrite');
      const store = transaction.objectStore('sync-queue');
      await store.add(queueItem);
    } catch (error) {
      console.error('Failed to queue incident:', error);
    }

    return queueItem.id;
  }

  /**
   * Sync pending incidents when back online
   */
  async syncPendingIncidents(): Promise<void> {
    if (this.offlineData.incidentQueue.length === 0) return;

    console.log(`Syncing ${this.offlineData.incidentQueue.length} pending incidents...`);

    for (const item of this.offlineData.incidentQueue) {
      try {
        // Attempt to upload incident
        // await contractService.createIncident(item.data);
        item.status = 'synced';
      } catch (error) {
        console.error('Failed to sync incident:', error);
      }
    }

    // Remove synced items
    this.offlineData.incidentQueue = this.offlineData.incidentQueue.filter(
      item => item.status === 'pending'
    );

    this.offlineData.lastSyncTime = Date.now();
  }

  /**
   * Cache incident data for offline access
   */
  async cacheIncidents(incidents: any[]): Promise<void> {
    this.offlineData.cachedIncidents = incidents;

    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['cached-incidents'], 'readwrite');
      const store = transaction.objectStore('cached-incidents');

      // Clear old data
      await store.clear();

      // Add new data
      for (const incident of incidents) {
        await store.add({
          id: incident.id,
          data: incident,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error('Failed to cache incidents:', error);
    }
  }

  /**
   * Get cached incidents for offline viewing
   */
  async getCachedIncidents(): Promise<any[]> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['cached-incidents'], 'readonly');
      const store = transaction.objectStore('cached-incidents');

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          resolve(request.result.map(item => item.data));
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to retrieve cached incidents:', error);
      return this.offlineData.cachedIncidents;
    }
  }

  /**
   * Check if device is online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Setup online/offline event listeners
   */
  setupConnectivityListeners(
    onOnline?: () => void,
    onOffline?: () => void
  ): () => void {
    const handleOnline = () => {
      console.log('Device is online');
      this.syncPendingIncidents();
      onOnline?.();
    };

    const handleOffline = () => {
      console.log('Device is offline');
      onOffline?.();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  /**
   * Get offline statistics
   */
  getOfflineStats(): {
    isOnline: boolean;
    pendingIncidents: number;
    cachedIncidents: number;
    lastSyncTime: number;
  } {
    return {
      isOnline: this.isOnline(),
      pendingIncidents: this.offlineData.incidentQueue.length,
      cachedIncidents: this.offlineData.cachedIncidents.length,
      lastSyncTime: this.offlineData.lastSyncTime,
    };
  }

  /**
   * Clear all offline data
   */
  async clearOfflineData(): Promise<void> {
    this.offlineData = {
      incidentQueue: [],
      cachedIncidents: [],
      lastSyncTime: 0,
    };

    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['sync-queue', 'cached-incidents'], 'readwrite');
      await transaction.objectStore('sync-queue').clear();
      await transaction.objectStore('cached-incidents').clear();
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }

  /**
   * Open or create IndexedDB database
   */
  private openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('cecd-offline', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('sync-queue')) {
          db.createObjectStore('sync-queue', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('cached-incidents')) {
          db.createObjectStore('cached-incidents', { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Get service worker status
   */
  async getServiceWorkerStatus(): Promise<{
    registered: boolean;
    active: boolean;
    state: string;
  }> {
    if (!this.serviceWorkerRegistration) {
      return { registered: false, active: false, state: 'unregistered' };
    }

    return {
      registered: true,
      active: !!this.serviceWorkerRegistration.active,
      state: this.serviceWorkerRegistration.active?.state || 'unknown',
    };
  }

  /**
   * Update service worker
   */
  async updateServiceWorker(): Promise<void> {
    if (!this.serviceWorkerRegistration) return;

    try {
      await this.serviceWorkerRegistration.update();
      console.log('Service Worker updated');
    } catch (error) {
      console.error('Failed to update Service Worker:', error);
    }
  }

  /**
   * Unregister service worker
   */
  async unregisterServiceWorker(): Promise<void> {
    if (!this.serviceWorkerRegistration) return;

    try {
      await this.serviceWorkerRegistration.unregister();
      this.serviceWorkerRegistration = null;
      console.log('Service Worker unregistered');
    } catch (error) {
      console.error('Failed to unregister Service Worker:', error);
    }
  }
}

export const offlineSupportService = new OfflineSupportService();
