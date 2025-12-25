# Contract Functions Quick Reference

## Contract Address
`0x05228Bba13D6B2BeDF97a7aaA729a962Bd8971BF`

## All Functions Summary

### 1. User Profile Functions (5 functions)

| Function | Type | Parameters | Returns | Access |
|----------|------|-----------|---------|--------|
| `createUserProfile` | Write | name, email, role | - | Public |
| `updateUserProfile` | Write | name, email | - | Public |
| `verifyUser` | Write | address | - | EmergencyDesk |
| `getMyProfile` | Read | - | UserProfile | Public |
| `getUserProfile` | Read | address | UserProfile | Public |

### 2. Incident Management (6 functions)

| Function | Type | Parameters | Returns | Access |
|----------|------|-----------|---------|--------|
| `createIncident` | Write | title, description, category, severity, lat, lng | uint256 | VerifiedUsers |
| `updateIncidentStatus` | Write | incidentId, status | - | EmergencyDesk |
| `assignVolunteerToIncident` | Write | incidentId, volunteer | - | EmergencyDesk |
| `getIncident` | Read | incidentId | Incident | Public |
| `getAllIncidents` | Read | - | uint256[] | Public |
| `getIncidentsByStatus` | Read | status | uint256[] | Public |

### 3. Volunteer Management (6 functions)

| Function | Type | Parameters | Returns | Access |
|----------|------|-----------|---------|--------|
| `registerVolunteer` | Write | name, email, skills, lat, lng | - | Public |
| `updateVolunteerStatus` | Write | status | - | VolunteerOnly |
| `verifyVolunteer` | Write | address | - | EmergencyDesk |
| `getVolunteer` | Read | address | Volunteer | Public |
| `getAllVolunteers` | Read | - | address[] | Public |
| `getAvailableVolunteers` | Read | - | address[] | Public |

### 4. Announcement Management (3 functions)

| Function | Type | Parameters | Returns | Access |
|----------|------|-----------|---------|--------|
| `createAnnouncement` | Write | title, message, priority | - | CommunityLeader |
| `getAnnouncement` | Read | announcementId | Announcement | Public |
| `getAllAnnouncements` | Read | - | uint256[] | Public |

### 5. Role Management (4 functions)

| Function | Type | Parameters | Returns | Access |
|----------|------|-----------|---------|--------|
| `addEmergencyDesk` | Write | address | - | Owner |
| `addCommunityLeader` | Write | address | - | Owner |
| `removeEmergencyDesk` | Write | address | - | Owner |
| `removeCommunityLeader` | Write | address | - | Owner |

### 6. Analytics Functions (3 functions)

| Function | Type | Parameters | Returns | Access |
|----------|------|-----------|---------|--------|
| `getIncidentStats` | Read | - | stats tuple | Public |
| `getVolunteerStats` | Read | - | stats tuple | Public |
| `getTotalUsers` | Read | - | uint256 | Public |

---

## Total Functions: 28

### By Type
- **Write Functions:** 18
- **Read Functions:** 10

### By Access Level
- **Public:** 17
- **Owner Only:** 4
- **Emergency Desk Only:** 4
- **Community Leader Only:** 1
- **Verified Users Only:** 1
- **Volunteer Only:** 1

---

## Enums & Data Types

### AppRole (4 values)
```
0 = Citizen
1 = Volunteer
2 = CommunityLeader
3 = EmergencyDesk
```

### IncidentCategory (6 values)
```
0 = Medical
1 = Fire
2 = Flood
3 = Storm
4 = Earthquake
5 = Other
```

### IncidentSeverity (4 values)
```
0 = Low
1 = Medium
2 = High
3 = Critical
```

### IncidentStatus (5 values)
```
0 = Reported
1 = Acknowledged
2 = InProgress
3 = Resolved
4 = Closed
```

### VolunteerStatus (3 values)
```
0 = Available
1 = Unavailable
2 = Busy
```

---

## Events (10 total)

```solidity
event UserProfileCreated(address indexed user, string name, AppRole role)
event UserProfileUpdated(address indexed user, string name)
event IncidentCreated(uint256 indexed incidentId, address indexed reporter, IncidentCategory category, IncidentSeverity severity)
event IncidentUpdated(uint256 indexed incidentId, IncidentStatus status)
event VolunteerAssigned(uint256 indexed incidentId, address indexed volunteer)
event AnnouncementCreated(uint256 indexed announcementId, address indexed author, uint256 priority)
event VolunteerRegistered(address indexed volunteer, string name)
event VolunteerStatusUpdated(address indexed volunteer, VolunteerStatus status)
event EmergencyDeskAdded(address indexed desk)
event CommunityLeaderAdded(address indexed leader)
```

---

## Common Use Cases

