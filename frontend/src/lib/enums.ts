export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const INCIDENT_TYPES = {
  FIRE: 'fire',
  FLOOD: 'flood',
  EARTHQUAKE: 'earthquake',
  MEDICAL: 'medical',
  OTHER: 'other',
} as const;
