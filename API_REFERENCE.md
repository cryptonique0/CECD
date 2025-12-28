# API Reference - Enterprise Services

## AI Service API

### `aiService.processMessage(userMessage: string): Promise<string>`
Process user message and generate contextual AI response.
- **Parameters**: User input text
- **Returns**: AI response text
- **Examples**: Fire, medical, flood, crime detection
- **Context**: Maintains conversation history (50 messages)

### `aiService.predictIncident(description: string): Promise<IncidentPrediction>`
Predict incident category and severity from description.
- **Returns**: `{ category, severity, confidence, reasoning }`
- **Categories**: Fire (0), Medical (1), Flood (2), Crime (3), Other (4)
- **Severity**: Low (0), Medium (1), High (2), Critical (3)
- **Confidence**: 0.0 - 1.0

### `aiService.identifyRiskAreas(incidents: any[]): Promise<RiskArea[]>`
Identify high-risk areas based on incident clustering.
- **Returns**: Top 10 risk areas with coordinates and risk scores
- **Risk Score**: 0.0 - 1.0 (normalized)
- **Uses**: Grid-based clustering algorithm

### `aiService.generateResponsePlan(incident: any): Promise<string>`
Generate tailored emergency response plan.
- **Returns**: Detailed action plan text
- **Includes**: Immediate actions, resources, next steps

### `aiService.generateInsights(incidents: any[]): Promise<string>`
Generate AI insights from incident data.
- **Returns**: Analysis and recommendations
- **Analyzes**: Trends, patterns, hotspots

---

## Notification Service API

### `notificationService.createNotification(...): Promise<Notification>`
```typescript
createNotification(
  type: 'incident' | 'alert' | 'volunteer' | 'announcement' | 'update',
  title: string,
  message: string,
  severity: 'info' | 'warning' | 'error' | 'critical',
  incidentId?: number
): Promise<Notification>
```
Creates and broadcasts notification across configured channels.

### `notificationService.subscribe(callback): () => void`
Subscribe to notification updates.
- **Returns**: Unsubscribe function
- **Triggers**: On every new notification

### `notificationService.getUnreadNotifications(): Notification[]`
Get all unread notifications sorted by timestamp.

### `notificationService.markAsRead(notificationId: string): void`
Mark single notification as read.

### `notificationService.markAllAsRead(): void`
Mark all notifications as read.

### `notificationService.updatePreferences(preferences: Partial<NotificationPreferences>): void`
Update notification delivery preferences.
```typescript
{
  channels: { email, push, sms, in_app },
  mutePeriodStart?: 22,    // Hour 0-23
  mutePeriodEnd?: 8,
  doNotDisturb: false
}
```

### `notificationService.requestPermission(): Promise<NotificationPermission>`
Request browser notification permission.

### `notificationService.getUnreadCount(): number`
Get count of unread notifications.

---

## Analytics Dashboard Service API

### `analyticsDashboardService.getCommunityMetrics(): Promise<CommunityMetrics>`
Get overall community emergency metrics.
- **Returns**: Incidents, volunteers, response time, engagement, uptime, alerts

### `analyticsDashboardService.getIncidentsByCategory(): Promise<CategoryBreakdown[]>`
Get incident distribution by category.
- **Returns**: Array of categories with counts and trends

### `analyticsDashboardService.getSeverityDistribution(): Promise<Record<string, number>>`
Get incident distribution by severity level.

### `analyticsDashboardService.getIncidentTimeSeries(days: number = 30): Promise<TimeSeriesData[]>`
Get incident timeline data for specified period.
- **Returns**: Array of daily incident counts

### `analyticsDashboardService.getTopIncidentLocations(limit: number = 10): Promise<LocationData[]>`
Get highest-risk incident locations.
- **Returns**: Locations with coordinates and risk scores

### `analyticsDashboardService.getVolunteerMetrics(): Promise<VolunteerMetrics>`
Get volunteer performance and engagement metrics.

### `analyticsDashboardService.getResponseTimeAnalytics(): Promise<ResponseMetrics>`
Get incident response time statistics.

### `analyticsDashboardService.getSystemHealth(): Promise<SystemHealth>`
Get system uptime and performance metrics.

### `analyticsDashboardService.generateReport(): Promise<string>`
Generate comprehensive analytics report.

### `analyticsDashboardService.clearCache(): void`
Clear cached metrics.

---

## Celo Blockchain Service API

### `celoBlockchainService.getAccountInfo(address: string): Promise<CeloAccount>`
Get user's Celo wallet information.
- **Returns**: Balances in CELO, cUSD, cEUR, cREAL

### `celoBlockchainService.processDonation(...): Promise<CeloDonation>`
```typescript
processDonation(
  donor: string,
  amount: string,
  currency: 'cUSD' | 'cEUR' | 'cREAL',
  incidentId: number
): Promise<CeloDonation>
```
Process donation to incident with transaction hash.

### `celoBlockchainService.getIncidentDonations(incidentId: number): Promise<CeloDonation[]>`
Get all donations for incident.

### `celoBlockchainService.getIncidentDonationTotal(incidentId: number): Promise<Record<string, string>>`
Get total donations by currency.

### `celoBlockchainService.convertCurrency(amount, from, to): Promise<string>`
Convert between Celo stablecoins.

