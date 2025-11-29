import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { 
  UserProfile, 
  Incident, 
  IncidentCategory, 
  IncidentSeverity, 
  IncidentStatus,
  Announcement,
  Volunteer,
  ExternalBlob,
  AppRole,
  UserRole,
  IncidentTagSuggestion,
  RiskScore,
  AlertNotification,
  AlertType,
  DemoCoordinate,
  DemoIncident,
  AnalyticsDashboard
} from '../backend';
import { Principal } from '@icp-sdk/core/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Incident Queries
export function useGetAllIncidents() {
  const { actor, isFetching } = useActor();

  return useQuery<Incident[]>({
    queryKey: ['incidents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllIncidents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetActiveIncidents() {
  const { actor, isFetching } = useActor();

  return useQuery<Incident[]>({
    queryKey: ['activeIncidents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveIncidents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetArchivedIncidents() {
  const { actor, isFetching } = useActor();

  return useQuery<Incident[]>({
    queryKey: ['archivedIncidents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getArchivedIncidents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetIncident(incidentId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Incident | null>({
    queryKey: ['incident', incidentId?.toString()],
    queryFn: async () => {
      if (!actor || incidentId === null) return null;
      return actor.getIncident(incidentId);
    },
    enabled: !!actor && !isFetching && incidentId !== null,
  });
}

export function useReportIncident() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      description: string;
      category: IncidentCategory;
      severity: IncidentSeverity;
      location: string;
      image: ExternalBlob | null;
      isAnonymous: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reportIncident(
        params.title,
        params.description,
        params.category,
        params.severity,
        params.location,
        params.image,
        params.isAnonymous
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['activeIncidents'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsDashboard'] });
    },
  });
}

export function useUpdateIncidentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { incidentId: bigint; newStatus: IncidentStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateIncidentStatus(params.incidentId, params.newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['activeIncidents'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsDashboard'] });
    },
  });
}

export function useCloseIncident() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incidentId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.closeIncident(incidentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['activeIncidents'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsDashboard'] });
    },
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { incidentId: bigint; comment: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addComment(params.incidentId, params.comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['activeIncidents'] });
      queryClient.invalidateQueries({ queryKey: ['archivedIncidents'] });
    },
  });
}

// Volunteer Queries
export function useGetAvailableVolunteers() {
  const { actor, isFetching } = useActor();

  return useQuery<Volunteer[]>({
    queryKey: ['volunteers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableVolunteers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterVolunteer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (location: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerVolunteer(location);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
    },
  });
}

export function useAcceptTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incidentId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.acceptTask(incidentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['activeIncidents'] });
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
    },
  });
}

export function useAssignVolunteerToIncident() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { volunteer: Principal; incidentId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignVolunteerToIncident(params.volunteer, params.incidentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['activeIncidents'] });
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
    },
  });
}

// Announcement Queries
export function useGetAllAnnouncements() {
  const { actor, isFetching } = useActor();

  return useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAnnouncements();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateAnnouncement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { title: string; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createAnnouncement(params.title, params.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

// AI-Powered Predictive Analytics Queries
export function useSuggestIncidentTags() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: { description: string; imageHash: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.suggestIncidentTags(params.description, params.imageHash);
    },
  });
}

export function useGetRiskScore(location: string) {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['riskScore', location],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getRiskScore(location);
    },
    enabled: !!actor && !isFetching && !!location,
  });
}

export function useGetRiskHeatmapData() {
  const { actor, isFetching } = useActor();

  return useQuery<RiskScore[]>({
    queryKey: ['riskHeatmap'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRiskHeatmapData();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTrendForecasts() {
  const { actor, isFetching } = useActor();

  return useQuery<RiskScore[]>({
    queryKey: ['trendForecasts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrendForecasts();
    },
    enabled: !!actor && !isFetching,
  });
}

// Analytics Dashboard Query
export function useGetAnalyticsDashboard() {
  const { actor, isFetching } = useActor();

  return useQuery<AnalyticsDashboard>({
    queryKey: ['analyticsDashboard'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAnalyticsDashboard();
    },
    enabled: !!actor && !isFetching,
  });
}

// Notification Queries
export function useGetAllNotifications() {
  const { actor, isFetching } = useActor();

  return useQuery<AlertNotification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllNotifications();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000, // Poll every 10 seconds for new notifications
  });
}

export function useGetUnreadNotifications() {
  const { actor, isFetching } = useActor();

  return useQuery<AlertNotification[]>({
    queryKey: ['unreadNotifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUnreadNotifications();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000, // Poll every 10 seconds for new notifications
  });
}

export function useGetUnreadNotificationCount() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['unreadNotificationCount'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getUnreadNotificationCount();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

export function useMarkNotificationAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markNotificationAsRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.markAllNotificationsAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    },
  });
}

// Demo Data Queries
export function useGetDemoCoordinates() {
  const { actor, isFetching } = useActor();

  return useQuery<DemoCoordinate[]>({
    queryKey: ['demoCoordinates'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDemoCoordinates();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDemoIncidents() {
  const { actor, isFetching } = useActor();

  return useQuery<DemoIncident[]>({
    queryKey: ['demoIncidents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDemoIncidents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useInitializeDemoData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.initializeDemoData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['activeIncidents'] });
      queryClient.invalidateQueries({ queryKey: ['demoIncidents'] });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsDashboard'] });
    },
  });
}
