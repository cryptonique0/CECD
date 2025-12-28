# Integration Examples

## Dashboard Integration with AI Service

```typescript
import { useEffect, useState } from 'react';
import { aiService } from '@/services/aiService';

export function IncidentReportForm() {
  const [description, setDescription] = useState('');
  const [prediction, setPrediction] = useState(null);

  const handleDescriptionChange = async (text: string) => {
    setDescription(text);
    
    // Real-time AI prediction
    if (text.length > 20) {
      const pred = await aiService.predictIncident(text);
      setPrediction(pred);
    }
  };

  return (
    <form>
      <textarea
        value={description}
        onChange={(e) => handleDescriptionChange(e.target.value)}
        placeholder="Describe the emergency..."
      />
      
      {prediction && (
        <div>
          <p>Predicted Category: {prediction.category}</p>
          <p>Predicted Severity: {prediction.severity}</p>
          <p>Confidence: {(prediction.confidence * 100).toFixed(0)}%</p>
        </div>
      )}
    </form>
  );
}
```

## Real-Time Notifications in React

```typescript
import { useEffect, useState } from 'react';
import { notificationService } from '@/services/notificationService';

export function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Subscribe to new notifications
    const unsubscribe = notificationService.subscribe((notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return unsubscribe;
  }, []);

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <div>
      <h3>Notifications ({unreadCount} unread)</h3>
      {notifications.map(notif => (
        <div key={notif.id} onClick={() => handleMarkAsRead(notif.id)}>
          <h4>{notif.title}</h4>
          <p>{notif.message}</p>
          <span className={`severity-${notif.severity}`}>
            {notif.severity}
          </span>
        </div>
      ))}
    </div>
  );
}
```

## Analytics Dashboard Display

```typescript
import { useEffect, useState } from 'react';
import { analyticsDashboardService } from '@/services/analyticsDashboardService';
import { Card } from '@/components/ui/card';

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const loadAnalytics = async () => {
      const [m, c, l] = await Promise.all([
        analyticsDashboardService.getCommunityMetrics(),
        analyticsDashboardService.getIncidentsByCategory(),
        analyticsDashboardService.getTopIncidentLocations(5),
      ]);
      
      setMetrics(m);
      setCategories(c);
      setLocations(l);
    };

    loadAnalytics();
    const interval = setInterval(loadAnalytics, 5 * 60 * 1000); // Refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <h3>Total Incidents</h3>
        <p className="text-4xl font-bold">{metrics?.totalIncidents}</p>
      </Card>
      
      <Card>
        <h3>Active Volunteers</h3>
        <p className="text-4xl font-bold">{metrics?.activeVolunteers}</p>
      </Card>
      
      <Card>
        <h3>Avg Response Time</h3>
        <p className="text-4xl font-bold">{metrics?.avgResponseTime}m</p>
      </Card>

      <Card>
        <h3>Incidents by Category</h3>
        {categories.map(cat => (
          <div key={cat.name}>
            {cat.name}: {cat.count} ({cat.percentage}%)
          </div>
        ))}
      </Card>

      <Card>
        <h3>High-Risk Locations</h3>
        {locations.map(loc => (
          <div key={loc.location}>
            {loc.location}: Risk Score {(loc.riskScore * 100).toFixed(0)}%
          </div>
        ))}
      </Card>
    </div>
  );
}
```

## Celo Donation Processing

```typescript
import { celoBlockchainService } from '@/services/celoBlockchainService';
import { toast } from 'sonner';

export async function handleDonation(
  donor: string,
  incidentId: number,
  amount: string,
  currency: 'cUSD' | 'cEUR' | 'cREAL'
) {
  try {
    toast.loading('Processing donation...');
    
    const donation = await celoBlockchainService.processDonation(
      donor,
      amount,
      currency,
      incidentId
    );

    toast.success(
      `Donated ${amount} ${currency}`,
      { description: `Transaction: ${donation.txHash}` }
    );

    return donation;
  } catch (error) {
    toast.error('Donation failed: ' + error.message);
  }
}
```

## Offline Incident Queue

