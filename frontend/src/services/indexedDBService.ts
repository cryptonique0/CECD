// frontend/src/services/indexedDBService.ts
// IndexedDB wrapper for persistent local storage of incident attachments

export type StoredIncidentAttachment = {
  incidentId: string;
  attachments: Array<{
    name: string;
    type: string;
    size: number;
    url: string;
    isVideo: boolean;
    cid?: string;
  }>;
  timestamp: number;
};

const DB_NAME = 'cecd-storage';
const STORE_NAME = 'incident-attachments';
const DB_VERSION = 1;

class IndexedDBService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'incidentId' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });

    return this.dbPromise;
  }

  async saveAttachments(incidentId: string, attachments: StoredIncidentAttachment['attachments']): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const data: StoredIncidentAttachment = {
      incidentId,
      attachments,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAttachments(incidentId: string): Promise<StoredIncidentAttachment['attachments'] | null> {
    const db = await this.openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(incidentId);
      request.onsuccess = () => {
        const result = request.result as StoredIncidentAttachment | undefined;
        resolve(result?.attachments || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllAttachments(): Promise<Map<string, StoredIncidentAttachment['attachments']>> {
    const db = await this.openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const results = request.result as StoredIncidentAttachment[];
        const map = new Map<string, StoredIncidentAttachment['attachments']>();
        results.forEach((item) => map.set(item.incidentId, item.attachments));
        resolve(map);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAttachments(incidentId: string): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(incidentId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll(): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const indexedDBService = new IndexedDBService();
