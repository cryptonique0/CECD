import { useState } from 'react';
import { useGetActiveIncidents, useGetArchivedIncidents } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Incident, IncidentSeverity, IncidentStatus } from '../backend';
import { AlertCircle, Clock, MapPin, User, MessageSquare, Archive, Globe } from 'lucide-react';
import IncidentDetailDialog from './IncidentDetailDialog';

interface IncidentFeedProps {
  limit?: number;
}

export default function IncidentFeed({ limit }: IncidentFeedProps) {
  const { data: activeIncidents, isLoading: activeLoading } = useGetActiveIncidents();
  const { data: archivedIncidents, isLoading: archivedLoading } = useGetArchivedIncidents();
  const [sortBy, setSortBy] = useState<'time' | 'severity'>('time');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case IncidentSeverity.critical:
        return 'bg-destructive text-destructive-foreground';
      case IncidentSeverity.high:
        return 'bg-chart-1 text-white';
      case IncidentSeverity.medium:
        return 'bg-chart-3 text-white';
      case IncidentSeverity.low:
        return 'bg-chart-2 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case IncidentStatus.pending:
        return 'bg-muted text-muted-foreground';
      case IncidentStatus.assigned:
        return 'bg-chart-2/20 text-chart-2';
      case IncidentStatus.inProgress:
        return 'bg-chart-1/20 text-chart-1';
      case IncidentStatus.resolved:
        return 'bg-chart-4/20 text-chart-4';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    return <AlertCircle className="h-4 w-4" />;
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const sortedAndFilteredActiveIncidents = activeIncidents
    ?.filter((incident) => {
      if (filterStatus === 'all') return true;
      return incident.status === filterStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'time') {
        return Number(b.timestamp - a.timestamp);
      } else {
        const severityOrder = {
          [IncidentSeverity.critical]: 4,
          [IncidentSeverity.high]: 3,
          [IncidentSeverity.medium]: 2,
          [IncidentSeverity.low]: 1,
        };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
    })
    .slice(0, limit);

  const sortedArchivedIncidents = archivedIncidents?.sort((a, b) => {
    return Number(b.timestamp - a.timestamp);
  });

  const renderIncidentCard = (incident: Incident, isArchived: boolean = false) => (
    <Card
      key={incident.id.toString()}
      className="cursor-pointer transition-all hover:shadow-md border-l-4"
      style={{
        borderLeftColor:
          incident.severity === IncidentSeverity.critical
            ? 'oklch(var(--destructive))'
            : incident.severity === IncidentSeverity.high
              ? 'oklch(var(--chart-1))'
              : incident.severity === IncidentSeverity.medium
                ? 'oklch(var(--chart-3))'
                : 'oklch(var(--chart-2))',
      }}
      onClick={() => setSelectedIncident(incident)}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                {isArchived && (
                  <Archive className="h-4 w-4 text-muted-foreground" />
                )}
                <h3 className="font-semibold">{incident.title}</h3>
                <Badge className={getSeverityColor(incident.severity)} variant="secondary">
                  {incident.severity}
                </Badge>
                <Badge className={getStatusColor(incident.status)} variant="outline">
                  {incident.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{incident.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              {getCategoryIcon(incident.category)}
              <span className="capitalize">{incident.category}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{incident.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatTimestamp(incident.timestamp)}</span>
            </div>
            {!incident.isAnonymous && incident.reporter && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>Reporter</span>
              </div>
            )}
            {incident.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{incident.comments.length} comments</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (activeLoading && archivedLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Incident Feed</CardTitle>
              <CardDescription>Real-time emergency reports</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'time' | 'severity')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time">By Time</SelectItem>
                  <SelectItem value="severity">By Severity</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={IncidentStatus.pending}>Pending</SelectItem>
                  <SelectItem value={IncidentStatus.assigned}>Assigned</SelectItem>
                  <SelectItem value={IncidentStatus.inProgress}>In Progress</SelectItem>
                  <SelectItem value={IncidentStatus.resolved}>Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedAndFilteredActiveIncidents?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No active incidents found</p>
            </div>
          ) : (
            sortedAndFilteredActiveIncidents?.map((incident) => renderIncidentCard(incident))
          )}

          {sortedArchivedIncidents && sortedArchivedIncidents.length > 0 && (
            <>
              <Separator className="my-6" />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-chart-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Past Events: Nigeria & Regional Updates</h3>
                    <p className="text-sm text-muted-foreground">
                      Archived incidents from external data sources for enhanced regional forecasting
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {sortedArchivedIncidents.map((incident) => renderIncidentCard(incident, true))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {selectedIncident && (
        <IncidentDetailDialog
          incident={selectedIncident}
          open={!!selectedIncident}
          onOpenChange={(open) => !open && setSelectedIncident(null)}
        />
      )}
    </>
  );
}
