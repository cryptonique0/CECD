// frontend/src/services/storageService.ts
// Storage service for incident attachments (images/videos)

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

  async uploadFiles(files: File[]): Promise<StoredAttachment[]> {
    if (!files || files.length === 0) return [];

    // If we have a Web3.Storage token, try uploading to IPFS
    if (this.token) {
      try {
        const mod = await import('web3.storage');
        const Web3Storage = (mod as any).Web3Storage || (mod as any).default?.Web3Storage || (mod as any);
        const client = new Web3Storage({ token: this.token });
        const cid = await client.put(files, { wrapWithDirectory: true });
        return files.map((f) => ({
          name: f.name,
          type: f.type,
          size: f.size,
          // Use public gateway for convenience
          url: `https://w3s.link/ipfs/${cid}/${encodeURIComponent(f.name)}`,
          isVideo: f.type.startsWith('video/'),
          cid,
        }));
      } catch (err) {
        console.warn('Web3.Storage not available, falling back to local object URLs:', err);
        // Fallthrough to local URLs
      }
    }

    // Fallback: local object URLs (not persistent across reloads)
    return files.map((f) => ({
      name: f.name,
      type: f.type,
      size: f.size,
      url: URL.createObjectURL(f),
      isVideo: f.type.startsWith('video/'),
    }));
  }
}

export const storageService = new StorageService();
