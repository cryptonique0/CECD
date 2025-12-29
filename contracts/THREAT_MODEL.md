# CECD Smart Contract Threat Model

**Version:** 2.0  
**Date:** December 29, 2025  
**Status:** Active Security Analysis  

---

## 🎯 Threat Model Overview

This document identifies potential attack vectors, threat scenarios, and implemented mitigations for the Community Emergency Coordination Dashboard (CECD) smart contract system, including the escalation and multi-signature resolution mechanism.

---

## 🔴 High-Severity Threats

### T1: Escalation Approval Manipulation

**Attack Vector:** Malicious actor attempts to manipulate the multi-signature approval process.

#### T1.1: Duplicate Approval Attack
**Description:** Attacker tries to approve the same incident multiple times to artificially inflate approval weight.

**Impact:** Critical - Could bypass required approval threshold with single compromised account.

**Mitigation Implemented:**
```solidity
// Duplicate prevention check
require(!resolution.hasApproved[msg.sender], "Already approved by this address");
```

**Status:** ✅ Mitigated  
**Test Coverage:** Yes (testDuplicateApprovalPrevention)

---

#### T1.2: Replay Attack on Approvals
**Description:** Attacker captures and replays old approval transactions after incident is re-escalated.

**Impact:** High - Could reuse stale approvals for new escalation rounds.

**Mitigation Implemented:**
```solidity
// Nonce-based replay protection
uint256 resolutionNonce;  // Increments on each escalation
require(resolution.nonce == incident.resolutionNonce, 
    "Resolution nonce mismatch - potential replay");
```

**Status:** ✅ Mitigated  
**Test Coverage:** Yes (testReplayProtection)

---

#### T1.3: Trust Score Manipulation During Approval
**Description:** Attacker increases their trust score after approval but before execution to gain more weight.

**Impact:** High - Retroactive weight increase could bypass threshold.

**Mitigation Implemented:**
```solidity
// Trust score snapshot at approval time
resolution.approvals[msg.sender] = EscalationApproval({
    approver: msg.sender,
    trustScoreAtApproval: trustScore,  // Immutable snapshot
    approvedAt: block.timestamp,
    approved: true
});
```

**Status:** ✅ Mitigated  
**Test Coverage:** Yes

---

### T2: Access Control Bypass

#### T2.1: Unauthorized Escalation
**Description:** Regular users attempt to escalate non-critical incidents to spam the system.

**Impact:** High - System flooding, legitimate escalations buried.

**Mitigation Implemented:**
```solidity
modifier onlyEmergencyDesk() {
    require(emergencyDesks[msg.sender] || msg.sender == owner, 
        "Only emergency desk can call this function");
    _;
}

function escalateIncident(uint256 _incidentId, string memory _reason) 
    public 
    onlyEmergencyDesk
```

**Status:** ✅ Mitigated  
**Test Coverage:** Yes (testEscalationAccessControl)

---

#### T2.2: Unauthorized Approval
**Description:** Unverified or lower-privileged users attempt to approve escalated resolutions.

**Impact:** Critical - Could compromise multi-signature security model.

**Mitigation Implemented:**
```solidity
modifier canApproveResolution() {
    require(
        emergencyDesks[msg.sender] || communityLeaders[msg.sender] || msg.sender == owner,
        "Only emergency desk or community leaders can approve"
    );
    require(userProfiles[msg.sender].isVerified, "Approver must be verified");
    _;
}
```

**Status:** ✅ Mitigated  
**Test Coverage:** Yes (testApprovalAccessControl)

---

### T3: Time-Based Manipulation

#### T3.1: Timestamp Manipulation
**Description:** Miners manipulate block.timestamp to trigger or prevent auto-escalation.

**Impact:** Medium-High - Could delay critical escalations or trigger false escalations.

**Mitigation Implemented:**
```solidity
// Use 1-hour time window (miners can manipulate ~900 seconds max)
uint256 public escalationTimeWindow = 3600;  // Much larger than manipulation window
```

**Additional Safeguards:**
- Time window configurable for adjustment
- Critical incidents escalate immediately (no time dependency)
- Manual escalation available as backup

**Status:** ⚠️ Partially Mitigated  
**Risk Level:** Low (1 hour >> 15 minutes manipulation window)

---

#### T3.2: Front-Running Auto-Escalation
**Description:** Attacker observes pending auto-escalation and front-runs to acknowledge incident, preventing escalation.

**Impact:** Medium - Could prevent legitimate escalations.

**Mitigation Implemented:**
```solidity
// Critical incidents auto-escalate regardless of acknowledgment
if (_severity == IncidentSeverity.Critical) {
    _escalateIncident(incidentCounter, "Critical severity - auto-escalated");
}
```

