import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useGetAvailableVolunteers, useRegisterVolunteer, useAcceptTask, useGetAllIncidents } from '../hooks/useQueries';
import { UserProfile, AppRole, IncidentStatus } from '../backend';
import { toast } from 'sonner';
import { Users, MapPin, CheckCircle } from 'lucide-react';

interface VolunteerPanelProps {
  userProfile: UserProfile;
}

export default function VolunteerPanel({ userProfile }: VolunteerPanelProps) {
  const [location, setLocation] = useState('');
  const { data: volunteers } = useGetAvailableVolunteers();
  const { data: incidents } = useGetAllIncidents();
  const registerVolunteer = useRegisterVolunteer();
  const acceptTask = useAcceptTask();

  const isVolunteer = userProfile.appRole === AppRole.volunteer;
  const isEmergencyDesk = userProfile.appRole === AppRole.emergencyDesk;

  const handleRegister = async () => {
    if (!location.trim()) {
      toast.error('Please enter your location');
      return;
    }

    try {
      await registerVolunteer.mutateAsync(location.trim());
      toast.success('Registered as volunteer');
      setLocation('');
    } catch (error) {
      toast.error('Failed to register');
    }
  };

  const handleAcceptTask = async (incidentId: bigint) => {
    try {
      await acceptTask.mutateAsync(incidentId);
      toast.success('Task accepted');
    } catch (error) {
      toast.error('Failed to accept task');
    }
  };

  const availableIncidents = incidents?.filter(
    (incident) => incident.status === IncidentStatus.pending || incident.status === IncidentStatus.assigned
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {isVolunteer && (
        <Card>
          <CardHeader>
            <CardTitle>Volunteer Registration</CardTitle>
            <CardDescription>Register your availability to respond to incidents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Your Location</Label>
              <Input
                id="location"
                placeholder="e.g., Lagos, Nigeria"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button
              onClick={handleRegister}
              disabled={registerVolunteer.isPending}
              className="w-full"
            >
              {registerVolunteer.isPending ? 'Registering...' : 'Register as Available'}
            </Button>
          </CardContent>
        </Card>
      )}

      {isVolunteer && (
        <Card>
          <CardHeader>
            <CardTitle>Available Tasks</CardTitle>
            <CardDescription>Incidents you can respond to</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableIncidents?.slice(0, 5).map((incident) => (
                <div key={incident.id.toString()} className="p-3 rounded-lg border space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{incident.title}</h4>
                      <p className="text-xs text-muted-foreground">{incident.location}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {incident.severity}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAcceptTask(incident.id)}
                    disabled={acceptTask.isPending}
                    className="w-full"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Accept Task
                  </Button>
                </div>
              ))}
              {(!availableIncidents || availableIncidents.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No available tasks at the moment
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className={isVolunteer ? 'lg:col-span-2' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Volunteers
          </CardTitle>
          <CardDescription>
            {volunteers?.length || 0} volunteers currently available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {volunteers?.map((volunteer) => (
              <div key={volunteer.principal.toString()} className="p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-chart-2 flex items-center justify-center text-white text-xs font-bold">
                    V
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Volunteer</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{volunteer.location}</span>
                    </div>
                  </div>
                </div>
                {volunteer.assignedIncidents.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {volunteer.assignedIncidents.length} active tasks
                  </Badge>
                )}
              </div>
            ))}
            {(!volunteers || volunteers.length === 0) && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No volunteers available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