### `celoBlockchainService.getValidatorHealth(): Promise<ValidatorHealth>`
Get Celo validator network health.

### `celoBlockchainService.getNetworkStatus(): Promise<NetworkStatus>`
Get Celo network statistics.

### `celoBlockchainService.createFundraisingCampaign(...): Promise<Campaign>`
Create fundraising campaign for incident.

### `celoBlockchainService.executeTransaction(...): Promise<TxResult>`
Execute blockchain transaction.

### `celoBlockchainService.getDonationAnalytics(): Promise<DonationAnalytics>`
Get donation trends and statistics.

---

## Offline Support Service API

### `offlineSupportService.registerServiceWorker(): Promise<ServiceWorkerRegistration | null>`
Register service worker for offline support.

### `offlineSupportService.queueIncidentForSync(incidentData: any): Promise<string>`
Queue incident report for offline submission.
- **Returns**: Queue item ID

### `offlineSupportService.cacheIncidents(incidents: any[]): Promise<void>`
Cache incident data for offline viewing.

### `offlineSupportService.getCachedIncidents(): Promise<any[]>`
Retrieve cached incidents.

### `offlineSupportService.syncPendingIncidents(): Promise<void>`
Manually trigger sync of pending incidents.

### `offlineSupportService.isOnline(): boolean`
Check current connectivity status.

### `offlineSupportService.setupConnectivityListeners(onOnline?, onOffline?): () => void`
Setup online/offline event listeners.
- **Returns**: Unsubscribe function

### `offlineSupportService.getOfflineStats(): OfflineStats`
Get offline status information.
- **Returns**: Online status, pending/cached count, last sync time

### `offlineSupportService.clearOfflineData(): Promise<void>`
Clear all offline cached data.

### `offlineSupportService.getServiceWorkerStatus(): Promise<SWStatus>`
Get service worker registration status.

---

## Multi-Signature Wallet Service API

### `multiSigWalletService.createWallet(...): Promise<MultiSigWallet>`
```typescript
createWallet(
  name: string,
  owners: string[],
  requiredSignatures: number
): Promise<MultiSigWallet>
```
Create new multi-signature wallet.

### `multiSigWalletService.getWallet(address: string): MultiSigWallet | undefined`
Get wallet details by address.

### `multiSigWalletService.proposeTransaction(...): Promise<MultiSigTransaction>`
Propose new transaction for approval.
- **Returns**: Transaction object with pending signatures

### `multiSigWalletService.signTransaction(txId, signer, signature): Promise<MultiSigTransaction>`
Sign pending transaction.
- **Auto-executes** when threshold reached

### `multiSigWalletService.getTransaction(txId: string): MultiSigTransaction | undefined`
Get transaction details.

### `multiSigWalletService.getApprovalStatus(txId: string): ApprovalStatus`
Get detailed transaction approval information.
- **Returns**: Approvers, pending, threshold

### `multiSigWalletService.addFunds(address, amount): Promise<MultiSigWallet>`
Add funds to wallet.

### `multiSigWalletService.getWalletStats(): WalletStats`
Get multi-sig wallet statistics.

### `multiSigWalletService.createEmergencyFund(...): Promise<MultiSigWallet>`
Create emergency fund with 2-of-3 authorization.

### `multiSigWalletService.createReliefWallet(...): Promise<MultiSigWallet>`
Create relief fund with majority rule.

### `multiSigWalletService.proposeReliefPayment(...): Promise<MultiSigTransaction>`
Propose emergency relief payment.

### `multiSigWalletService.cancelTransaction(txId, cancelledBy): Promise<void>`
Cancel pending transaction (proposer only).

---

## Data Structures

### IncidentPrediction
```typescript
{
  category: number;        // 0-4
  severity: number;        // 0-3
  confidence: number;      // 0.0-1.0
  reasoning: string;       // Explanation
}
```

### CeloDonation
```typescript
{
  id: string;
  donor: string;
  amount: string;
  currency: 'cUSD' | 'cEUR' | 'cREAL';
  incidentId: number;
  timestamp: number;
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
}
```

### MultiSigTransaction
```typescript
{
  id: string;
  walletAddress: string;
  to: string;
  amount: string;
  purpose: string;
  proposedBy: string;
  signatures: Map<string, string>;
  requiredSignatures: number;
  status: 'pending' | 'approved' | 'executed' | 'rejected';
  createdAt: number;
  executedAt?: number;
}
```

### Notification
```typescript
{
  id: string;
  type: 'incident' | 'alert' | 'volunteer' | 'announcement' | 'update';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: number;
  read: boolean;
  incidentId?: number;
}
```

---

## Error Handling

All services implement try-catch with user-friendly error messages:
```typescript
try {
  await celoBlockchainService.processDonation(...);
} catch (error) {
  toast.error('Failed to process donation: ' + error.message);
}
```

---

## Rate Limiting

- **Analytics**: 5-minute cache on all metrics
- **Blockchain**: 1 request per second per address
- **Notifications**: 100 per minute per user
- **AI Service**: 30 requests per minute per user

---

## Caching Strategy

| Service | Cache Duration | Strategy |
|---------|---------------|----------|
| Analytics | 5 minutes | Time-based |
| Blockchain | 30 seconds | Time-based |
| Incidents | 1 hour | Time-based |
| Notifications | Session | Memory |
| AI Responses | Session | Conversation |