**Status:** ⚠️ Partially Mitigated  
**Additional Recommendation:** Consider implementing acknowledgment timeouts even after acknowledgment for Critical incidents.

---

## 🟡 Medium-Severity Threats

### T4: Trust Score Gaming

#### T4.1: Sybil Attack on Trust Scores
**Description:** Attacker creates multiple accounts to farm trust scores and gain approval weight.

**Impact:** Medium - Could accumulate enough accounts to reach approval threshold.

**Mitigation Implemented:**
```solidity
// New users start with moderate trust score
trustScore: 50

// Verification required for meaningful privileges
require(userProfiles[msg.sender].isVerified, "Approver must be verified");

// Only emergency desk can verify users
function verifyUser(address _user) public onlyEmergencyDesk
```

**Status:** ⚠️ Partially Mitigated  
**Gaps:** 
- No verification cost (gas only)
- No cooldown between verifications
- No cap on verified accounts per admin

**Recommendation:** Implement verification rate limiting and account aging requirements.

---

#### T4.2: Trust Score Inflation
**Description:** Malicious emergency desk members artificially inflate trust scores of colluding accounts.

**Impact:** Medium-High - Could create powerful approver accounts.

**Current State:** 🔴 Not Fully Mitigated

**Implemented Controls:**
```solidity
// Only emergency desk can modify trust scores
function verifyUser(address _user) public onlyEmergencyDesk {
    userProfiles[_user].trustScore = 75;  // Fixed increment
}
```

**Gaps:**
- No trust score maximum
- No audit trail for trust score changes
- No trust score decay mechanism

**Status:** 🔴 Requires Implementation  
**See:** Trust Score Decay section below

---

### T5: Incident Spam and DoS

#### T5.1: Escalation Spam
**Description:** Attacker with emergency desk access mass-escalates incidents to overwhelm responders.

**Impact:** Medium - Legitimate escalations lost in noise.

**Mitigation Implemented:**
```solidity
// Only verified users can create incidents
modifier onlyVerifiedUser() {
    require(userProfiles[msg.sender].exists && userProfiles[msg.sender].isVerified, 
        "User must be verified");
    _;
}
```

**Status:** ⚠️ Partially Mitigated  
**Gaps:**
- No rate limiting on incident creation
- No escalation frequency monitoring
- No automatic suspension for abuse

**Recommendation:** Implement rate limiting and abuse detection.

---

#### T5.2: Approval DoS
**Description:** Attacker spams approval transactions to increase gas costs or clog the system.

**Impact:** Low-Medium - Increased operational costs.

**Mitigation:**
- Each address can only approve once (duplicate prevention)
- Approval requires verified status
- Gas costs naturally rate-limit attacks

**Status:** ✅ Acceptable Risk

---

### T6: Economic Attacks

#### T6.1: Gas Price Manipulation
**Description:** Attacker floods network with high gas price transactions to prevent timely escalations.

**Impact:** Medium - Could delay critical approvals.

**Mitigation:**
- No time-critical operations requiring immediate execution
- Auto-execution occurs naturally when conditions met
- Manual execution available as backup

**Status:** ✅ Acceptable Risk

---

#### T6.2: Approval Weight Threshold Gaming
**Description:** Colluding approvers wait to approve together to minimize oversight window.

**Impact:** Low-Medium - Could resolve escalations too quickly.

**Mitigation:**
```solidity
// All approvals emit events with timestamps
emit ResolutionApproved(
    _incidentId,
    msg.sender,
    trustScore,
    resolution.totalApprovalWeight,
    resolution.requiredWeight
);
```

**Additional Controls:**
- Full transparency via events
- Immutable approval record
- Public approval list

**Status:** ✅ Mitigated

---

## 🟢 Low-Severity Threats

### T7: Information Disclosure

#### T7.1: Sensitive Data Exposure
**Description:** Personal information (email, location) stored on-chain is publicly visible.

**Impact:** Low - Privacy concerns but expected for blockchain.

**Mitigation:**
- No passwords or truly sensitive data stored
- Users informed of public nature
- Coordinates stored as integers (precision loss)

**Status:** ✅ Acceptable by Design

---

### T8: Griefing Attacks

#### T8.1: Malicious Incident Reporting
**Description:** Users report false incidents to waste responder resources.

**Impact:** Low-Medium - Resource waste but traceable to reporter.

**Mitigation:**
```solidity
// All incidents tied to reporter address
address reportedBy;

// Trust score system discourages bad behavior
// Emergency desk can decrease trust scores
```

