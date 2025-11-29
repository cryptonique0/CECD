import { useGetActiveIncidents, useGetRiskHeatmapData, useGetDemoCoordinates } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IncidentSeverity } from '../backend';
import { MapPin, TrendingUp, AlertTriangle } from 'lucide-react';

export default function IncidentMap() {
  const { data: incidents, isLoading } = useGetActiveIncidents();
  const { data: heatmapData, isLoading: heatmapLoading } = useGetRiskHeatmapData();
  const { data: coordinates } = useGetDemoCoordinates();

  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case IncidentSeverity.critical:
        return '#dc2626'; // red
      case IncidentSeverity.high:
        return '#ea580c'; // orange
      case IncidentSeverity.medium:
        return '#eab308'; // yellow
      case IncidentSeverity.low:
        return '#22c55e'; // green
      default:
        return '#6b7280'; // gray
    }
  };

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

  const incidentsByLocation = incidents?.reduce(
    (acc, incident) => {
      const location = incident.location;
      if (!acc[location]) {
        acc[location] = [];
      }
      acc[location].push(incident);
      return acc;
    },
    {} as Record<string, typeof incidents>
  );

  // Create coordinate map for quick lookup
  const coordinateMap = coordinates?.reduce(
    (acc, coord) => {
      acc[coord.city] = coord;
      return acc;
    },
    {} as Record<string, typeof coordinates[0]>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Incident Map & Risk Analysis</CardTitle>
        <CardDescription>Geographic distribution and predictive risk assessment</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="incidents" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="incidents">Active Incidents</TabsTrigger>
            <TabsTrigger value="heatmap">Predicted Hotspots</TabsTrigger>
          </TabsList>

          <TabsContent value="incidents" className="space-y-4">
            <div className="relative h-96 bg-muted rounded-lg overflow-hidden border">
              {/* Demo map visualization with Nigerian cities */}
              <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
                {/* Background */}
                <rect width="800" height="600" fill="oklch(var(--muted))" />
                
                {/* Grid lines */}
                <g opacity="0.1">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <line
                      key={`h-${i}`}
                      x1="0"
                      y1={i * 30}
                      x2="800"
                      y2={i * 30}
                      stroke="oklch(var(--foreground))"
                      strokeWidth="1"
                    />
                  ))}
                  {Array.from({ length: 27 }).map((_, i) => (
                    <line
                      key={`v-${i}`}
                      x1={i * 30}
                      y1="0"
                      x2={i * 30}
                      y2="600"
                      stroke="oklch(var(--foreground))"
                      strokeWidth="1"
                    />
                  ))}
                </g>

                {/* Plot incidents on map */}
                {incidents?.map((incident) => {
                  const coord = coordinateMap?.[incident.location];
                  if (!coord) return null;

                  // Convert lat/long to SVG coordinates (simplified projection)
                  // Nigeria roughly spans: lat 4-14°N, long 3-15°E
                  const x = ((coord.longitude - 3) / 12) * 800;
                  const y = 600 - ((coord.latitude - 4) / 10) * 600;

                  return (
                    <g key={incident.id.toString()}>
                      {/* Marker shadow */}
                      <circle
                        cx={x}
                        cy={y + 2}
                        r="8"
                        fill="black"
                        opacity="0.2"
                      />
                      {/* Marker */}
                      <circle
                        cx={x}
                        cy={y}
                        r="8"
                        fill={getSeverityColor(incident.severity)}
                        stroke="white"
                        strokeWidth="2"
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      />
                      {/* Pulse animation for critical incidents */}
                      {incident.severity === IncidentSeverity.critical && (
                        <circle
                          cx={x}
                          cy={y}
                          r="8"
                          fill="none"
                          stroke={getSeverityColor(incident.severity)}
                          strokeWidth="2"
                          opacity="0.6"
                        >
                          <animate
                            attributeName="r"
                            from="8"
                            to="20"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            from="0.6"
                            to="0"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                    </g>
                  );
                })}

                {/* City labels */}
                {coordinates?.slice(0, 8).map((coord) => {
                  const x = ((coord.longitude - 3) / 12) * 800;
                  const y = 600 - ((coord.latitude - 4) / 10) * 600;
                  return (
                    <text
                      key={coord.city}
                      x={x}
                      y={y - 15}
                      textAnchor="middle"
                      fill="oklch(var(--muted-foreground))"
                      fontSize="10"
                      fontWeight="500"
                    >
                      {coord.city}
                    </text>
                  );
                })}
              </svg>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm p-3 rounded-lg border shadow-lg">
                <div className="text-xs font-semibold mb-2">Severity Levels</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                    <span className="text-xs">Low</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#eab308]" />
                    <span className="text-xs">Medium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ea580c]" />
                    <span className="text-xs">High</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#dc2626]" />
                    <span className="text-xs">Critical</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Location Hotspots</h4>
              <div className="space-y-2">
                {Object.entries(incidentsByLocation || {})
                  .sort(([, a], [, b]) => b.length - a.length)
                  .slice(0, 5)
                  .map(([location, locationIncidents]) => {
                    const criticalCount = locationIncidents.filter(
                      (i) => i.severity === IncidentSeverity.critical
                    ).length;
                    const highCount = locationIncidents.filter((i) => i.severity === IncidentSeverity.high).length;

                    return (
                      <div key={location} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {criticalCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {criticalCount} Critical
                            </Badge>
                          )}
                          {highCount > 0 && (
                            <Badge className="text-xs bg-chart-1 text-white">{highCount} High</Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {locationIncidents.length} total
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-4">
            {heatmapLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <>
                <div className="relative h-96 bg-muted rounded-lg overflow-hidden border">
                  <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
                    {/* Background */}
                    <rect width="800" height="600" fill="oklch(var(--muted))" />
                    
                    {/* Grid lines */}
                    <g opacity="0.1">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <line
                          key={`h-${i}`}
                          x1="0"
                          y1={i * 30}
                          x2="800"
                          y2={i * 30}
                          stroke="oklch(var(--foreground))"
                          strokeWidth="1"
                        />
                      ))}
                      {Array.from({ length: 27 }).map((_, i) => (
                        <line
                          key={`v-${i}`}
                          x1={i * 30}
                          y1="0"
                          x2={i * 30}
                          y2="600"
                          stroke="oklch(var(--foreground))"
                          strokeWidth="1"
                        />
                      ))}
                    </g>

                    {/* Plot risk zones */}
                    {heatmapData?.map((risk) => {
                      const coord = coordinateMap?.[risk.location];
                      if (!coord) return null;

                      const x = ((coord.longitude - 3) / 12) * 800;
                      const y = 600 - ((coord.latitude - 4) / 10) * 600;
                      const score = Number(risk.score);
                      
                      // Size based on risk score
                      const radius = 20 + (score / 100) * 30;
                      
                      // Color based on risk score
                      const color = score >= 80 ? '#dc2626' : score >= 60 ? '#ea580c' : score >= 40 ? '#eab308' : '#22c55e';

                      return (
                        <g key={risk.location}>
                          {/* Risk zone circle with gradient */}
                          <defs>
                            <radialGradient id={`gradient-${risk.location}`}>
                              <stop offset="0%" stopColor={color} stopOpacity="0.6" />
                              <stop offset="100%" stopColor={color} stopOpacity="0.1" />
                            </radialGradient>
                          </defs>
                          <circle
                            cx={x}
                            cy={y}
                            r={radius}
                            fill={`url(#gradient-${risk.location})`}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                          />
                          {/* Center marker */}
                          <circle
                            cx={x}
                            cy={y}
                            r="6"
                            fill={color}
                            stroke="white"
                            strokeWidth="2"
                          />
                        </g>
                      );
                    })}

                    {/* City labels */}
                    {coordinates?.slice(0, 8).map((coord) => {
                      const x = ((coord.longitude - 3) / 12) * 800;
                      const y = 600 - ((coord.latitude - 4) / 10) * 600;
                      return (
                        <text
                          key={coord.city}
                          x={x}
                          y={y - 35}
                          textAnchor="middle"
                          fill="oklch(var(--muted-foreground))"
                          fontSize="10"
                          fontWeight="500"
                        >
                          {coord.city}
                        </text>
                      );
                    })}
                  </svg>

                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm p-3 rounded-lg border shadow-lg">
                    <div className="text-xs font-semibold mb-2">Risk Levels</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                        <span className="text-xs">Low (0-40)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#eab308]" />
                        <span className="text-xs">Medium (40-60)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#ea580c]" />
                        <span className="text-xs">High (60-80)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#dc2626]" />
                        <span className="text-xs">Critical (80+)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold">Predicted Risk Zones</h4>
                    <AlertTriangle className="h-4 w-4 text-chart-1" />
                  </div>
                  <div className="space-y-2">
                    {heatmapData
                      ?.sort((a, b) => Number(b.score) - Number(a.score))
                      .map((risk) => {
                        const score = Number(risk.score);
                        return (
                          <div
                            key={risk.location}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{risk.location}</span>
                              </div>
                              <p className="text-xs text-muted-foreground capitalize">
                                Primary risk: {risk.category}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className={`text-2xl font-bold ${getRiskColor(score)}`}>{score}</div>
                                <p className="text-xs text-muted-foreground">Risk Score</p>
                              </div>
                              <Badge variant={getRiskBadgeVariant(score)} className="text-xs">
                                {Number(risk.confidence)}% confidence
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
