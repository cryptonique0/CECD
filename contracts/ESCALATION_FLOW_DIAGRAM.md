# Incident Escalation Flow Diagram

## 📊 Complete Escalation Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    INCIDENT CREATION                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │  Check Severity      │
                   │  Is Critical?        │
                   └──────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
            YES │                           │ NO
                ▼                           ▼
    ┌───────────────────────┐   ┌──────────────────────┐
    │  AUTO-ESCALATE        │   │  Status: Reported     │
    │  Immediately          │   │  Wait for            │
    │  Status: Escalated    │   │  Acknowledgment      │
    └───────────┬───────────┘   └──────────┬───────────┘
                │                           │
                │                           │ Time passes...
                │                           ▼
                │               ┌──────────────────────┐
                │               │  Check Time Window   │
                │               │  Exceeded?           │
                │               └──────────────────────┘
                │                           │
                │               ┌───────────┴───────────┐
                │               │                       │
                │           YES │                       │ NO
                │               ▼                       ▼
                │   ┌────────────────────┐   ┌─────────────────┐
                │   │ AUTO-ESCALATE      │   │ Continue Normal │
                │   │ Status: Escalated  │   │ Flow            │
                │   └────────┬───────────┘   └─────────────────┘
                │            │
                └────────────┴───────────────┐
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ESCALATION RESOLUTION                         │
│                    Status: Escalated                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Initialize Resolution
                              │ - totalWeight = 0
                              │ - requiredWeight = 150
                              │ - nonce = incident.nonce
                              ▼
                   ┌──────────────────────┐
                   │  Awaiting Approvals  │
                   │                      │
                   │  Emergency Desk OR   │
                   │  Community Leaders   │
                   └──────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
    │ Approver 1  │   │ Approver 2  │   │ Approver 3  │
    │ Trust: 85   │   │ Trust: 70   │   │ Trust: 60   │
    └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
           │                 │                 │
           │ Approve         │ Approve         │ (if needed)
           ▼                 ▼                 ▼
    ┌──────────────────────────────────────────────────┐
    │        APPROVAL TRACKING                         │
    │  - Check not already approved                    │
    │  - Record trust score snapshot                   │
    │  - Add weight to total                           │
    │  - Status → UnderReview                          │
    │  - Emit ResolutionApproved event                 │
    └──────────────────────────────────────────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │  Check Total Weight  │
                   │  >= Required?        │
                   └──────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
            YES │                           │ NO
                ▼                           ▼
    ┌───────────────────────┐   ┌──────────────────────┐
    │  AUTO-EXECUTE         │   │  Wait for More       │
    │  Resolution           │   │  Approvals           │
    └───────────┬───────────┘   └──────────────────────┘
                │
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RESOLUTION EXECUTION                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │  Execute Resolution  │
                   │  - executed = true   │
                   │  - status = Approved │
                   │  - incident.status   │
                   │    = Resolved        │
                   └──────────────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │  Emit Events         │
                   │  - ResolutionExecuted│
                   │  - IncidentUpdated   │
                   └──────────────────────┘
                              │
                              ▼
                          ✅ COMPLETE
```

---

## 🔄 State Transitions

### Escalation Status Flow
```
None ────────────────────────────> Escalated
  │                                     │
  │                                     ▼
  │                              UnderReview
  │                                     │
  │                                     ▼
  └─────────────────────────────> Approved
```

### Incident Status Flow (With Escalation)
```
Reported ──────┬──────> Acknowledged ──> InProgress ──> Resolved ──> Closed
               │                                           ▲
               │ (Critical OR Timeout)                     │
               │                                           │
               └────> [ESCALATED] ────> [APPROVED] ───────┘
```

---

## 🎯 Decision Points

### 1. Escalation Trigger Decision
```
if (severity == Critical) {
    ✅ Auto-escalate immediately
} else if (time >= createdAt + escalationWindow && status == Reported) {
    ✅ Auto-escalate due to timeout
} else {
    ⏳ Continue normal flow
}
```

### 2. Approval Weight Decision
```
totalWeight = sum(approver_trust_scores)

