# Incident Escalation & Multi-Signature Resolution Guide

## Overview

The EmergencyCoordination contract now includes a comprehensive **Incident Escalation and Multi-Signature Resolution** system that ensures critical incidents receive appropriate attention and require consensus from trusted authorities before resolution.

---

## 🎯 Key Features

### 1. **Automatic Escalation**
- **Critical Severity**: Incidents with `Critical` severity are automatically escalated upon creation
- **Time-Based**: Incidents not acknowledged within the configurable time window are auto-escalated
- **Configurable**: Owner can adjust escalation parameters

### 2. **Multi-Role Approval System**
- Requires approval from Emergency Desk OR Community Leaders
- Trust score-weighted voting mechanism
- Prevents duplicate approvals with replay protection
- Automatic execution when threshold is met

### 3. **Trust Score Integration**
- Each approver's trust score contributes to total approval weight
- Higher trust scores = more voting power
- Encourages maintaining good reputation

### 4. **Security Features**
- Nonce-based replay protection
- Duplicate approval prevention
- Strict access control with modifiers
- State validation at every step

---

## 📊 Escalation States

```solidity
enum EscalationStatus {
    None,          // Not escalated
    Escalated,     // Escalated, awaiting approvals
    UnderReview,   // Approval process started
    Approved,      // Sufficient approvals received
    Rejected       // Reserved for future use
}
```

---

## 🔧 Configuration Parameters

### Escalation Time Window
- **Default**: 3600 seconds (1 hour)
- **Purpose**: Time before auto-escalation triggers
- **Updatable**: Owner only

### Required Approval Weight
- **Default**: 150 (total trust score)
- **Purpose**: Minimum combined trust score needed for resolution
- **Updatable**: Owner only

**Example**: If 2 approvers with trust scores of 75 each approve, total weight = 150 ✅

---

## 🚀 Usage Guide

### 1. Manual Escalation

**Who**: Emergency Desk only

```javascript
await contract.escalateIncident(
    incidentId,
    "Manual escalation: requires immediate attention"
);
```

**Emits**: `IncidentEscalated` event

---

### 2. Auto-Escalation Check

**Who**: Anyone can call (permissionless monitoring)

```javascript
// Check if incident can be auto-escalated
const [canEscalate, reason] = await contract.canAutoEscalate(incidentId);

if (canEscalate) {
    await contract.checkAndAutoEscalate(incidentId);
}
```

**Conditions**:
- Incident status = `Reported`
- Time since creation > `escalationTimeWindow`
- Not already escalated

---

### 3. Approve Escalated Resolution

**Who**: Emergency Desk OR Community Leaders (with verified status)

```javascript
await contract.approveEscalatedResolution(incidentId);
```

**Process**:
1. Validates caller is authorized
2. Checks for duplicate approval
3. Adds trust score to total weight
4. Updates escalation status to `UnderReview`
5. Auto-executes if threshold met

**Emits**: `ResolutionApproved` event

---

### 4. Execute Resolution

**Who**: Emergency Desk (when threshold is met)

```javascript
await contract.executeEscalatedResolution(incidentId);
```

**Process**:
1. Verifies sufficient approval weight
2. Marks resolution as executed
3. Updates incident status to `Resolved`
4. Updates escalation status to `Approved`

**Emits**: 
- `ResolutionExecuted` event
- `IncidentUpdated` event

---

### 5. Query Escalation Status

```javascript
// Get resolution details
const resolution = await contract.getEscalationResolution(incidentId);
console.log('Total Weight:', resolution.totalWeight);
console.log('Required Weight:', resolution.requiredWeight);
console.log('Approvers:', resolution.approverCount);
console.log('Executed:', resolution.executed);

// Get list of approvers
const approvers = await contract.getResolutionApprovers(incidentId);

// Get specific approval details
const approval = await contract.getApprovalDetails(incidentId, approverAddress);

// Check if address has approved
const hasApproved = await contract.hasApprovedResolution(incidentId, address);

// Get all escalated incidents
const escalatedIds = await contract.getEscalatedIncidents();
```

---

## 📋 Complete Workflow Example

### Scenario: Medical Emergency Escalation

