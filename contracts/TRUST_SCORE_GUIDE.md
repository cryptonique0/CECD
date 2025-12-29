# Trust Score Decay & Security Constants - Usage Guide

**Version:** 2.1  
**Date:** December 29, 2025  
**Features:** Trust Score Decay, Escalation Constants, Bad Actor Management  

---

## 🎯 Overview

Version 2.1 adds three critical security enhancements:
1. **Trust Score Decay** - Automatic penalty for inactive users
2. **Escalation Timeout Constants** - Hardcoded security boundaries
3. **Bad Actor Management** - Tools to reduce trust scores

---

## 📊 Constants Reference

### Escalation Timeout Constants

```solidity
MIN_ESCALATION_WINDOW = 300      // 5 minutes minimum
MAX_ESCALATION_WINDOW = 86400    // 24 hours maximum
DEFAULT_ESCALATION_WINDOW = 3600 // 1 hour default
CRITICAL_ESCALATION_DELAY = 0    // Immediate for critical
```

**Purpose:** Prevents misconfiguration of escalation timeouts.

**Usage:**
```javascript
// Owner can only set between MIN and MAX
await contract.updateEscalationConfig(
    1800,  // 30 minutes (within bounds)
    200
);

// This will REVERT:
await contract.updateEscalationConfig(
    120,   // 2 minutes (below MIN_ESCALATION_WINDOW)
    200
);
```

---

### Trust Score Constants

```solidity
MAX_TRUST_SCORE = 100        // Maximum trust score
MIN_TRUST_SCORE = 10         // Minimum trust score (floor)
DEFAULT_TRUST_SCORE = 50     // New user score
VERIFIED_TRUST_SCORE = 75    // Score after verification
```

**Purpose:** Establishes trust score boundaries and prevents gaming.

**Automatic Enforcement:**
- New users start at 50
- Cannot go below 10 (safety floor)
- Cannot exceed 100 (prevents inflation)
- Verified users get 75

---

## 🔄 Trust Score Decay System

### How It Works

```
User inactive for X days → Trust score decays by Y points per day → Cannot drop below 10
```

### Default Configuration

```javascript
trustScoreDecayRate = 1       // Lose 1 point per period
trustScoreDecayPeriod = 86400 // 1 day (in seconds)
trustScoreDecayEnabled = true // Active by default
```

### Decay Calculation

```javascript
Time Inactive = Current Time - Last Update
Periods Elapsed = Time Inactive / Decay Period
Decay Amount = Periods Elapsed × Decay Rate

New Score = Max(Current Score - Decay Amount, MIN_TRUST_SCORE)
```

**Example:**
- User trust score: 80
- Inactive for 10 days
- Decay: 10 days × 1 point/day = 10 points
- New score: 80 - 10 = 70

---

## 🚀 Usage Examples

### 1. Manual Decay Application

**Check Decay Status:**
```javascript
const status = await contract.getTrustScoreDecayStatus(userAddress);
console.log('Current Score:', status.currentScore);
console.log('Time Inactive:', status.timeSinceUpdate, 'seconds');
console.log('Periods Elapsed:', status.periodsElapsed);
console.log('Pending Decay:', status.pendingDecay, 'points');
```

**Apply Decay:**
```javascript
// Single user
await contract.applyTrustScoreDecay(userAddress);

// Batch application
const users = [addr1, addr2, addr3, addr4];
await contract.batchApplyTrustScoreDecay(users);
```

---

### 2. Reduce Trust Score (Bad Behavior)

**Emergency Desk Only:**
```javascript
// Reduce score for false incident report
await contract.reduceTrustScore(
    userAddress,
    15,  // Reduce by 15 points
    "False emergency report - wasting resources"
);

// Events emitted:
// TrustScoreReduced(user, 75, 60, 15, "False emergency report...")
```

**Common Penalties:**
```javascript
// Minor offense
await contract.reduceTrustScore(user, 5, "Minor policy violation");

// Moderate offense
await contract.reduceTrustScore(user, 15, "False report");

// Serious offense
await contract.reduceTrustScore(user, 30, "Malicious behavior");
```

---

### 3. Increase Trust Score (Good Behavior)

**Emergency Desk Only:**
```javascript
// Reward for exceptional service
await contract.increaseTrustScore(
    volunteerAddress,
    10,  // Increase by 10 points
    "Exceptional volunteer service during crisis"
);

// Events emitted:
// TrustScoreIncreased(user, 75, 85, "Exceptional volunteer service...")
```

