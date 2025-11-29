import { useState } from 'react';
import { UserProfile, AppRole } from '../backend';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, AlertCircle, Users, Megaphone, BarChart3 } from 'lucide-react';
import IncidentFeed from '../components/IncidentFeed';
import IncidentMap from '../components/IncidentMap';
import ReportIncidentDialog from '../components/ReportIncidentDialog';
import VolunteerPanel from '../components/VolunteerPanel';
import AnnouncementBoard from '../components/AnnouncementBoard';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

interface DashboardProps {
  userProfile: UserProfile;
}

export default function Dashboard({ userProfile }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const isEmergencyDesk = userProfile.appRole === AppRole.emergencyDesk;
  const isCommunityLeader = userProfile.appRole === AppRole.communityLeader;
  const isVolunteer = userProfile.appRole === AppRole.volunteer;

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {userProfile.name}
          </p>
        </div>
        <ReportIncidentDialog />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="incidents" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Incidents</span>
          </TabsTrigger>
          {(isVolunteer || isEmergencyDesk) && (
            <TabsTrigger value="volunteers" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Volunteers</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="announcements" className="gap-2">
            <Megaphone className="h-4 w-4" />
            <span className="hidden sm:inline">Announcements</span>
          </TabsTrigger>
          {(isEmergencyDesk || isCommunityLeader) && (
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <IncidentMap />
            <IncidentFeed limit={5} />
          </div>
        </TabsContent>

        <TabsContent value="incidents">
          <IncidentFeed />
        </TabsContent>

        {(isVolunteer || isEmergencyDesk) && (
          <TabsContent value="volunteers">
            <VolunteerPanel userProfile={userProfile} />
          </TabsContent>
        )}

        <TabsContent value="announcements">
          <AnnouncementBoard userProfile={userProfile} />
        </TabsContent>

        {(isEmergencyDesk || isCommunityLeader) && (
          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
