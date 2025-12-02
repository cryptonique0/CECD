import { useState } from 'react';
import { UserProfile, AppRole } from '../backend';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, AlertCircle, Users, Megaphone, BarChart3, Wallet } from 'lucide-react';
import IncidentFeed from '../components/IncidentFeed';
import IncidentMap from '../components/IncidentMap';
import ReportIncidentDialog from '../components/ReportIncidentDialog';
import VolunteerPanel from '../components/VolunteerPanel';
import AnnouncementBoard from '../components/AnnouncementBoard';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import CeloDonation from '../components/CeloDonation';
import CeloNetworkStatus from '../components/CeloNetworkStatus';

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
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto">
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
          <TabsTrigger value="celo" className="gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Celo Support</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <IncidentMap />
              <IncidentFeed limit={5} />
            </div>
            <div className="space-y-6">
              <CeloNetworkStatus />
              <CeloDonation />
            </div>
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

        <TabsContent value="celo" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <CeloNetworkStatus showDetails={true} />
              <div className="p-6 bg-gradient-to-br from-green-50 to-yellow-50 rounded-lg border border-green-200">
                <h3 className="text-xl font-bold mb-3 text-green-800">Why Celo?</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✅ <strong>Carbon Negative:</strong> Offset more carbon than the network produces</li>
                  <li>✅ <strong>Mobile-First:</strong> Designed for accessibility via smartphones</li>
                  <li>✅ <strong>Low Fees:</strong> Affordable transactions for emergency response</li>
                  <li>✅ <strong>Fast Finality:</strong> Quick confirmation for urgent donations</li>
                  <li>✅ <strong>Stable Coins:</strong> Support for cUSD and cEUR for stability</li>
                </ul>
              </div>
            </div>
            <div>
              <CeloDonation />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
