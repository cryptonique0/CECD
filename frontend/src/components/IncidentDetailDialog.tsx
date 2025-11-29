import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Incident, IncidentSeverity, IncidentStatus, AppRole } from '../backend';
import { useAddComment, useUpdateIncidentStatus, useCloseIncident, useGetCallerUserProfile } from '../hooks/useQueries';
import { toast } from 'sonner';
import { MapPin, Clock, User, MessageSquare, AlertCircle } from 'lucide-react';

interface IncidentDetailDialogProps {
  incident: Incident;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function IncidentDetailDialog({ incident, open, onOpenChange }: IncidentDetailDialogProps) {
  const [comment, setComment] = useState('');
  const { data: userProfile } = useGetCallerUserProfile();
  const addComment = useAddComment();
  const updateStatus = useUpdateIncidentStatus();
  const closeIncident = useCloseIncident();

  const isEmergencyDesk = userProfile?.appRole === AppRole.emergencyDesk;

  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case IncidentSeverity.critical:
        return 'bg-destructive text-destructive-foreground';
      case IncidentSeverity.high:
        return 'bg-chart-1 text-white';
      case IncidentSeverity.medium:
        return 'bg-chart-3 text-white';
      case IncidentSeverity.low:
        return 'bg-chart-2 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case IncidentStatus.pending:
        return 'bg-muted text-muted-foreground';
      case IncidentStatus.assigned:
        return 'bg-chart-2/20 text-chart-2';
      case IncidentStatus.inProgress:
        return 'bg-chart-1/20 text-chart-1';
      case IncidentStatus.resolved:
        return 'bg-chart-4/20 text-chart-4';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      await addComment.mutateAsync({
        incidentId: incident.id,
        comment: comment.trim(),
      });
      setComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    try {
      await updateStatus.mutateAsync({
        incidentId: incident.id,
        newStatus,
      });
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleCloseIncident = async () => {
    try {
      await closeIncident.mutateAsync(incident.id);
      toast.success('Incident closed');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to close incident');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{incident.title}</DialogTitle>
              <DialogDescription className="mt-2">
                Incident ID: #{incident.id.toString()}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={getSeverityColor(incident.severity)}>{incident.severity}</Badge>
              <Badge className={getStatusColor(incident.status)} variant="outline">
                {incident.status}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 pr-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium capitalize">{incident.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{incident.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Reported:</span>
                <span className="font-medium">{formatTimestamp(incident.timestamp)}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Reporter:</span>
                <span className="font-medium">{incident.isAnonymous ? 'Anonymous' : 'Identified'}</span>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{incident.description}</p>
            </div>

            {incident.image && (
              <div>
                <h3 className="font-semibold mb-2">Evidence</h3>
                <img
                  src={incident.image.getDirectURL()}
                  alt="Incident evidence"
                  className="w-full rounded-lg"
                />
              </div>
            )}

            {incident.assignedVolunteers.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Assigned Volunteers</h3>
                <p className="text-sm text-muted-foreground">
                  {incident.assignedVolunteers.length} volunteer(s) assigned
                </p>
              </div>
            )}

            <Separator />

            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4" />
                <h3 className="font-semibold">Comments ({incident.comments.length})</h3>
              </div>
              <div className="space-y-3">
                {incident.comments.map((comment, index) => (
                  <div key={index} className="p-3 rounded-lg bg-muted">
                    <p className="text-sm">{comment}</p>
                  </div>
                ))}
                {incident.comments.length === 0 && (
                  <p className="text-sm text-muted-foreground">No comments yet</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              <Button onClick={handleAddComment} disabled={addComment.isPending} className="w-full">
                {addComment.isPending ? 'Adding...' : 'Add Comment'}
              </Button>
            </div>

            {isEmergencyDesk && incident.status !== IncidentStatus.resolved && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold">Emergency Desk Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    {incident.status === IncidentStatus.pending && (
                      <Button
                        variant="outline"
                        onClick={() => handleStatusChange(IncidentStatus.assigned)}
                        disabled={updateStatus.isPending}
                      >
                        Mark as Assigned
                      </Button>
                    )}
                    {incident.status === IncidentStatus.assigned && (
                      <Button
                        variant="outline"
                        onClick={() => handleStatusChange(IncidentStatus.inProgress)}
                        disabled={updateStatus.isPending}
                      >
                        Mark In Progress
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      onClick={handleCloseIncident}
                      disabled={closeIncident.isPending}
                    >
                      Close Incident
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