```typescript
import { useEffect, useState } from 'react';
import { offlineSupportService } from '@/services/offlineSupportService';

export function OfflineIndicator() {
  const [status, setStatus] = useState({
    isOnline: true,
    pendingIncidents: 0,
    lastSync: 0,
  });

  useEffect(() => {
    // Initial setup
    offlineSupportService.registerServiceWorker();

    // Setup listeners
    const unsubscribe = offlineSupportService.setupConnectivityListeners(
      async () => {
        // Went online
        await offlineSupportService.syncPendingIncidents();
        updateStatus();
      },
      () => {
        // Went offline
        updateStatus();
      }
    );

    function updateStatus() {
      setStatus(offlineSupportService.getOfflineStats());
    }

    updateStatus();
    const interval = setInterval(updateStatus, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={status.isOnline ? 'text-green-600' : 'text-red-600'}>
      {status.isOnline ? '✓ Online' : '⚠️ Offline'}
      {status.pendingIncidents > 0 && (
        <span> - {status.pendingIncidents} pending</span>
      )}
    </div>
  );
}
```

## Multi-Signature Wallet Approval Flow

```typescript
import { multiSigWalletService } from '@/services/multiSigWalletService';
import { toast } from 'sonner';

export async function approveEmergencyPayment(
  walletAddress: string,
  transactionId: string,
  signerAddress: string
) {
  try {
    // Generate signature (in real app, use wallet signing)
    const signature = `0x${Array(130).fill('0').map(() => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`;

    const tx = await multiSigWalletService.signTransaction(
      transactionId,
      signerAddress,
      signature
    );

    const status = multiSigWalletService.getApprovalStatus(transactionId);

    if (tx.status === 'executed') {
      toast.success('Payment approved and executed!');
    } else {
      toast.info(
        `Payment signed (${status.approvalsReceived}/${status.approvalsNeeded})`
      );
    }
  } catch (error) {
    toast.error('Failed to sign: ' + error.message);
  }
}
```

## AI Chatbot Integration

```typescript
import { useState } from 'react';
import { aiService } from '@/services/aiService';

export function EmergencyChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async (text: string) => {
    // Add user message
    setMessages(prev => [...prev, { role: 'user', text }]);

    // Get AI response
    const response = await aiService.processMessage(text);
    
    // Add AI message
    setMessages(prev => [...prev, { role: 'assistant', text: response }]);

    setInput('');
  };

  return (
    <div>
      <div className="chat-container">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.text}
          </div>
        ))}
      </div>
      
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            sendMessage(input);
          }
        }}
        placeholder="Ask for emergency help..."
      />
    </div>
  );
}
```

## Combined Incident Workflow

```typescript
import { contractService } from '@/services/contractService';
import { aiService } from '@/services/aiService';
import { notificationService } from '@/services/notificationService';
import { celoBlockchainService } from '@/services/celoBlockchainService';
import { offlineSupportService } from '@/services/offlineSupportService';

export async function reportEmergency(
  title: string,
  description: string,
  location: { lat: number; lng: number },
  mediaFiles: File[]
) {
  try {
    // Step 1: AI prediction
    const prediction = await aiService.predictIncident(description);

    // Step 2: Submit incident on-chain
    const incident = await contractService.createIncident(
      title,
      description,
      prediction.category,
      prediction.severity,
      location.lat,
      location.lng
    );

    // Step 3: Broadcast notification
    await notificationService.createNotification(
      'incident',
      `Emergency Reported: ${title}`,
      description,
      ['low', 'medium', 'high', 'critical'][prediction.severity],
      incident.id
    );

    // Step 4: Create fundraising campaign if critical
    if (prediction.severity === 3) {
      await celoBlockchainService.createFundraisingCampaign(
        incident.id,
        '5000',
        `Emergency relief for: ${title}`
      );
    }

    // Step 5: Cache offline if not online
    if (!offlineSupportService.isOnline()) {
      await offlineSupportService.queueIncidentForSync({
        title,
        description,
        location,
        mediaFiles,
      });
    }

    return incident;
  } catch (error) {
    console.error('Failed to report emergency:', error);
    throw error;
  }
}
```

These examples demonstrate how to integrate the advanced services into your React components and workflows.
