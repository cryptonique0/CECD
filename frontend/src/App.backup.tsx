import { useEffect, Suspense } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity.tsx';
import { useGetCallerUserProfile, useInitializeDemoData } from './hooks/useQueries';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { WalletProvider } from './contexts/WalletContext';
import { StacksProvider } from './contexts/StacksContext';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginScreen from './pages/LoginScreen';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import NotificationPopup from './components/NotificationPopup';
import { Loader2 } from 'lucide-react';

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  const { identity, loginStatus, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched, error: profileError } = useGetCallerUserProfile();
  const initializeDemoData = useInitializeDemoData();

  const isAuthenticated = !!identity;

  // Initialize demo data when user is authenticated and profile is loaded
  useEffect(() => {
    if (isAuthenticated && userProfile && !initializeDemoData.isPending) {
      const hasInitialized = sessionStorage.getItem('demoDataInitialized');
      if (!hasInitialized) {
        initializeDemoData.mutate(undefined, {
          onSuccess: () => {
            sessionStorage.setItem('demoDataInitialized', 'true');
          },
          onError: (error) => {
            console.log('Demo data initialization skipped:', error);
          },
        });
      }
    }
  }, [isAuthenticated, userProfile, initializeDemoData]);

  // Show loading screen during initialization or while logging in
  if (isInitializing || loginStatus === 'logging-in') {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LoadingScreen />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Not authenticated - show login screen
  if (!isAuthenticated) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex min-h-screen flex-col bg-background">
          <main className="flex-1">
            <LoginScreen />
          </main>
          <Toaster />
        </div>
      </ThemeProvider>
    );
  }

  // Authenticated - show loading while fetching profile
  if (profileLoading || !isFetched) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex min-h-screen flex-col bg-background">
          <Header />
          <main className="flex-1">
            <LoadingScreen />
          </main>
          <Footer />
          <Toaster />
        </div>
      </ThemeProvider>
    );
  }

  // Profile error handling
  if (profileError) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex min-h-screen flex-col bg-background">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4 p-6">
              <h2 className="text-2xl font-bold text-destructive">Error Loading Profile</h2>
              <p className="text-muted-foreground">
                There was an error loading your profile. Please try refreshing the page.
              </p>
            </div>
          </main>
          <Footer />
          <Toaster />
        </div>
      </ThemeProvider>
    );
  }

  // No profile - show profile setup
  if (userProfile === null || userProfile === undefined) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex min-h-screen flex-col bg-background">
          <Header />
          <main className="flex-1">
            <ProfileSetup />
          </main>
          <Footer />
          <Toaster />
        </div>
      </ThemeProvider>
    );
  }

  // Profile exists - show dashboard (userProfile is guaranteed to be defined here)
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <WalletProvider>
        <StacksProvider>
          <div className="flex min-h-screen flex-col bg-background">
          <Header />
          <main className="flex-1">
            <Suspense fallback={<LoadingScreen />}>
              <Dashboard userProfile={userProfile} />
            </Suspense>
          </main>
          <Footer />
          <NotificationPopup />
          <Toaster />
          </div>
        </StacksProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}
