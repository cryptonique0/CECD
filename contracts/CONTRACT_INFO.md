# Emergency Coordination Smart Contract

## Deployment Information

**Contract Address:** `0x05228Bba13D6B2BeDF97a7aaA729a962Bd8971BF`  
**Deployed Date:** December 25, 2025  
**Compiler Version:** Solidity ^0.8.20  
**Network:** EVM Compatible Blockchain  

---

## Contract Overview

The EmergencyCoordination smart contract is a decentralized platform for managing community emergency responses. It provides comprehensive features for incident reporting, volunteer coordination, and community announcements.

## Key Features

### 👥 User Management
- Create and update user profiles
- Role-based access control (Citizen, Volunteer, Community Leader, Emergency Desk)
- User verification system
- Trust score tracking

### 🚨 Incident Management
- Report emergency incidents with location data
- Categorize incidents (Medical, Fire, Flood, Storm, Earthquake, Other)
- Severity levels (Low, Medium, High, Critical)
- Status tracking (Reported, Acknowledged, In Progress, Resolved, Closed)
- Assign volunteers to incidents

### 🤝 Volunteer System
- Volunteer registration with skills tracking
- Availability status management
- Location-based volunteer tracking
- Rating and verification system
- Task completion tracking

### 📢 Announcements
- Community leaders can create announcements
- Priority levels (Low, Medium, High)
- Timestamp tracking

### 📊 Analytics
- Real-time incident statistics
- Volunteer availability tracking
- User registration metrics

---

## Contract Functions

### User Profile Functions

#### `createUserProfile(string _name, string _email, AppRole _appRole)`
Create a new user profile.
- **Parameters:**
  - `_name`: User's full name
  - `_email`: User's email address
  - `_appRole`: Role (0=Citizen, 1=Volunteer, 2=CommunityLeader, 3=EmergencyDesk)

#### `updateUserProfile(string _name, string _email)`
Update existing user profile.

#### `verifyUser(address _user)` [Emergency Desk Only]
Verify a user and increase their trust score.

#### `getMyProfile()` → `UserProfile`
Get caller's profile information.

#### `getUserProfile(address _user)` → `UserProfile`
Get any user's profile information.

---

### Incident Management Functions

#### `createIncident(string _title, string _description, IncidentCategory _category, IncidentSeverity _severity, int256 _latitude, int256 _longitude)` [Verified Users Only]
Report a new emergency incident.
- **Returns:** Incident ID
- **Parameters:**
  - `_title`: Brief incident title
  - `_description`: Detailed description
  - `_category`: 0=Medical, 1=Fire, 2=Flood, 3=Storm, 4=Earthquake, 5=Other
  - `_severity`: 0=Low, 1=Medium, 2=High, 3=Critical
  - `_latitude`: Location latitude (multiplied by 1e6)
  - `_longitude`: Location longitude (multiplied by 1e6)

#### `updateIncidentStatus(uint256 _incidentId, IncidentStatus _status)` [Emergency Desk Only]
Update incident status.
- **Status:** 0=Reported, 1=Acknowledged, 2=InProgress, 3=Resolved, 4=Closed

#### `assignVolunteerToIncident(uint256 _incidentId, address _volunteer)` [Emergency Desk Only]
Assign a verified volunteer to an incident.

#### `getIncident(uint256 _incidentId)` → `Incident`
Get incident details by ID.

#### `getAllIncidents()` → `uint256[]`
Get all incident IDs.

#### `getIncidentsByStatus(IncidentStatus _status)` → `uint256[]`
Get incidents filtered by status.

---

### Volunteer Functions

#### `registerVolunteer(string _name, string _email, string[] _skills, int256 _latitude, int256 _longitude)`
Register as a volunteer.
- **Parameters:**
  - `_skills`: Array of skills (e.g., ["First Aid", "Search & Rescue"])
  - `_latitude`, `_longitude`: Current location

#### `updateVolunteerStatus(VolunteerStatus _status)`
Update availability status.
- **Status:** 0=Available, 1=Unavailable, 2=Busy

#### `verifyVolunteer(address _volunteer)` [Emergency Desk Only]
Verify a volunteer.

#### `getVolunteer(address _volunteer)` → `Volunteer`
Get volunteer details.

