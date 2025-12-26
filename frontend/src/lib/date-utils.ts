// Utility functions for emergency coordination

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString();
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString();
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}