**Common Rewards:**
```javascript
// Verified assistance
await contract.increaseTrustScore(user, 5, "Verified incident assistance");

// Multiple successful responses
await contract.increaseTrustScore(user, 10, "10 successful responses");

// Outstanding contribution
await contract.increaseTrustScore(user, 15, "Outstanding community contribution");
```

---

### 4. Configure Decay Parameters

**Owner Only:**
```javascript
// Update decay configuration
await contract.updateTrustScoreDecayConfig(
    2,       // 2 points per period
    172800,  // 2 days per period
    true     // Enable decay
);

// Events emitted:
// TrustScoreDecayConfigUpdated(2, 172800, true)
```

**Common Configurations:**

**Aggressive Decay:**
```javascript
await contract.updateTrustScoreDecayConfig(
    2,      // 2 points per day
    86400,  // 1 day
    true
);
```

**Moderate Decay (Default):**
```javascript
await contract.updateTrustScoreDecayConfig(
    1,      // 1 point per day
    86400,  // 1 day
    true
);
```

**Lenient Decay:**
```javascript
await contract.updateTrustScoreDecayConfig(
    1,       // 1 point per week
    604800,  // 7 days
    true
);
```

**Disable Decay:**
```javascript
await contract.updateTrustScoreDecayConfig(
    1,
    86400,
    false  // Disabled
);
```

---

## 📊 Monitoring & Analytics

### Check Decay Status Dashboard

```javascript
async function getTrustScoreReport(userAddress) {
    const profile = await contract.getUserProfile(userAddress);
    const status = await contract.getTrustScoreDecayStatus(userAddress);
    
    return {
        name: profile.name,
        currentScore: status.currentScore.toString(),
        lastUpdate: new Date(
            (await contract.lastTrustScoreUpdate(userAddress)).toNumber() * 1000
        ).toISOString(),
        inactiveDays: Math.floor(status.timeSinceUpdate / 86400),
        pendingDecay: status.pendingDecay.toString(),
        projectedScore: Math.max(
            status.currentScore - status.pendingDecay,
            10
        ).toString(),
        isVerified: profile.isVerified
    };
}
```

### Batch Monitor All Users

```javascript
async function monitorAllTrustScores() {
    const totalUsers = await contract.getTotalUsers();
    const allUsers = await contract.allUsers; // Access public array
    
    const reports = [];
    
    for (let i = 0; i < Math.min(totalUsers, 100); i++) {
        const userAddr = allUsers[i];
        const report = await getTrustScoreReport(userAddr);
        
        if (report.pendingDecay > 5) {
            reports.push({
                address: userAddr,
                ...report,
                alert: 'High pending decay'
            });
        }
    }
    
    console.table(reports);
    return reports;
}
```

---

## 🎯 Automated Decay Service

### Background Service Example

```javascript
const DECAY_CHECK_INTERVAL = 3600000; // 1 hour

async function trustScoreDecayService() {
    console.log('Starting Trust Score Decay Service...');
    
    setInterval(async () => {
        try {
            // Get all users who need decay
            const users = await getUsersNeedingDecay();
            
            if (users.length > 0) {
                console.log(`Applying decay to ${users.length} users...`);
                
                // Batch process in chunks of 50
                for (let i = 0; i < users.length; i += 50) {
                    const batch = users.slice(i, i + 50);
                    await contract.batchApplyTrustScoreDecay(batch);
                    console.log(`Processed batch ${Math.floor(i/50) + 1}`);
                }
            }
        } catch (error) {
            console.error('Decay service error:', error);
        }
    }, DECAY_CHECK_INTERVAL);
}

async function getUsersNeedingDecay() {
    const users = [];
    const totalUsers = await contract.getTotalUsers();
    const allUsers = await contract.allUsers;
    
    for (let i = 0; i < totalUsers; i++) {
        const status = await contract.getTrustScoreDecayStatus(allUsers[i]);
        
        // If more than 1 period elapsed
        if (status.periodsElapsed > 0) {
            users.push(allUsers[i]);
        }
    }
    
    return users;
}
```

---

## 📡 Event Monitoring

### Listen to Trust Score Events