#### `getAllVolunteers()` → `address[]`
Get all registered volunteer addresses.

#### `getAvailableVolunteers()` → `address[]`
Get verified and available volunteers.

---

### Announcement Functions

#### `createAnnouncement(string _title, string _message, uint256 _priority)` [Community Leaders Only]
Create a community announcement.
- **Priority:** 1=Low, 2=Medium, 3=High

#### `getAnnouncement(uint256 _announcementId)` → `Announcement`
Get announcement details.

#### `getAllAnnouncements()` → `uint256[]`
Get all announcement IDs.

---

### Role Management Functions [Owner Only]

#### `addEmergencyDesk(address _desk)`
Grant emergency desk privileges.

#### `addCommunityLeader(address _leader)`
Grant community leader privileges.

#### `removeEmergencyDesk(address _desk)`
Revoke emergency desk privileges.

#### `removeCommunityLeader(address _leader)`
Revoke community leader privileges.

---

### Analytics Functions

#### `getIncidentStats()` → `(uint256 total, uint256 reported, uint256 inProgress, uint256 resolved, uint256 closed)`
Get comprehensive incident statistics.

#### `getVolunteerStats()` → `(uint256 total, uint256 available, uint256 busy, uint256 verified)`
Get volunteer availability statistics.

#### `getTotalUsers()` → `uint256`
Get total registered users.

---

## Events

The contract emits the following events for off-chain tracking:

- `UserProfileCreated(address indexed user, string name, AppRole role)`
- `UserProfileUpdated(address indexed user, string name)`
- `IncidentCreated(uint256 indexed incidentId, address indexed reporter, IncidentCategory category, IncidentSeverity severity)`
- `IncidentUpdated(uint256 indexed incidentId, IncidentStatus status)`
- `VolunteerAssigned(uint256 indexed incidentId, address indexed volunteer)`
- `AnnouncementCreated(uint256 indexed announcementId, address indexed author, uint256 priority)`
- `VolunteerRegistered(address indexed volunteer, string name)`
- `VolunteerStatusUpdated(address indexed volunteer, VolunteerStatus status)`
- `EmergencyDeskAdded(address indexed desk)`
- `CommunityLeaderAdded(address indexed leader)`

---

## Usage Example

### 1. Create User Profile
```javascript
await contract.createUserProfile("John Doe", "john@example.com", 0); // 0 = Citizen
```

### 2. Register as Volunteer
```javascript
await contract.registerVolunteer(
  "John Doe",
  "john@example.com",
  ["First Aid", "CPR", "Search & Rescue"],
  40758000,  // latitude * 1e6 (40.758)
  -73968000  // longitude * 1e6 (-73.968)
);
```

### 3. Report an Incident (After Verification)
```javascript
await contract.createIncident(
  "Medical Emergency",
  "Person collapsed at Main Street",
  0,  // Medical
  2,  // High severity
  40758000,
  -73968000
);
```

### 4. Check Statistics
```javascript
const stats = await contract.getIncidentStats();
console.log(`Total incidents: ${stats.total}`);
console.log(`Active incidents: ${stats.reported + stats.inProgress}`);
```

---

## Security Features

- ✅ Role-based access control
- ✅ User verification system
- ✅ Owner-only administrative functions
- ✅ Input validation
- ✅ Event logging for transparency
- ✅ Reentrancy protection (no external calls)

---

## Integration Guide

### Web3.js Integration
```javascript
const Web3 = require('web3');
const web3 = new Web3(window.ethereum);

const contractABI = [...]; // Import from compiled contract
const contractAddress = "0x05228Bba13D6B2BeDF97a7aaA729a962Bd8971BF";

const contract = new web3.eth.Contract(contractABI, contractAddress);
```

### Ethers.js Integration
```javascript
const { ethers } = require('ethers');

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const contractABI = [...]; // Import from compiled contract
const contractAddress = "0x05228Bba13D6B2BeDF97a7aaA729a962Bd8971BF";

const contract = new ethers.Contract(contractAddress, contractABI, signer);
```

---

## License

MIT License - See LICENSE file for details

---

## Support & Contribution

For issues, questions, or contributions:
- GitHub: https://github.com/cryptonique0/CECD
- Report bugs via GitHub Issues
- Submit pull requests for improvements

---

**Last Updated:** December 25, 2025