**Status:** ⚠️ Partially Mitigated  
**Gap:** No automated trust score reduction for false reports

---

## 🔵 Implemented Security Controls

### Access Control Matrix

| Function | Public | Verified | Leader | Desk | Owner |
|----------|--------|----------|--------|------|-------|
| createIncident | ❌ | ✅ | ✅ | ✅ | ✅ |
| escalateIncident | ❌ | ❌ | ❌ | ✅ | ✅ |
| approveEscalatedResolution | ❌ | ❌ | ✅ | ✅ | ✅ |
| executeEscalatedResolution | ❌ | ❌ | ❌ | ✅ | ✅ |
| updateEscalationConfig | ❌ | ❌ | ❌ | ❌ | ✅ |
| verifyUser | ❌ | ❌ | ❌ | ✅ | ✅ |

---

### Defense in Depth

```
Layer 1: Network Level
├─ EVM gas costs prevent spam
└─ Block gas limit prevents DoS

Layer 2: Contract Level
├─ Role-based access control
├─ Verified user requirements
└─ Nonce-based replay protection

Layer 3: Logic Level
├─ Duplicate prevention
├─ Trust score weighting
├─ State validation
└─ Input validation

Layer 4: Transparency
├─ Event emission
├─ Public audit trails
└─ Immutable history
```

---

## 🛡️ Mitigation Recommendations

### Priority 1: Critical (Implement Immediately)

#### R1: Trust Score Decay System
**Threat Addressed:** T4.2 (Trust Score Inflation)

**Implementation:**
```solidity
// Add to contract
mapping(address => uint256) public lastTrustScoreUpdate;
uint256 public trustScoreDecayRate = 1; // Points per day
uint256 public trustScoreMinimum = 10;

function decayTrustScore(address _user) internal {
    uint256 timeSinceUpdate = block.timestamp - lastTrustScoreUpdate[_user];
    uint256 decayAmount = (timeSinceUpdate / 1 days) * trustScoreDecayRate;
    
    if (userProfiles[_user].trustScore > trustScoreMinimum) {
        uint256 newScore = userProfiles[_user].trustScore - decayAmount;
        userProfiles[_user].trustScore = newScore > trustScoreMinimum 
            ? newScore 
            : trustScoreMinimum;
    }
    
    lastTrustScoreUpdate[_user] = block.timestamp;
}
```

**Status:** 🔴 To Be Implemented

---

#### R2: Trust Score Reduction for Bad Behavior
**Threat Addressed:** T8.1 (Malicious Reporting)

**Implementation:**
```solidity
function reduceTrustScore(address _user, uint256 _amount, string memory _reason) 
    public 
    onlyEmergencyDesk 
{
    require(userProfiles[_user].exists, "User does not exist");
    
    if (userProfiles[_user].trustScore > trustScoreMinimum) {
        userProfiles[_user].trustScore -= _amount;
        if (userProfiles[_user].trustScore < trustScoreMinimum) {
            userProfiles[_user].trustScore = trustScoreMinimum;
        }
    }
    
    emit TrustScoreReduced(_user, _amount, _reason);
}
```

**Status:** 🔴 To Be Implemented

---

### Priority 2: High (Implement Soon)

#### R3: Escalation Rate Limiting
**Threat Addressed:** T5.1 (Escalation Spam)

**Implementation:**
```solidity
mapping(address => uint256) public lastEscalationTime;
uint256 public escalationCooldown = 300; // 5 minutes

modifier escalationRateLimit() {
    require(
        block.timestamp >= lastEscalationTime[msg.sender] + escalationCooldown,
        "Escalation cooldown active"
    );
    _;
}
```

---

#### R4: Maximum Trust Score Cap
**Threat Addressed:** T4.2 (Trust Score Inflation)

**Implementation:**
```solidity
uint256 public constant MAX_TRUST_SCORE = 100;

function increaseTrustScore(address _user, uint256 _amount) internal {
    uint256 newScore = userProfiles[_user].trustScore + _amount;
    userProfiles[_user].trustScore = newScore > MAX_TRUST_SCORE 
        ? MAX_TRUST_SCORE 
        : newScore;
}
```

---

### Priority 3: Medium (Consider)

#### R5: Incident Creation Rate Limiting
**Threat Addressed:** T5.1 (Incident Spam)

#### R6: Verification Cost/Cooldown
**Threat Addressed:** T4.1 (Sybil Attack)

#### R7: Approval Weight History
**Threat Addressed:** T6.2 (Threshold Gaming)

#### R8: Escalation Pattern Monitoring
**Threat Addressed:** T5.1 (Escalation Spam)

