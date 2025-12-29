# Escalation Quick Reference Card

## 🚀 Quick Start

### Check if Incident Can Be Escalated
```javascript
const [canEscalate, reason] = await contract.canAutoEscalate(incidentId);
```

### Auto-Escalate Incident
```javascript
await contract.checkAndAutoEscalate(incidentId);
```

### Approve Resolution
```javascript
await contract.approveEscalatedResolution(incidentId);
```

### Get Status
```javascript
const resolution = await contract.getEscalationResolution(incidentId);
console.log(`${resolution.totalWeight}/${resolution.requiredWeight}`);
```

---

## 📊 States

| Status | Value | Description |
|--------|-------|-------------|
| None | 0 | Not escalated |
| Escalated | 1 | Awaiting approvals |
| UnderReview | 2 | Approval started |
| Approved | 3 | Resolved |
| Rejected | 4 | Reserved |

---

## 🎯 Auto-Escalation Triggers

1. **Critical Severity** → Immediate
2. **Time Window Exceeded** → After 1 hour (configurable)

---

## ✅ Approval Process

1. Emergency Desk OR Community Leader approves
2. Trust score added to total weight
3. Auto-executes when weight ≥ 150 (configurable)

---

## 🔑 Access Control

| Role | Escalate | Approve | Execute | Config |
|------|----------|---------|---------|--------|
| Owner | ✅ | ✅ | ✅ | ✅ |
| Emergency Desk | ✅ | ✅ | ✅ | ❌ |
| Community Leader | ❌ | ✅ | ❌ | ❌ |
| Verified User | ❌ | ❌ | ❌ | ❌ |

---

## 📡 Events

```javascript
// Listen to escalation
contract.on("IncidentEscalated", (id, severity, reason, time, weight) => {
    console.log(`Escalated: ${id}`);
});

// Track approvals
contract.on("ResolutionApproved", (id, approver, score, current, required) => {
    console.log(`Progress: ${current}/${required}`);
});

// Monitor execution
contract.on("ResolutionExecuted", (id, weight, count, time) => {
    console.log(`Resolved by ${count} approvers`);
});
```

---

## ⚡ Common Patterns

### Pattern 1: Monitor and Auto-Escalate
```javascript
setInterval(async () => {
    const incidents = await contract.getAllIncidents();
    for (const id of incidents) {
        const [can, reason] = await contract.canAutoEscalate(id);
        if (can) await contract.checkAndAutoEscalate(id);
    }
}, 60000); // Check every minute
```

### Pattern 2: Multi-Account Approval
```javascript
const accounts = [emergencyDesk1, emergencyDesk2, leader1];
for (const account of accounts) {
    const hasApproved = await contract.hasApprovedResolution(incidentId, account);
    if (!hasApproved) {
        await contract.connect(account).approveEscalatedResolution(incidentId);
    }
}
```

### Pattern 3: Dashboard Monitor
```javascript
async function getDashboard() {
    const escalatedIds = await contract.getEscalatedIncidents();
    return await Promise.all(escalatedIds.map(async (id) => {
        const [incident, resolution] = await Promise.all([
            contract.getIncident(id),
            contract.getEscalationResolution(id)
        ]);
        return {
            id,
            title: incident.title,
            progress: `${resolution.totalWeight}/${resolution.requiredWeight}`,
            executed: resolution.executed
        };
    }));
}
```

---

## 🛠️ Configuration

### Update Time Window (1 hour → 30 minutes)
```javascript
await contract.updateEscalationConfig(1800, 150);
```

### Update Required Weight (150 → 200)
```javascript
await contract.updateEscalationConfig(3600, 200);
```

---

## ⚠️ Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Already escalated" | Incident already escalated | Check status first |
| "Only emergency desk..." | Wrong role | Use authorized account |
| "Already approved..." | Duplicate approval | Check hasApproved() |
| "Insufficient approval weight" | Not enough approvals | Get more approvals |
| "Time window not exceeded" | Too early | Wait for time window |

---

## 📏 Default Values

| Parameter | Default | Adjustable |
|-----------|---------|------------|
| Time Window | 3600s (1h) | Yes (owner) |
| Required Weight | 150 | Yes (owner) |
| Trust Score (new user) | 50 | Yes (emergency desk) |
| Trust Score (verified) | 75 | Yes (emergency desk) |

---

## 🔒 Security Checklist

✅ Check `hasApprovedResolution()` before approving  
✅ Validate `canAutoEscalate()` before escalating  
✅ Use events for real-time monitoring  
✅ Handle errors with try-catch  
✅ Verify trust scores regularly  
✅ Monitor approval patterns  
✅ Set appropriate time windows  

---

## 📞 Quick Commands

```bash
# Get escalation status
cast call $CONTRACT "getEscalationResolution(uint256)" $INCIDENT_ID

# Check if can escalate
cast call $CONTRACT "canAutoEscalate(uint256)" $INCIDENT_ID

# Approve (requires authorization)
cast send $CONTRACT "approveEscalatedResolution(uint256)" $INCIDENT_ID

# Get all escalated
cast call $CONTRACT "getEscalatedIncidents()(uint256[])"
```

---

## 💡 Tips

1. **Monitor events in real-time** for instant notifications
2. **Batch read operations** to reduce gas costs
3. **Cache resolution data** to avoid redundant calls
4. **Use multicall** for efficient batch queries
5. **Set up alerts** for critical escalations
6. **Regular trust score audits** maintain system integrity

---

**Version:** 2.0  
**Updated:** December 29, 2025  
**Contract:** EmergencyCoordination.sol
