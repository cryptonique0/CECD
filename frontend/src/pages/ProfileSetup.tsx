import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { AppRole, UserRole } from '../backend';
import { toast } from 'sonner';

export default function ProfileSetup() {
  const [name, setName] = useState('');
  const [appRole, setAppRole] = useState<AppRole>(AppRole.citizen);
  const [location, setLocation] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        appRole,
        role: UserRole.user,
        trustScore: BigInt(100),
        location: location.trim() || undefined,
        badges: [],
      });
      toast.success('Profile created successfully!');
    } catch (error) {
      toast.error('Failed to create profile');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to CECD</CardTitle>
          <CardDescription>
            Set up your profile to get started with emergency coordination
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Your Role *</Label>
              <Select value={appRole} onValueChange={(value) => setAppRole(value as AppRole)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AppRole.citizen}>Citizen</SelectItem>
                  <SelectItem value={AppRole.volunteer}>Volunteer</SelectItem>
                  <SelectItem value={AppRole.communityLeader}>Community Leader</SelectItem>
                  <SelectItem value={AppRole.emergencyDesk}>Emergency Desk</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose the role that best describes your involvement in community emergency response
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                placeholder="e.g., Lagos, Nigeria"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-destructive to-chart-1"
              disabled={saveProfile.isPending}
            >
              {saveProfile.isPending ? 'Creating Profile...' : 'Create Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
