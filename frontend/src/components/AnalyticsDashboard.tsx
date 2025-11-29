import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetActiveIncidents, useGetArchivedIncidents, useGetAnalyticsDashboard } from '../hooks/useQueries';
import { IncidentSeverity, IncidentStatus } from '../backend';
import { BarChart3, TrendingUp, MapPin, Clock, Sparkles, AlertTriangle, Globe, Archive, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnalyticsDashboard() {
  const { data: incidents } = useGetActiveIncidents();
  const { data: archivedIncidents } = useGetArchivedIncidents();
  const { data: analytics, isLoading: analyticsLoading } = useGetAnalyticsDashboard();

  const resolvedIncidents = incidents?.filter((i) => i.status === IncidentStatus.resolved).length || 0;
  const totalIncidents = incidents?.length || 0;
  const resolutionRate = totalIncidents > 0 ? ((resolvedIncidents / totalIncidents) * 100).toFixed(1) : '0';

  const activeIncidentsCount =
    incidents?.filter(
      (i) =>
        i.status === IncidentStatus.pending ||
        i.status === IncidentStatus.assigned ||
        i.status === IncidentStatus.inProgress
    ).length || 0;

  const criticalCount =
    incidents?.filter((i) => i.severity === IncidentSeverity.critical).length || 0;

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-destructive';
    if (score >= 60) return 'text-chart-1';
    if (score >= 40) return 'text-chart-3';
    return 'text-chart-2';
  };

  const getRiskBadgeVariant = (score: number) => {
    if (score >= 80) return 'destructive';
    if (score >= 60) return 'default';
    return 'secondary';
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIncidents}</div>
            <p className="text-xs text-muted-foreground">Active reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolutionRate}%</div>
            <p className="text-xs text-muted-foreground">{resolvedIncidents} resolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeIncidentsCount}</div>
            <p className="text-xs text-muted-foreground">Pending resolution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Series Chart - 7 Day Visualization */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-chart-1" />
            <CardTitle>Incident Trends (Last 7 Days)</CardTitle>
          </div>
          <CardDescription>Daily incident rate over the past week with updated metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {analytics?.incidentTrends.map((trend, index) => {
                const maxCount = Math.max(
                  ...analytics.incidentTrends.map((t) => Number(t.count)),
                  1
                );
                const count = Number(trend.count);
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{trend.date}</span>
                      <span className="text-muted-foreground">{count} incidents</span>
                    </div>
                    <div className="h-8 rounded-lg bg-muted overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-chart-1 to-chart-2 transition-all duration-500"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Incidents by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Active Incidents by Category</CardTitle>
          <CardDescription>Current incident distribution with expanded breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {analytics?.categoryBreakdown.map((item) => {
                const categoryIcons: Record<string, string> = {
                  fire: '🔥',
                  medical: '🏥',
                  theft: '🚨',
                  flooding: '🌊',
                  hazard: '⚠️',
                  kidnapping: '🚔',
                  publicHealth: '💊',
                  security: '🛡️',
                };
                const count = Number(item.count);
                const totalCount = analytics.categoryBreakdown.reduce(
                  (sum, c) => sum + Number(c.count),
                  0
                );
                const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(0) : '0';
                return (
                  <div
                    key={item.category}
                    className="p-4 rounded-lg border bg-gradient-to-br from-card to-muted/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{categoryIcons[item.category] || '📍'}</span>
                      <span className="text-sm font-medium capitalize">{item.category}</span>
                    </div>
                    <div className="text-3xl font-bold">{count}</div>
                    <p className="text-xs text-muted-foreground mt-1">{percentage}% of total</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI-Powered Trend Forecasts */}
      <Card className="border-chart-1">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-chart-1" />
            <CardTitle>AI-Powered Trend Forecasts</CardTitle>
          </div>
          <CardDescription>
            Updated predictive analytics reflecting new incident and announcement data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {analytics?.predictiveTrends
                .sort((a, b) => Number(b.predictedCount) - Number(a.predictedCount))
                .map((trend) => {
                  const predictedCount = Number(trend.predictedCount);
                  const confidence = Number(trend.confidence);
                  return (
                    <div
                      key={trend.category}
                      className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-card to-muted/20"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-chart-1" />
                          <span className="font-semibold capitalize">{trend.category}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Predicted incidents: {predictedCount}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-3xl font-bold ${getRiskColor(predictedCount)}`}>
                            {predictedCount}
                          </div>
                          <p className="text-xs text-muted-foreground">Forecast</p>
                        </div>
                        <Badge variant={getRiskBadgeVariant(confidence)} className="text-xs">
                          {confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simulated Heatmap Data */}
      <Card className="border-chart-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-chart-2" />
            <CardTitle>Risk Heatmap - Pattern Evolution</CardTitle>
          </div>
          <CardDescription>
            Simulated heatmap data showcasing ongoing activity and pattern evolution
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {analytics?.heatmapData
                .sort((a, b) => Number(b.intensity) - Number(a.intensity))
                .map((data) => {
                  const intensity = Number(data.intensity);
                  const confidence = Number(data.confidence);
                  return (
                    <div
                      key={data.location}
                      className="flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r from-card to-muted/20"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{data.location}</span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {data.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Intensity: {intensity} | Confidence: {confidence}%
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted">
                          <div
                            className={`h-full ${getRiskColor(intensity)} transition-all`}
                            style={{
                              background: `linear-gradient(to top, ${
                                intensity >= 80
                                  ? 'hsl(var(--destructive))'
                                  : intensity >= 60
                                    ? 'hsl(var(--chart-1))'
                                    : 'hsl(var(--chart-3))'
                              } ${intensity}%, transparent 100%)`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nigeria: Recent Incidents & Emergencies */}
      {archivedIncidents && archivedIncidents.length > 0 && (
        <Card className="border-muted-foreground/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-chart-3" />
              <CardTitle>Nigeria: Recent Incidents & Emergencies</CardTitle>
            </div>
            <CardDescription>
              Archived regional incidents used for enhanced predictive modeling and trend analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {archivedIncidents.slice(0, 5).map((incident) => (
                <div
                  key={incident.id.toString()}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
                >
                  <Archive className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{incident.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {incident.location}
                      </Badge>
                      <Badge
                        variant={
                          incident.severity === IncidentSeverity.critical
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="text-xs"
                      >
                        {incident.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{incident.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expanded Breakdowns */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Category</CardTitle>
            <CardDescription>Expanded distribution of incident types</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {analytics?.categoryBreakdown.map((item) => {
                  const count = Number(item.count);
                  const totalCount = analytics.categoryBreakdown.reduce(
                    (sum, c) => sum + Number(c.count),
                    0
                  );
                  const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0';
                  return (
                    <div key={item.category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize font-medium">{item.category}</span>
                        <span className="text-muted-foreground">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-chart-1 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incidents by Severity</CardTitle>
            <CardDescription>Expanded severity level distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {analytics?.severityBreakdown.map((item) => {
                  const count = Number(item.count);
                  const totalCount = analytics.severityBreakdown.reduce(
                    (sum, s) => sum + Number(s.count),
                    0
                  );
                  const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0';
                  const color =
                    item.severity === 'critical'
                      ? 'bg-destructive'
                      : item.severity === 'high'
                        ? 'bg-chart-1'
                        : item.severity === 'medium'
                          ? 'bg-chart-3'
                          : 'bg-chart-2';
                  return (
                    <div key={item.severity} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize font-medium">{item.severity}</span>
                        <span className="text-muted-foreground">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full ${color} transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Incident Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Incident Status Overview</CardTitle>
          <CardDescription>Expanded breakdown of current incident statuses</CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {analytics?.statusBreakdown.map((item) => (
                <div key={item.status} className="p-4 rounded-lg border">
                  <div className="text-2xl font-bold">{Number(item.count)}</div>
                  <p className="text-sm text-muted-foreground capitalize">{item.status}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
