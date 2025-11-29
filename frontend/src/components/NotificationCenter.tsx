import { useState } from 'react';
import { AlertNotification, AlertType } from '../backend';
import {
  useGetAllNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '../hooks/useQueries';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Bell, AlertTriangle, Cloud, MapPin, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationCenterProps {
  unreadCount: number;
}

export default function NotificationCenter({ unreadCount }: NotificationCenterProps) {
  const { data: notifications = [], isLoading } = useGetAllNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const [open, setOpen] = useState(false);

  const handleMarkAsRead = (notificationId: bigint) => {
    markAsRead.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const getAlertIcon = (alertType: AlertType) => {
    switch (alertType) {
      case AlertType.highRiskZone:
        return <AlertTriangle className="h-4 w-4" />;
      case AlertType.weatherWarning:
        return <Cloud className="h-4 w-4" />;
      case AlertType.unusualEvent:
        return <MapPin className="h-4 w-4" />;
      case AlertType.systemAlert:
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertColor = (alertType: AlertType) => {
    switch (alertType) {
      case AlertType.highRiskZone:
        return 'text-destructive';
      case AlertType.weatherWarning:
        return 'text-chart-1';
      case AlertType.unusualEvent:
        return 'text-chart-2';
      case AlertType.systemAlert:
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  const getAlertLabel = (alertType: AlertType) => {
    switch (alertType) {
      case AlertType.highRiskZone:
        return 'High Risk';
      case AlertType.weatherWarning:
        return 'Weather';
      case AlertType.unusualEvent:
        return 'Unusual Event';
      case AlertType.systemAlert:
        return 'System';
      default:
        return 'Alert';
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const sortedNotifications = [...notifications].sort(
    (a, b) => Number(b.timestamp - a.timestamp)
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            Stay updated on high-risk zones and emergency alerts
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
              className="w-full"
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}

          <ScrollArea className="h-[calc(100vh-200px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">Loading notifications...</p>
              </div>
            ) : sortedNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedNotifications.map((notification, index) => (
                  <div key={notification.id.toString()}>
                    <div
                      className={cn(
                        'rounded-lg p-3 transition-colors cursor-pointer',
                        notification.isRead
                          ? 'bg-muted/30 hover:bg-muted/50'
                          : 'bg-accent hover:bg-accent/80'
                      )}
                      onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn('mt-0.5', getAlertColor(notification.alertType))}>
                          {getAlertIcon(notification.alertType)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant="outline" className="text-xs">
                              {getAlertLabel(notification.alertType)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{notification.message}</p>
                          {notification.location && (
                            <p className="text-xs text-muted-foreground">
                              📍 {notification.location}
                            </p>
                          )}
                        </div>
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {index < sortedNotifications.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