```javascript
// Trust Score Decayed
contract.on("TrustScoreDecayed", (user, oldScore, newScore, decayAmount) => {
    console.log(`🔻 Trust Score Decayed:`);
    console.log(`  User: ${user}`);
    console.log(`  ${oldScore} → ${newScore} (-${decayAmount})`);
});

// Trust Score Reduced (Penalty)
contract.on("TrustScoreReduced", (user, oldScore, newScore, amount, reason) => {
    console.log(`⚠️ Trust Score Reduced:`);
    console.log(`  User: ${user}`);
    console.log(`  ${oldScore} → ${newScore} (-${amount})`);
    console.log(`  Reason: ${reason}`);
});

// Trust Score Increased (Reward)
contract.on("TrustScoreIncreased", (user, oldScore, newScore, reason) => {
    console.log(`✅ Trust Score Increased:`);
    console.log(`  User: ${user}`);
    console.log(`  ${oldScore} → ${newScore}`);
    console.log(`  Reason: ${reason}`);
});

// Decay Config Updated
contract.on("TrustScoreDecayConfigUpdated", (rate, period, enabled) => {
    console.log(`⚙️ Decay Config Updated:`);
    console.log(`  Rate: ${rate} points per period`);
    console.log(`  Period: ${period} seconds`);
    console.log(`  Enabled: ${enabled}`);
});
```

---

## 🎓 Best Practices

### For System Administrators

1. **Regular Decay Application**
   - Run automated decay service
   - Apply decay before critical operations
   - Monitor pending decay amounts

2. **Fair Penalty System**
   - Document reduction reasons clearly
   - Use consistent penalty amounts
   - Review penalty history periodically

3. **Reward Active Users**
   - Increase scores for verified assistance
   - Recognize outstanding contributions
   - Balance penalties with rewards

4. **Configuration Management**
   - Start with default settings
   - Adjust based on community behavior
   - Document all config changes

### For Developers

1. **Always Apply Decay Before Using Trust Scores**
   ```javascript
   // Good: Decay applied automatically in approveEscalatedResolution
   await contract.approveEscalatedResolution(incidentId);
   ```

2. **Check Decay Status Before Displaying**
   ```javascript
   const status = await contract.getTrustScoreDecayStatus(user);
   const effectiveScore = status.currentScore - status.pendingDecay;
   ```

3. **Batch Operations for Efficiency**
   ```javascript
   // Better than individual calls
   await contract.batchApplyTrustScoreDecay([user1, user2, user3]);
   ```

---

## ⚠️ Important Notes

### Decay Behavior

1. **Automatic Application:**
   - Decay applied automatically in `approveEscalatedResolution()`
   - Decay applied before `verifyUser()`
   - Decay applied in `reduceTrustScore()` and `increaseTrustScore()`

2. **Floor Protection:**
   - Trust score never drops below `MIN_TRUST_SCORE (10)`
   - Ensures users always have minimum access

3. **Ceiling Protection:**
   - Trust score never exceeds `MAX_TRUST_SCORE (100)`
   - Prevents score inflation

### Gas Considerations

```javascript
// Gas costs (estimates)
applyTrustScoreDecay()         → ~50,000 gas
batchApplyTrustScoreDecay(10)  → ~400,000 gas
reduceTrustScore()             → ~60,000 gas
increaseTrustScore()           → ~60,000 gas
```

---

## 🔐 Security Considerations

### Protection Against Abuse

1. **Emergency Desk Only:**
   - Only emergency desk can modify trust scores
   - Owner oversight required

2. **Event Transparency:**
   - All changes logged with reasons
   - Immutable audit trail

3. **Floor & Ceiling:**
   - Cannot reduce below 10
   - Cannot increase above 100

4. **Decay Is Optional:**
   - Can be disabled if needed
   - Configurable per deployment

---

## 📚 Integration Example

### Complete Trust Score Management

```javascript
class TrustScoreManager {
    constructor(contract) {
        this.contract = contract;
    }
    
    async monitorUser(userAddress) {
        const status = await this.contract.getTrustScoreDecayStatus(userAddress);
        
        if (status.pendingDecay > 5) {
            await this.contract.applyTrustScoreDecay(userAddress);
            console.log(`Applied decay to ${userAddress}`);
        }
    }
    
    async penalizeUser(userAddress, amount, reason) {
        await this.contract.reduceTrustScore(userAddress, amount, reason);
        console.log(`Reduced ${userAddress} score by ${amount}: ${reason}`);
    }
    
    async rewardUser(userAddress, amount, reason) {
        await this.contract.increaseTrustScore(userAddress, amount, reason);
        console.log(`Increased ${userAddress} score by ${amount}: ${reason}`);
    }
    
    async getDashboard() {
        // Implementation from monitoring section
    }
}

// Usage
const manager = new TrustScoreManager(contract);
await manager.monitorUser(userAddress);
await manager.penalizeUser(badActor, 15, "False report");
await manager.rewardUser(goodActor, 10, "Excellent response");
```

---

**Version:** 2.1  
**Last Updated:** December 29, 2025  
**See Also:** [THREAT_MODEL.md](./THREAT_MODEL.md), [ESCALATION_GUIDE.md](./ESCALATION_GUIDE.md)
