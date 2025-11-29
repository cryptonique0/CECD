import { useEffect, useState } from 'react';
import { AlertNotification, AlertType } from '../backend';
import { useGetUnreadNotifications, useMarkNotificationAsRead } from '../hooks/useQueries';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, Cloud, MapPin, Bell, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotificationPopup() {
  const { data: unreadNotifications = [] } = useGetUnreadNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const [displayedNotifications, setDisplayedNotifications] = useState<Set<string>>(new Set());
  const [visibleNotifications, setVisibleNotifications] = useState<AlertNotification[]>([]);

  useEffect(() => {
    // Filter out notifications that have already been displayed
    const newNotifications = unreadNotifications.filter(
      (notification) => !displayedNotifications.has(notification.id.toString())
    );

    if (newNotifications.length > 0) {
      // Show the most recent notification
      const latestNotification = newNotifications[0];
      setVisibleNotifications((prev) => [...prev, latestNotification]);
      setDisplayedNotifications((prev) => new Set([...prev, latestNotification.id.toString()]));

      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        handleDismiss(latestNotification.id);
      }, 10000);
    }
  }, [unreadNotifications, displayedNotifications]);

  const handleDismiss = (notificationId: bigint) => {
    setVisibleNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    markAsRead.mutate(notificationId);
  };

  const getAlertIcon = (alertType: AlertType) => {
    switch (alertType) {
      case AlertType.highRiskZone:
        return <AlertTriangle className="h-5 w-5" />;
      case AlertType.weatherWarning:
        return <Cloud className="h-5 w-5" />;
      case AlertType.unusualEvent:
        return <MapPin className="h-5 w-5" />;
      case AlertType.regionalTrend:
        return <TrendingUp className="h-5 w-5" />;
      case AlertType.systemAlert:
        return <Bell className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getAlertVariant = (alertType: AlertType): 'default' | 'destructive' => {
    switch (alertType) {
      case AlertType.highRiskZone:
      case AlertType.weatherWarning:
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getAlertTitle = (alertType: AlertType) => {
    switch (alertType) {
      case AlertType.highRiskZone:
        return 'High Risk Zone Detected';
      case AlertType.weatherWarning:
        return 'Weather Warning';
      case AlertType.unusualEvent:
        return 'Unusual Event Forecast';
      case AlertType.regionalTrend:
        return 'Regional Trend Alert';
      case AlertType.systemAlert:
        return 'System Alert';
      default:
        return 'Alert';
    }
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {visibleNotifications.map((notification) => (
        <Alert
          key={notification.id.toString()}
          variant={getAlertVariant(notification.alertType)}
          className={cn(
            'relative animate-in slide-in-from-right-5 shadow-lg border-2',
            'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90'
          )}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">{getAlertIcon(notification.alertType)}</div>
            <div className="flex-1 space-y-1">
              <AlertTitle className="font-semibold">
                {getAlertTitle(notification.alertType)}
              </AlertTitle>
              <AlertDescription className="text-sm">
                {notification.message}
                {notification.location && (
                  <span className="block mt-1 text-xs opacity-80">
                    Location: {notification.location}
                  </span>
                )}
              </AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => handleDismiss(notification.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  );
}
