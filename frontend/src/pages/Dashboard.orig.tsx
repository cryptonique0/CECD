import { useState } from 'react';
import { UserProfile, AppRole } from '../backend';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LayoutDashboard,
  AlertCircle,
  Users,
  Megaphone,
  BarChart3,
  Wallet,
  BellRing,
  ClipboardCheck,
  History,
  BarChart4,
  User as UserIcon,
  MapPin,
  MessageSquare,
  FileText,
  Activity,
  Network,
  Smartphone,
  Bot,
} from 'lucide-react';
import IncidentFeed from '../components/IncidentFeed';
import IncidentMap from '../components/IncidentMap';
import ReportIncidentDialog from '../components/ReportIncidentDialog';
import VolunteerPanel from '../components/VolunteerPanel';
import AnnouncementBoard from '../components/AnnouncementBoard';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import CeloDonation from '../components/CeloDonation';
import CeloNetworkStatus from '../components/CeloNetworkStatus';
import StableCoinDonation from '../components/StableCoinDonation';
import CeloGrantDisbursement from '../components/CeloGrantDisbursement';
import CeloCarbonAnalytics from '../components/CeloCarbonAnalytics';
import CeloValidatorHealth from '../components/CeloValidatorHealth';
import VolunteerReputationSystem from '../components/VolunteerReputationSystem';
import OfflineSupport from '../components/OfflineSupport';
import MultiSigWallet from '../components/MultiSigWallet';
import AIPrediction from '../components/AIPrediction';
import RealTimeNotifications from '../components/RealTimeNotifications';
import IncidentFilter from '../components/IncidentFilter';
import VolunteerAssignmentSystem from '../components/VolunteerAssignmentSystem';
import FundAnalyticsDashboard from '../components/FundAnalyticsDashboard';
import EmergencyAlertsSystem from '../components/EmergencyAlertsSystem';
import IncidentHistoryReporting from '../components/IncidentHistoryReporting';
import UserProfileManager from '../components/UserProfileManager';
import StacksNetworkStatus from '../components/StacksNetworkStatus';
import StacksDonation from '../components/StacksDonation';
import StacksAnalytics from '../components/StacksAnalytics';
import CeloGrantPayment from '../components/CeloGrantPayment';
import EvacuationCenterManagement from '../components/EvacuationCenterManagement';
import InAppMessaging from '../components/InAppMessaging';
import ReportGeneration from '../components/ReportGeneration';
import GeoFencingAlerts from '../components/GeoFencingAlerts';
import WearableHealthMonitoring from '../components/WearableHealthMonitoring';
import APIMonitoring from '../components/APIMonitoring';
import BulkVolunteerAssignment from '../components/BulkVolunteerAssignment';
import MobileAppDeployment from '../components/MobileAppDeployment';
import AIChatbot from '../components/AIChatbot';

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
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-9 h-auto">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="incidents" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Incidents</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <BellRing className="h-4 w-4" />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
          {(isVolunteer || isEmergencyDesk) && (
            <TabsTrigger value="volunteers" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Volunteers</span>
            </TabsTrigger>
          )}
          {(isVolunteer || isEmergencyDesk) && (
            <TabsTrigger value="assignments" className="gap-2">
              <ClipboardCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Assignments</span>
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
          {(isEmergencyDesk || isCommunityLeader) && (
            <TabsTrigger value="funds" className="gap-2">
              <BarChart4 className="h-4 w-4" />
              <span className="hidden sm:inline">Funds</span>
            </TabsTrigger>
          )}
          {(isEmergencyDesk || isCommunityLeader) && (
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="profile" className="gap-2">
            <UserIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="celo" className="gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Celo Support</span>
          </TabsTrigger>
          <TabsTrigger value="stacks" className="gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Stacks (BTC L2)</span>
          </TabsTrigger>
          <TabsTrigger value="evacuation" className="gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Evacuation</span>
          </TabsTrigger>
          <TabsTrigger value="messaging" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Messaging</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
          <TabsTrigger value="geofencing" className="gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Geofence</span>
          </TabsTrigger>
          <TabsTrigger value="health" className="gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Health</span>
          </TabsTrigger>
          <TabsTrigger value="api-monitor" className="gap-2">
            <Network className="h-4 w-4" />
            <span className="hidden sm:inline">API Status</span>
          </TabsTrigger>
          <TabsTrigger value="bulk-assign" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Bulk Assign</span>
          </TabsTrigger>
          <TabsTrigger value="mobile" className="gap-2">
            <Smartphone className="h-4 w-4" />
            <span className="hidden sm:inline">Mobile</span>
          </TabsTrigger>
          <TabsTrigger value="ai-chat" className="gap-2">
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">AI Chat</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <IncidentMap />
              <IncidentFeed limit={5} />
            </div>
            <div className="space-y-6">
              <RealTimeNotifications />
              <OfflineSupport />
              <CeloNetworkStatus />
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <AIPrediction />
            <VolunteerReputationSystem />
          </div>
        </TabsContent>

        <TabsContent value="incidents">
          <div className="mb-6">
            <IncidentFilter />
          </div>
          <IncidentFeed />
        </TabsContent>

        {(isVolunteer || isEmergencyDesk) && (
          <TabsContent value="volunteers">
            <VolunteerPanel userProfile={userProfile} />
          </TabsContent>
        )}

        {(isVolunteer || isEmergencyDesk) && (
          <TabsContent value="assignments">
            <VolunteerAssignmentSystem />
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

        {(isEmergencyDesk || isCommunityLeader) && (
          <TabsContent value="funds">
            <FundAnalyticsDashboard />
          </TabsContent>
        )}

        <TabsContent value="alerts">
          <EmergencyAlertsSystem />
        </TabsContent>

        {(isEmergencyDesk || isCommunityLeader) && (
          <TabsContent value="history">
            <IncidentHistoryReporting />
          </TabsContent>
        )}

        <TabsContent value="profile">
          <UserProfileManager />
        </TabsContent>

        <TabsContent value="celo" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <CeloNetworkStatus showDetails={true} />
              <StableCoinDonation />
            </div>
            <div className="space-y-6">
              <CeloDonation />
              <MultiSigWallet />
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <CeloGrantDisbursement />
            <CeloCarbonAnalytics />
            <CeloValidatorHealth />
          </div>
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
          <CeloGrantPayment />
        </TabsContent>

        <TabsContent value="stacks" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <StacksNetworkStatus />
              <StacksDonation />
            </div>
            <div className="space-y-6">
              <StacksAnalytics />
            </div>
          </div>
          <div className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
            <h3 className="text-xl font-bold mb-3 text-orange-800">Why Stacks?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✅ <strong>Bitcoin Security:</strong> Inherit Bitcoin's proof-of-work security</li>
              <li>✅ <strong>Smart Contracts:</strong> Clarity language for predictable execution</li>
              <li>✅ <strong>sBTC Integration:</strong> Native Bitcoin wrapping for DeFi</li>
              <li>✅ <strong>Decentralized:</strong> No custodians or intermediaries</li>
              <li>✅ <strong>Bitcoin L2:</strong> Settle transactions on Bitcoin blockchain</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="evacuation">
          <EvacuationCenterManagement />
        </TabsContent>

        <TabsContent value="messaging">
          <InAppMessaging />
        </TabsContent>

        <TabsContent value="reports">
          <ReportGeneration />
        </TabsContent>

        <TabsContent value="geofencing">
          <GeoFencingAlerts />
        </TabsContent>

        <TabsContent value="health">
          <WearableHealthMonitoring />
        </TabsContent>

        <TabsContent value="api-monitor">
          <APIMonitoring />
        </TabsContent>

        <TabsContent value="bulk-assign">
          <BulkVolunteerAssignment />
        </TabsContent>

        <TabsContent value="mobile">
          <MobileAppDeployment />
        </TabsContent>

        <TabsContent value="ai-chat">
          <AIChatbot />
        </TabsContent>
      </Tabs>
    </div>
  );
}