if (totalWeight >= requiredWeight) {
    ✅ Execute resolution automatically
} else {
    ⏳ Wait for more approvals
}
```

### 3. Access Control Decision
```
function approveEscalatedResolution() {
    if (emergencyDesk[msg.sender] OR communityLeader[msg.sender]) {
        if (userProfile[msg.sender].isVerified) {
            if (!hasApproved[msg.sender]) {
                ✅ Allow approval
            } else {
                ❌ Reject: Already approved
            }
        } else {
            ❌ Reject: Not verified
        }
    } else {
        ❌ Reject: Insufficient role
    }
}
```

---

## 📊 Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION                           │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │   Smart Contract     │
                   │   Functions          │
                   └──────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │   Incident   │  │  Escalation  │  │   Approval   │
    │   Storage    │  │  Resolution  │  │   Tracking   │
    │              │  │  Storage     │  │              │
    │ - id         │  │ - weight     │  │ - approver   │
    │ - status     │  │ - approvers  │  │ - trustScore │
    │ - escalation │  │ - executed   │  │ - timestamp  │
    └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
           │                 │                 │
           └─────────────────┼─────────────────┘
                             │
                             ▼
                   ┌──────────────────────┐
                   │   Event Emission     │
                   │                      │
                   │ - IncidentEscalated  │
                   │ - ResolutionApproved │
                   │ - ResolutionExecuted │
                   └──────────────────────┘
                             │
                             ▼
                   ┌──────────────────────┐
                   │   Frontend/Monitor   │
                   │   Event Listeners    │
                   └──────────────────────┘
```

---

## 🔐 Security Checks Flow

```
Approval Request
      │
      ▼
┌──────────────────────┐
│ Check: Exists?       │──NO──> ❌ Revert: "Incident does not exist"
└──────────────────────┘
      │ YES
      ▼
┌──────────────────────┐
│ Check: Escalated?    │──NO──> ❌ Revert: "Incident not escalated"
└──────────────────────┘
      │ YES
      ▼
┌──────────────────────┐
│ Check: Authorized?   │──NO──> ❌ Revert: "Only emergency desk..."
└──────────────────────┘
      │ YES
      ▼
┌──────────────────────┐
│ Check: Verified?     │──NO──> ❌ Revert: "Approver must be verified"
└──────────────────────┘
      │ YES
      ▼
┌──────────────────────┐
│ Check: Already       │─YES──> ❌ Revert: "Already approved..."
│ Approved?            │
└──────────────────────┘
      │ NO
      ▼
┌──────────────────────┐
│ Check: Nonce Match?  │──NO──> ❌ Revert: "Resolution nonce mismatch"
└──────────────────────┘
      │ YES
      ▼
┌──────────────────────┐
│ Check: Executed?     │─YES──> ❌ Revert: "Resolution already executed"
└──────────────────────┘
      │ NO
      ▼
✅ APPROVE & RECORD
```

---

## 💡 Example Scenarios

### Scenario 1: Immediate Critical Response
```
Time 0:00 → User reports cardiac arrest (Critical)
         → ✅ Auto-escalates immediately
         → Status: Escalated

Time 0:02 → Emergency Desk approves (Trust: 85)
         → Total Weight: 85/150
         → Status: UnderReview

Time 0:05 → Community Leader approves (Trust: 70)
         → Total Weight: 155/150 ✅
         → ✅ Auto-executes
         → Status: Approved, Incident: Resolved
```

### Scenario 2: Timeout Escalation
```
Time 0:00 → User reports fire (High severity)
         → Status: Reported

Time 1:00 → No acknowledgment (timeout = 1 hour)
         → Monitor calls checkAndAutoEscalate()
         → ✅ Auto-escalates
         → Status: Escalated

Time 1:05 → Multiple approvals received
         → Weight threshold met
         → ✅ Resolved
```

### Scenario 3: Manual Escalation
```
Time 0:00 → User reports flooding (Medium severity)
         → Status: Reported

Time 0:30 → Emergency Desk assesses situation
         → Calls escalateIncident() manually
         → Reason: "Rapidly worsening conditions"
         → ✅ Escalated
         → Status: Escalated

Time 0:35 → Multi-signature approval process
         → Resolution achieved through consensus
```

---

## 📈 Metrics to Monitor

### Escalation Metrics
```
┌─────────────────────────────────┐
│ Total Escalations               │ 47
│ - Auto (Critical)               │ 23 (49%)
│ - Auto (Timeout)                │ 15 (32%)
│ - Manual                        │ 9  (19%)
├─────────────────────────────────┤
│ Resolution Time                 │
│ - Average                       │ 12 minutes
│ - Median                        │ 8 minutes
│ - 95th Percentile               │ 30 minutes
├─────────────────────────────────┤
│ Approval Patterns               │
│ - Average Approvers             │ 2.3
│ - Average Weight                │ 167
│ - Success Rate                  │ 98%
└─────────────────────────────────┘
```

---

**Version:** 2.0  
**Last Updated:** December 29, 2025  
**Status:** ✅ Complete
