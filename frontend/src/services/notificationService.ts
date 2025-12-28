/**
 * Real-time Notification Service
 * Handles push notifications, WebSocket connections, and notification management
 */

export interface Notification {
  id: string;
  type: 'incident' | 'alert' | 'volunteer' | 'announcement' | 'update';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: number;
  read: boolean;
  incidentId?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

export interface NotificationChannel {
  email: boolean;
  push: boolean;
  sms: boolean;
  in_app: boolean;
}

export interface NotificationPreferences {
  channels: NotificationChannel;
  mutePeriodStart?: number; // Hour 0-23
  mutePeriodEnd?: number;
  doNotDisturb: boolean;
}

class RealTimeNotificationService {
  private notifications: Map<string, Notification> = new Map();
  private listeners: Set<(notification: Notification) => void> = new Set();
  private preferences: NotificationPreferences = {
    channels: {
      email: true,
      push: true,
      sms: false,
      in_app: true,
    },
    doNotDisturb: false,
  };
  private unreadCount = 0;

  /**
   * Subscribe to notification updates
   */
  subscribe(callback: (notification: Notification) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Emit notification to all subscribers
   */
  private emitNotification(notification: Notification): void {
    this.listeners.forEach(listener => listener(notification));
  }

  /**
   * Create and broadcast a new notification
   */
  async createNotification(
    type: Notification['type'],
    title: string,
    message: string,
    severity: Notification['severity'] = 'info',
    incidentId?: number
  ): Promise<Notification> {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      severity,
      timestamp: Date.now(),
      read: false,
      incidentId,
    };

    this.notifications.set(notification.id, notification);
    this.unreadCount++;

    // Check if should deliver based on preferences
    if (this.shouldDeliver(severity)) {
      this.emitNotification(notification);
      await this.deliverToChannels(notification);
    }

    return notification;
  }

  /**
   * Determine if notification should be delivered based on preferences
   */
  private shouldDeliver(severity: Notification['severity']): boolean {
    if (this.preferences.doNotDisturb && severity === 'info') {
      return false;
    }
    return true;
  }

  /**
   * Deliver notification to configured channels
   */
  private async deliverToChannels(notification: Notification): Promise<void> {
    const { channels } = this.preferences;

    if (channels.push) {
      this.sendPushNotification(notification);
    }
    if (channels.email) {
      this.sendEmailNotification(notification);
    }
    if (channels.sms && notification.severity === 'critical') {
      this.sendSMSNotification(notification);
    }
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(notification: Notification): Promise<void> {
    if (!('Notification' in window)) {
      console.log('Push notifications not supported');
      return;
    }

    if (Notification.permission === 'granted') {
      try {
        new Notification(notification.title, {
          body: notification.message,
          tag: notification.type,
          badge: '/icon-badge.png',
          sound: notification.severity === 'critical' ? '/alert-sound.mp3' : undefined,
        });
      } catch (error) {
        console.error('Failed to send push notification:', error);
      }
    }
  }

  /**
   * Mock email notification
   */
  private async sendEmailNotification(notification: Notification): Promise<void> {
    console.log('📧 Email sent:', notification.title, notification.message);
  }

  /**
   * Mock SMS notification (for critical incidents)
   */
  private async sendSMSNotification(notification: Notification): Promise<void> {
    console.log('📱 SMS sent:', notification.title, notification.message);
  }

  /**
   * Get all notifications
   */
  getAllNotifications(): Notification[] {
    return Array.from(this.notifications.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(): Notification[] {
    return Array.from(this.notifications.values())
      .filter(n => !n.read)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.unreadCount = 0;
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification && !notification.read) {
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    }
    this.notifications.delete(notificationId);
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications.clear();
    this.unreadCount = 0;
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.unreadCount;
  }

  /**
   * Update notification preferences
   */
  updatePreferences(preferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
  }

  /**
   * Get current preferences
   */
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    if (Notification.permission !== 'granted') {
      return await Notification.requestPermission();
    }

    return 'granted';
  }

  /**
   * Simulate emergency notifications for testing
   */
  async simulateEmergencyNotifications(): Promise<void> {
    const scenarios = [
      {
        type: 'incident' as const,
        title: '🚨 Fire Emergency Reported',
        message: 'A fire has been reported 2 blocks away. Evacuation recommended.',
        severity: 'critical' as const,
      },
      {
        type: 'alert' as const,
        title: '⚠️ Flood Warning',
        message: 'Heavy rain expected. Evacuation centers are being opened.',
        severity: 'warning' as const,
      },
      {
        type: 'volunteer' as const,
        title: '👥 Urgent Volunteer Needed',
        message: 'Medical personnel needed near Central Park. 3 minutes away.',
        severity: 'warning' as const,
      },
      {
        type: 'announcement' as const,
        title: '📢 Community Update',
        message: 'All incidents in downtown area have been resolved.',
        severity: 'info' as const,
      },
    ];

    for (const scenario of scenarios) {
      await this.createNotification(
        scenario.type,
        scenario.title,
        scenario.message,
        scenario.severity
      );
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

export const notificationService = new RealTimeNotificationService();
