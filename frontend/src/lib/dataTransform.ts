/**
 * Data Transformation Utilities
 * Helper functions for data conversion and formatting
 */

/**
 * Convert incident raw data to display format
 */
export function formatIncident(incident: any) {
  return {
    ...incident,
    categoryName: ['Fire', 'Medical', 'Flood', 'Crime', 'Other'][incident.category],
    severityName: ['Low', 'Medium', 'High', 'Critical'][incident.severity],
    createdAtFormatted: new Date(incident.createdAt * 1000).toLocaleDateString(),
    coordinatesFormatted: `${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}`,
  };
}

/**
 * Format time duration
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format currency
 */
export function formatCurrency(
  amount: number | string,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return (value * 100).toFixed(decimals) + '%';
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | number, format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'number' ? new Date(date) : date;

  if (format === 'short') {
    return d.toLocaleDateString();
  }

  return d.toLocaleString();
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(
  latitude: number,
  longitude: number,
  decimals: number = 4
): string {
  return `${latitude.toFixed(decimals)}, ${longitude.toFixed(decimals)}`;
}

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Truncate text
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert array to CSV
 */
export function arrayToCSV(data: any[], headers?: string[]): string {
  if (data.length === 0) return '';

  const keys = headers || Object.keys(data[0]);
  const headerRow = keys.join(',');
  const rows = data.map(row =>
    keys.map(key => {
      const value = row[key];
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    }).join(',')
  );

  return [headerRow, ...rows].join('\n');
}

/**
 * Parse CSV to array
 */
export function csvToArray(csv: string): any[] {
  const lines = csv.trim().split('\n');
  if (lines.length === 0) return [];

  const headers = lines[0].split(',');
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const obj: any = {};
    const values = lines[i].split(',');

    headers.forEach((header, index) => {
      obj[header.trim()] = values[index]?.trim();
    });

    data.push(obj);
  }

  return data;
}

/**
 * Flatten nested object
 */
export function flattenObject(obj: any, prefix: string = ''): Record<string, any> {
  const result: Record<string, any> = {};

  Object.keys(obj).forEach(key => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  });

  return result;
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    const clonedArr: any[] = [];
    obj.forEach((element, index) => {
      clonedArr[index] = deepClone(element);
    });
    return clonedArr as any;
  }

  if (obj instanceof Object) {
    const clonedObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * Merge objects
 */
export function mergeObjects<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  return sources.reduce((result, source) => {
    return {
      ...result,
      ...source,
    };
  }, target);
}

/**
 * Group array by property
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Sort array of objects
 */
export function sortBy<T extends Record<string, any>>(
  array: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Unique values from array
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Unique objects by property
 */
export function uniqueBy<T extends Record<string, any>>(
  array: T[],
  key: keyof T
): T[] {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * Chunk array
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Sum values from array
 */
export function sum(array: number[]): number {
  return array.reduce((acc, val) => acc + val, 0);
}

/**
 * Average of values
 */
export function average(array: number[]): number {
  return array.length === 0 ? 0 : sum(array) / array.length;
}

/**
 * Min value
 */
export function min(array: number[]): number {
  return Math.min(...array);
}

/**
 * Max value
 */
export function max(array: number[]): number {
  return Math.max(...array);
}
