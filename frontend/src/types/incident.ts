export type IncidentType = 'fire' | 'flood' | 'earthquake' | 'medical' | 'other';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'reported' | 'verified' | 'responding' | 'resolved';

export interface Incident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  reportedBy: string;
  reportedAt: Date;
  resolvedAt?: Date;
}