### Create User & Incident
```javascript
// 1. Create profile
await contract.createUserProfile("Alice", "alice@example.com", 0);

// 2. Wait for verification
await contract.verifyUser(aliceAddress); // Owner/EmergencyDesk

// 3. Create incident
await contract.createIncident(
    "Emergency",
    "Description",
    0,  // Medical
    2,  // High
    40758000,
    -73968000
);
```

### Register & Assign Volunteer
```javascript
// 1. Register
await contract.registerVolunteer(
    "Bob",
    "bob@example.com",
    ["First Aid", "CPR"],
    40758000,
    -73968000
);

// 2. Verify (Owner)
await contract.verifyVolunteer(bobAddress);

// 3. Assign (Emergency Desk)
await contract.assignVolunteerToIncident(incidentId, bobAddress);

// 4. Update status
await contract.updateVolunteerStatus(2); // Busy
```

### Get Statistics
```javascript
// Incident stats
const {total, reported, inProgress, resolved, closed} = 
    await contract.getIncidentStats();

// Volunteer stats
const {total, available, busy, verified} = 
    await contract.getVolunteerStats();

// Total users
const users = await contract.getTotalUsers();
```

---

## Gas Estimates

| Operation | Min Gas | Avg Gas | Max Gas |
|-----------|---------|---------|---------|
| Create User | 50K | 80K | 100K |
| Register Volunteer | 80K | 120K | 150K |
| Create Incident | 100K | 150K | 200K |
| Assign Volunteer | 60K | 80K | 100K |
| Get Incidents | 5K | 10K | 50K |
| Get Stats | 10K | 20K | 50K |

---

## Modifiers Used

```solidity
modifier onlyOwner() - Only contract owner
modifier onlyEmergencyDesk() - Owner or emergency desk role
modifier onlyCommunityLeader() - Owner or community leader role
modifier onlyVerifiedUser() - Must have verified profile
modifier incidentExists(uint256 id) - Incident must exist
```

---

## State Variables (8 total)

```solidity
address public owner;
uint256 public incidentCounter;
uint256 public announcementCounter;
mapping(address => UserProfile) public userProfiles;
mapping(uint256 => Incident) public incidents;
mapping(uint256 => Announcement) public announcements;
mapping(address => Volunteer) public volunteers;
mapping(address => bool) public emergencyDesks;
mapping(address => bool) public communityLeaders;
```

---

## Structs (4 total)

### UserProfile
```solidity
struct UserProfile {
    string name;
    string email;
    AppRole appRole;
    bool isVerified;
    uint256 trustScore;
    uint256 createdAt;
    bool exists;
}
```

### Incident
```solidity
struct Incident {
    uint256 id;
    string title;
    string description;
    IncidentCategory category;
    IncidentSeverity severity;
    IncidentStatus status;
    int256 latitude;
    int256 longitude;
    address reportedBy;
    uint256 createdAt;
    uint256 updatedAt;
    address[] assignedVolunteers;
    bool exists;
}
```

### Announcement
```solidity
struct Announcement {
    uint256 id;
    string title;
    string message;
    uint256 priority;
    address author;
    uint256 createdAt;
    bool exists;
}
```

### Volunteer
```solidity
struct Volunteer {
    string name;
    string email;
    string[] skills;
    VolunteerStatus availability;
    int256 latitude;
    int256 longitude;
    bool isVerified;
    uint256 rating;
    uint256 tasksCompleted;
    bool exists;
}
```

---

## Quick Tips

### Coordinates
- Latitude & Longitude are stored as int256 * 1e6
- Example: 40.7128, -74.0060 becomes 40758000, -74006000

### Priorities
- Announcement priority: 1 (Low), 2 (Medium), 3 (High)

### Timestamps
- All timestamps use block.timestamp (in seconds)
- Convert to JavaScript: multiply by 1000 for milliseconds

### Verification
- Users must be verified before creating incidents
- Volunteers must be verified before assignment

### Status Transitions
- Incident status: Reported → Acknowledged → InProgress → Resolved → Closed
- Cannot go backwards in status

---

## Common Queries

### Get my profile
```javascript
const myProfile = await contract.getMyProfile();
```

### Get all incidents
```javascript
const allIncidents = await contract.getAllIncidents();
```

### Get available volunteers
```javascript
const volunteers = await contract.getAvailableVolunteers();
```

### Get incident statistics
```javascript
const stats = await contract.getIncidentStats();
```

### Get specific incident
```javascript
const incident = await contract.getIncident(incidentId);
```

### Get volunteer details
```javascript
const volunteer = await contract.getVolunteer(volunteerAddress);
```

---

**Contract Address:** `0x05228Bba13D6B2BeDF97a7aaA729a962Bd8971BF`  
**Status:** ✅ Live & Operational  
**Last Updated:** December 25, 2025