```javascript
// 1. User reports critical incident
const tx1 = await contract.createIncident(
    "Cardiac Arrest",
    "Person collapsed, needs immediate help",
    0, // Medical
    3, // Critical
    40758000,  // latitude
    -73968000  // longitude
);

// ✅ Automatically escalated due to Critical severity
// Event emitted: IncidentEscalated(incidentId, severity, reason, timestamp, requiredWeight)

// 2. Emergency Desk member approves
await contract.connect(emergencyDesk1).approveEscalatedResolution(incidentId);
// Trust Score: 85, Current Weight: 85/150

// 3. Community Leader approves
await contract.connect(communityLeader1).approveEscalatedResolution(incidentId);
// Trust Score: 70, Current Weight: 155/150 ✅

// ✅ Automatically executed (threshold met)
// Events emitted:
// - ResolutionApproved(incidentId, approver, trustScore, currentWeight, requiredWeight)
// - ResolutionExecuted(incidentId, totalWeight, approverCount, timestamp)
// - IncidentUpdated(incidentId, Resolved)

// 4. Verify final state
const incident = await contract.getIncident(incidentId);
console.log('Status:', incident.status); // Resolved
console.log('Escalation Status:', incident.escalationStatus); // Approved
```

---

## 🔐 Access Control Matrix

| Function | Owner | Emergency Desk | Community Leader | Verified User | Anyone |
|----------|-------|----------------|------------------|---------------|--------|
| `escalateIncident` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `checkAndAutoEscalate` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `approveEscalatedResolution` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `executeEscalatedResolution` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `updateEscalationConfig` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `getEscalationResolution` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `canAutoEscalate` | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 📡 Events Reference

### IncidentEscalated
```solidity
event IncidentEscalated(
    uint256 indexed incidentId,
    IncidentSeverity severity,
    string reason,
    uint256 escalatedAt,
    uint256 requiredWeight
);
```

**Emitted**: When incident is escalated (auto or manual)

---

### ResolutionApproved
```solidity
event ResolutionApproved(
    uint256 indexed incidentId,
    address indexed approver,
    uint256 trustScore,
    uint256 currentWeight,
    uint256 requiredWeight
);
```

**Emitted**: When an authorized user approves resolution

---

### ResolutionExecuted
```solidity
event ResolutionExecuted(
    uint256 indexed incidentId,
    uint256 totalWeight,
    uint256 approverCount,
    uint256 executedAt
);
```

**Emitted**: When resolution is executed (threshold met)

---

### EscalationConfigUpdated
```solidity
event EscalationConfigUpdated(
    uint256 escalationTimeWindow,
    uint256 requiredApprovalWeight
);
```

**Emitted**: When owner updates configuration

---

## 🛡️ Security Considerations

### 1. **Replay Protection**
- Each escalation has a unique nonce
- Nonce increments with each new escalation
- Prevents old approvals from being reused

### 2. **Duplicate Prevention**
- Mapping tracks if address has already approved
- Prevents same approver from voting twice
- Clear error messages

### 3. **Trust Score Snapshots**
- Records trust score at time of approval
- Prevents retroactive trust score manipulation
- Transparent audit trail

### 4. **Gas Optimization**
- No unbounded loops in critical paths
- Efficient data structures
- Minimal storage operations

### 5. **State Validation**
- Modifiers ensure proper access control
- Checks incident exists before operations
- Validates escalation status at each step

---

## 📈 Gas Cost Estimates

| Function | Estimated Gas |
|----------|---------------|
| `escalateIncident` | ~120,000 |
| `checkAndAutoEscalate` | ~125,000 |
| `approveEscalatedResolution` | ~150,000 |
| `executeEscalatedResolution` | ~100,000 |
| `updateEscalationConfig` | ~45,000 |
| Query functions | ~30,000 - 50,000 |

*Note: Costs vary based on storage operations and existing state*

---

## 🔄 State Transitions

```
Incident Created (Critical) → Auto-Escalated
    ↓
EscalationStatus.Escalated
    ↓
First Approval → UnderReview
    ↓
Sufficient Weight → Auto-Execute
    ↓
EscalationStatus.Approved + IncidentStatus.Resolved
```

**OR**

```
Incident Created (Non-Critical) → Reported
    ↓
Time Window Exceeded
    ↓
checkAndAutoEscalate() → Escalated
    ↓
[Follow approval process above]
```

---

## 🧪 Testing Scenarios

### Test 1: Critical Auto-Escalation
```javascript
it("should auto-escalate critical incidents", async () => {
    const tx = await contract.createIncident(
        "Fire", "Building on fire", 1, 3, 0, 0
    );
    const incident = await contract.getIncident(1);
    expect(incident.escalationStatus).to.equal(1); // Escalated
});
```

