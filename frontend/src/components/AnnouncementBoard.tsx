import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useGetAllAnnouncements, useCreateAnnouncement } from '../hooks/useQueries';
import { UserProfile, AppRole } from '../backend';
import { toast } from 'sonner';
import { Megaphone, Clock, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AnnouncementBoardProps {
  userProfile: UserProfile;
}

export default function AnnouncementBoard({ userProfile }: AnnouncementBoardProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const { data: announcements } = useGetAllAnnouncements();
  const createAnnouncement = useCreateAnnouncement();

  const isCommunityLeader = userProfile.appRole === AppRole.communityLeader;

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await createAnnouncement.mutateAsync({
        title: title.trim(),
        message: message.trim(),
      });
      toast.success('Announcement created');
      setTitle('');
      setMessage('');
    } catch (error) {
      toast.error('Failed to create announcement');
    }
  };

  // Separate security updates from regular announcements
  const securityUpdates = announcements?.filter(a => 
    a.title.includes('⚠️ Recent Incidents & Security Updates')
  ) || [];
  
  const regularAnnouncements = announcements?.filter(a => 
    !a.title.includes('⚠️ Recent Incidents & Security Updates')
  ) || [];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {isCommunityLeader && (
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Create Announcement</CardTitle>
            <CardDescription>Share important updates with the community</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Announcement title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Announcement message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={createAnnouncement.isPending}
                className="w-full"
              >
                {createAnnouncement.isPending ? 'Publishing...' : 'Publish Announcement'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className={`space-y-6 ${isCommunityLeader ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
        {/* Security Updates Section */}
        {securityUpdates.length > 0 && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                ⚠️ Recent Incidents & Security Updates
              </CardTitle>
              <CardDescription>
                Critical security incidents and emergency updates from across Nigeria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityUpdates.map((announcement) => {
                  // Extract the actual incident title from the full title
                  const incidentTitle = announcement.title.replace('⚠️ Recent Incidents & Security Updates: ', '');
                  
                  return (
                    <Alert key={announcement.id.toString()} variant="destructive" className="border-destructive/30">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="text-base font-semibold">
                        {incidentTitle}
                      </AlertTitle>
                      <AlertDescription className="mt-2 text-sm">
                        {announcement.message}
                      </AlertDescription>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(announcement.timestamp)}
                      </div>
                    </Alert>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Regular Announcements Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Community Announcements
            </CardTitle>
            <CardDescription>
              Latest updates from community leaders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {regularAnnouncements.map((announcement) => (
                <div key={announcement.id.toString()}>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg">{announcement.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(announcement.timestamp)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{announcement.message}</p>
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
              {regularAnnouncements.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Megaphone className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No announcements yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
