// Type definitions for the emergency coordination backend
export enum AppRole {
  emergencyDesk = 'emergencyDesk',
  communityLeader = 'communityLeader',
  volunteer = 'volunteer',
}

export enum UserRole {
  admin = 'admin',
  moderator = 'moderator',
  user = 'user',
}

export enum IncidentCategory {
  medical = 'medical',
  fire = 'fire',
  flood = 'flood',
  storm = 'storm',
  earthquake = 'earthquake',
  other = 'other',
}

export enum IncidentSeverity {
  low = 'low',
  medium = 'medium',
  high = 'high',
  critical = 'critical',
}

export enum IncidentStatus {
  reported = 'reported',
  acknowledged = 'acknowledged',
  inProgress = 'inProgress',
  resolved = 'resolved',
  closed = 'closed',
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  appRole: AppRole;
  userRole: UserRole;
  isVerified: boolean;
  createdAt: number;
  avatar?: string;
  bio?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: {
    lat: number;
    lng: number;
  };
  reportedBy: string;
  createdAt: number;
  updatedAt: number;
  volunteers: string[];
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  createdAt: number;
  author: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  skills: string[];
  availability: 'available' | 'unavailable' | 'busy';
  location?: { lat: number; lng: number };
  verificationStatus: 'verified' | 'pending' | 'rejected';
  rating: number;
}

export interface ExternalBlob {
  id: string;
  data: Uint8Array;
  mimeType: string;
}

export interface IncidentTagSuggestion {
  tag: string;
  confidence: number;
}

export interface RiskScore {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
}

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  type: AlertType;
  createdAt: number;
  read: boolean;
}

export enum AlertType {
  incident = 'incident',
  assignment = 'assignment',
  announcement = 'announcement',
  system = 'system',
}

export interface DemoCoordinate {
  latitude: number;
  longitude: number;
}

export interface DemoIncident {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  location: DemoCoordinate;
}

export interface AnalyticsDashboard {
  totalIncidents: number;
  resolvedIncidents: number;
  activeVolunteers: number;
  resourceAllocation: Record<string, number>;
  riskAssessment: RiskScore;
}
