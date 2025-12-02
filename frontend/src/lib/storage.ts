export interface StorageItem<T> {
  value: T;
  expires?: number;
}

export class LocalStorageService {
  static set<T>(key: string, value: T, ttl?: number): void {
    const item: StorageItem<T> = {
      value,
      expires: ttl ? Date.now() + ttl : undefined,
    };
    localStorage.setItem(key, JSON.stringify(item));
  }

  static get<T>(key: string): T | null {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
      const item: StorageItem<T> = JSON.parse(itemStr);
      if (item.expires && Date.now() > item.expires) {
        localStorage.removeItem(key);
        return null;
      }
      return item.value;
    } catch {
      return null;
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }

  static clear(): void {
    localStorage.clear();
  }
}