### Test 2: Time-Based Escalation
```javascript
it("should escalate after time window", async () => {
    await contract.createIncident("Medical", "Help needed", 0, 2, 0, 0);
    
    // Fast forward time
    await ethers.provider.send("evm_increaseTime", [3601]);
    await ethers.provider.send("evm_mine");
    
    await contract.checkAndAutoEscalate(1);
    const incident = await contract.getIncident(1);
    expect(incident.escalationStatus).to.equal(1);
});
```

### Test 3: Multi-Signature Approval
```javascript
it("should require sufficient approval weight", async () => {
    // Create and escalate incident
    await contract.createIncident("Fire", "Emergency", 1, 3, 0, 0);
    
    // First approval (trust score: 85)
    await contract.connect(desk1).approveEscalatedResolution(1);
    let res = await contract.getEscalationResolution(1);
    expect(res.totalWeight).to.equal(85);
    
    // Second approval (trust score: 70) → Total: 155 ≥ 150 ✅
    await contract.connect(leader1).approveEscalatedResolution(1);
    
    const incident = await contract.getIncident(1);
    expect(incident.escalationStatus).to.equal(3); // Approved
    expect(incident.status).to.equal(3); // Resolved
});
```

### Test 4: Duplicate Prevention
```javascript
it("should prevent duplicate approvals", async () => {
    await contract.createIncident("Flood", "Flooding", 2, 3, 0, 0);
    await contract.connect(desk1).approveEscalatedResolution(1);
    
    await expect(
        contract.connect(desk1).approveEscalatedResolution(1)
    ).to.be.revertedWith("Already approved by this address");
});
```

---

## 🎓 Best Practices

### For Developers
1. **Always listen to events** for real-time updates
2. **Check escalation status** before attempting operations
3. **Use view functions** to validate state before transactions
4. **Handle errors gracefully** with try-catch blocks
5. **Test with different trust scores** to understand weights

### For Frontend Integration
```javascript
// Monitor escalation events
contract.on("IncidentEscalated", (incidentId, severity, reason, time, weight) => {
    console.log(`⚠️ Incident ${incidentId} escalated: ${reason}`);
    // Update UI, send notifications
});

contract.on("ResolutionApproved", (incidentId, approver, score, current, required) => {
    const progress = (current / required) * 100;
    console.log(`✅ Approval: ${progress}% complete`);
    // Update progress bar
});

contract.on("ResolutionExecuted", (incidentId, weight, count, time) => {
    console.log(`🎉 Incident ${incidentId} resolved by ${count} approvers`);
    // Show success message
});
```

### For System Administrators
1. **Configure appropriate time windows** based on incident types
2. **Set realistic approval weights** based on community size
3. **Monitor escalated incidents** regularly
4. **Adjust trust scores** to reflect user reliability
5. **Review approval patterns** for potential issues

---

## 🔧 Configuration Updates

### Update Time Window (1 hour → 30 minutes)
```javascript
await contract.connect(owner).updateEscalationConfig(
    1800,  // 30 minutes in seconds
    150    // Keep same approval weight
);
```

### Update Approval Weight (150 → 200)
```javascript
await contract.connect(owner).updateEscalationConfig(
    3600,  // Keep same time window
    200    // Require higher trust score total
);
```

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue**: "Incident already escalated"
- **Solution**: Check `escalationStatus` before calling escalate functions

**Issue**: "Only emergency desk or community leaders can approve"
- **Solution**: Ensure caller has proper role and is verified

**Issue**: "Already approved by this address"
- **Solution**: Check `hasApprovedResolution()` before attempting approval

**Issue**: "Insufficient approval weight"
- **Solution**: Need more approvals or higher trust score approvers

**Issue**: "Escalation time window not exceeded"
- **Solution**: Wait until `createdAt + escalationTimeWindow` before auto-escalation

---

## 📚 Additional Resources

- [Main Contract Documentation](./CONTRACT_INFO.md)
- [Integration Examples](./interactions.js)
- [Test Scenarios](./TEST_SCENARIOS.md)
- [Deployment Guide](../DEPLOYMENT.md)

---

**Last Updated**: December 29, 2025  
**Contract Version**: v2.0 (with Escalation)  
**Solidity Version**: ^0.8.20
