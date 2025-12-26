// frontend/src/services/storageService.ts
// Storage service for incident attachments (images/videos)

import { indexedDBService } from './indexedDBService';

export type StoredAttachment = {
  name: string;
  type: string;
  size: number;
  url: string;
  isVideo: boolean;
  cid?: string;
};

class StorageService {
  private token: string | undefined;

  constructor() {
    // Vite env var for Web3.Storage token
    this.token = (import.meta as any).env?.VITE_WEB3STORAGE_TOKEN;
  }

  async uploadFiles(files: File[], incidentId?: string): Promise<StoredAttachment[]> {
    if (!files || files.length === 0) return [];

    // If we have a Web3.Storage token, try uploading to IPFS
    if (this.token) {
      try {
        const mod = await import('web3.storage');
        const Web3Storage = (mod as any).Web3Storage || (mod as any).default?.Web3Storage || (mod as any);
        const client = new Web3Storage({ token: this.token });
        const cid = await client.put(files, { wrapWithDirectory: true });
        const attachments = files.map((f) => ({
          name: f.name,
          type: f.type,
          size: f.size,
          // Use public gateway for convenience
          url: `https://w3s.link/ipfs/${cid}/${encodeURIComponent(f.name)}`,
          isVideo: f.type.startsWith('video/'),
          cid,
        }));
        // Store in IndexedDB for local caching
        if (incidentId) {
          await indexedDBService.saveAttachments(incidentId, attachments);
        }
        return attachments;
      } catch (err) {
        console.warn('Web3.Storage not available, falling back to IndexedDB:', err);
        // Fallthrough to IndexedDB
      }
    }

    // Fallback: Convert files to base64 data URLs for persistence
    const attachments = await Promise.all(
      files.map(async (f) => {
        const dataUrl = await this.fileToDataURL(f);
        return {
          name: f.name,
          type: f.type,
          size: f.size,
          url: dataUrl,
          isVideo: f.type.startsWith('video/'),
        };
      })
    );

    // Store in IndexedDB for persistence
    if (incidentId) {
      await indexedDBService.saveAttachments(incidentId, attachments);
    }

    return attachments;
  }

  private fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async getAttachments(incidentId: string): Promise<StoredAttachment[] | null> {
    return await indexedDBService.getAttachments(incidentId);
  }

  async getAllAttachments(): Promise<Map<string, StoredAttachment[]>> {
    return await indexedDBService.getAllAttachments();
  }

  async saveAttachments(incidentId: string, attachments: StoredAttachment[]): Promise<void> {
    return await indexedDBService.saveAttachments(incidentId, attachments);
  }

  async deleteAttachments(incidentId: string): Promise<void> {
    return await indexedDBService.deleteAttachments(incidentId);
  }
}

export const storageService = new StorageService();
