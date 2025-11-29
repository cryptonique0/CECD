import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Shield, Users, MapPin, Bell } from 'lucide-react';

export default function LoginScreen() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container flex min-h-screen flex-col items-center justify-center py-12">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-32 w-auto items-center justify-center">
              <img 
                src="/assets/ADADA-removebg-preview.png" 
                alt="ADADA Logo" 
                className="h-full w-auto object-contain drop-shadow-lg"
              />
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Community Emergency Coordination Dashboard
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real-time incident reporting and response coordination for safer communities
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-2">
              <CardHeader>
                <Shield className="h-8 w-8 text-destructive mb-2" />
                <CardTitle className="text-lg">Emergency Response</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Report and track incidents in real-time with severity-based prioritization
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <Users className="h-8 w-8 text-chart-2 mb-2" />
                <CardTitle className="text-lg">Volunteer Network</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect with nearby volunteers and coordinate rapid response efforts
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <MapPin className="h-8 w-8 text-chart-1 mb-2" />
                <CardTitle className="text-lg">Location Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Interactive maps with color-coded severity markers and hotspot analysis
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <Bell className="h-8 w-8 text-chart-3 mb-2" />
                <CardTitle className="text-lg">Community Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Stay informed with announcements and emergency playbooks
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <Card className="mx-auto w-full max-w-md border-2 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Get Started</CardTitle>
              <CardDescription>
                Sign in securely with Internet Identity to access the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={login}
                disabled={isLoggingIn}
                size="lg"
                className="w-full bg-gradient-to-r from-destructive to-chart-1 hover:opacity-90"
              >
                {isLoggingIn ? 'Connecting...' : 'Sign In with Internet Identity'}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Secure, decentralized authentication powered by the Internet Computer
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