---

## 📊 Risk Assessment Matrix

| Threat ID | Severity | Likelihood | Risk Score | Status |
|-----------|----------|------------|------------|--------|
| T1.1 | Critical | Low | Medium | ✅ Mitigated |
| T1.2 | High | Medium | High | ✅ Mitigated |
| T1.3 | High | Low | Medium | ✅ Mitigated |
| T2.1 | High | Low | Medium | ✅ Mitigated |
| T2.2 | Critical | Low | Medium | ✅ Mitigated |
| T3.1 | Medium | Low | Low | ⚠️ Partial |
| T3.2 | Medium | Medium | Medium | ⚠️ Partial |
| T4.1 | Medium | Medium | Medium | ⚠️ Partial |
| T4.2 | High | High | High | 🔴 Open |
| T5.1 | Medium | Medium | Medium | ⚠️ Partial |
| T5.2 | Low | Low | Low | ✅ Acceptable |
| T6.1 | Medium | Low | Low | ✅ Acceptable |
| T6.2 | Low | Low | Low | ✅ Mitigated |
| T7.1 | Low | High | Low | ✅ By Design |
| T8.1 | Medium | Medium | Medium | 🔴 Open |

**Risk Levels:**
- 🔴 **Open:** Requires immediate attention
- ⚠️ **Partial:** Partially mitigated, monitoring required
- ✅ **Mitigated:** Adequately controlled
- ✅ **Acceptable:** Risk accepted by design

---

## 🔍 Security Testing Checklist

### Access Control Tests
- [x] Test unauthorized escalation attempts
- [x] Test unauthorized approval attempts
- [x] Test role-based function restrictions
- [x] Test modifier enforcement
- [x] Test owner-only functions

### Data Integrity Tests
- [x] Test nonce increment on escalation
- [x] Test trust score snapshot immutability
- [x] Test duplicate approval prevention
- [x] Test state transition validation
- [x] Test input validation

### Economic Tests
- [ ] Test gas costs under load
- [ ] Test approval weight calculations
- [ ] Test threshold boundary conditions
- [ ] Test trust score decay (when implemented)
- [ ] Test rate limiting (when implemented)

### Integration Tests
- [x] Test complete escalation flow
- [x] Test multi-signature approval process
- [x] Test auto-execution
- [x] Test event emissions
- [x] Test query functions

---

## 📋 Security Audit Recommendations

### Before Production Deployment

1. **External Security Audit**
   - Engage reputable auditing firm
   - Focus on escalation and approval logic
   - Test economic attack vectors

2. **Formal Verification**
   - Verify approval weight calculations
   - Verify nonce-based replay protection
   - Verify access control logic

3. **Bug Bounty Program**
   - Offer rewards for vulnerability discovery
   - Focus on high-severity threats
   - Include economic attack scenarios

4. **Testnet Deployment**
   - Deploy to public testnet
   - Simulate attack scenarios
   - Monitor for unexpected behavior

---

## 🔄 Incident Response Plan

### Vulnerability Discovery Response

1. **Assessment** (0-1 hour)
   - Evaluate severity and impact
   - Determine exploit likelihood
   - Assess affected users

2. **Containment** (1-4 hours)
   - Pause affected functions if possible
   - Communicate with users
   - Prepare mitigation

3. **Mitigation** (4-24 hours)
   - Deploy fixes or workarounds
   - Update documentation
   - Notify ecosystem

4. **Recovery** (24-48 hours)
   - Resume normal operations
   - Monitor for issues
   - Conduct post-mortem

---

## 📞 Security Contacts

### Reporting Vulnerabilities

**Email:** security@cecd-project.org  
**PGP Key:** [To be added]  
**Response Time:** < 24 hours

### Disclosure Policy

- **Coordinated Disclosure:** 90 days
- **Severity-Based:** Critical issues prioritized
- **Bounty Program:** Active for verified issues

---

## 📚 References

### Security Standards
- [ConsenSys Smart Contract Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [OpenZeppelin Security Patterns](https://docs.openzeppelin.com/contracts/)
- [OWASP Smart Contract Top 10](https://owasp.org/www-project-smart-contract-top-10/)

### Related Documentation
- [ESCALATION_GUIDE.md](./ESCALATION_GUIDE.md)
- [ESCALATION_IMPLEMENTATION.md](./ESCALATION_IMPLEMENTATION.md)
- [EmergencyCoordination.sol](./EmergencyCoordination.sol)

---

**Last Updated:** December 29, 2025  
**Next Review:** January 29, 2026  
**Maintained By:** CECD Security Team
