# Contract Interaction Examples

This directory contains scripts and examples for interacting with the Emergency Coordination smart contract.

**Contract Address:** `0x05228Bba13D6B2BeDF97a7aaA729a962Bd8971BF`

## Available Scripts

### 1. Web3.js Interaction (`interact.js`)
Full-featured interaction script using Web3.js library.

**Setup:**
```bash
npm install web3
```

**Usage:**
```javascript
const { createUserProfile, createIncident, getIncidentStats } = require('./interact.js');

// Create a user profile
await createUserProfile('John Doe', 'john@example.com', 0);

// Create an incident
await createIncident(
    'Medical Emergency',
    'Person needs assistance',
    0, // Medical
    2, // High severity
    40.7589,
    -73.9851
);

// Get statistics
await getIncidentStats();
```

### 2. Ethers.js Interaction (`ethers-interact.js`)
Modern interaction script using Ethers.js library.

**Setup:**
```bash
npm install ethers
```

**Configuration:**
```bash
export RPC_URL="your-rpc-endpoint"
export PRIVATE_KEY="your-private-key"
```

**Usage:**
```javascript
const { 
    createUserProfile, 
    getIncidentStats,
    AppRole,
    IncidentCategory 
} = require('./ethers-interact.js');

// Create profile
await createUserProfile('Jane Doe', 'jane@example.com', AppRole.Volunteer);

// Get statistics
await getIncidentStats();
```

### 3. Remix Browser (`remix-examples.md`)
Step-by-step guide for interacting directly in Remix IDE.

## Environment Variables

Create a `.env` file in this directory:

```env
# RPC Endpoint (Required for transactions)
RPC_URL=https://your-rpc-endpoint

# Private Key (Required for write operations)
PRIVATE_KEY=your-private-key-here

# Contract Address (Already configured)
CONTRACT_ADDRESS=0x05228Bba13D6B2BeDF97a7aaA729a962Bd8971BF
```

## Quick Start

### Read-Only Access (No wallet needed)

```javascript
const { ethers } = require('ethers');
const { contractReadOnly, getIncidentStats } = require('./ethers-interact.js');

// Get statistics
await getIncidentStats();

// Get all incidents
const incidents = await contractReadOnly.getAllIncidents();
console.log('Incidents:', incidents);
```

### Write Access (Wallet required)

```javascript
const { createIncident, IncidentCategory, IncidentSeverity } = require('./ethers-interact.js');

// Report a new incident
await createIncident(
    'Fire Emergency',
    'Building fire at Main Street',
    IncidentCategory.Fire,
    IncidentSeverity.Critical,
    40.7589,  // latitude
    -73.9851  // longitude
);
```

## Common Functions

### User Management
- `createUserProfile(name, email, role)` - Register new user
- `getMyProfile()` - Get your profile
- `verifyUser(address)` - Verify a user (admin only)

### Incident Management
- `createIncident(title, desc, category, severity, lat, lng)` - Report incident
- `getIncident(id)` - Get incident details
- `getAllIncidents()` - Get all incident IDs
- `updateIncidentStatus(id, status)` - Update status (admin only)

### Volunteer Management
- `registerVolunteer(name, email, skills, lat, lng)` - Register as volunteer
- `getVolunteer(address)` - Get volunteer details
- `getAllVolunteers()` - Get all volunteers
- `getAvailableVolunteers()` - Get available volunteers

### Analytics
- `getIncidentStats()` - Get incident statistics
- `getVolunteerStats()` - Get volunteer statistics
- `getTotalUsers()` - Get total registered users

## Enums Reference

### AppRole
```javascript
0 = Citizen
1 = Volunteer
2 = CommunityLeader
3 = EmergencyDesk
```

### IncidentCategory
```javascript
0 = Medical
1 = Fire
2 = Flood
3 = Storm
4 = Earthquake
5 = Other
```

### IncidentSeverity
```javascript
0 = Low
1 = Medium
2 = High
3 = Critical
```

### IncidentStatus
```javascript
0 = Reported
1 = Acknowledged
2 = InProgress
3 = Resolved
4 = Closed
```

### VolunteerStatus
```javascript
0 = Available
1 = Unavailable
2 = Busy
```

## Testing Scenarios

### Scenario 1: New User Registration
```javascript
// 1. Create profile
await createUserProfile('Alice', 'alice@example.com', AppRole.Citizen);

// 2. Verify profile (as admin)
await verifyUser('0x...');

// 3. Check profile
await getMyProfile();
```

### Scenario 2: Report and Manage Incident
```javascript
// 1. Register as volunteer
await registerVolunteer('Bob', 'bob@example.com', ['First Aid'], 40.7, -73.9);

// 2. Report incident
await createIncident('Medical Emergency', 'Help needed', 0, 2, 40.7, -73.9);

// 3. Update incident (as admin)
await updateIncidentStatus(1, IncidentStatus.Acknowledged);
```

### Scenario 3: Analytics Dashboard
```javascript
// Get comprehensive statistics
const incidentStats = await getIncidentStats();
const volunteerStats = await getVolunteerStats();
const totalUsers = await getTotalUsers();

console.log('Dashboard:', {
    incidents: incidentStats,
    volunteers: volunteerStats,
    users: totalUsers
});
```

## Error Handling

All functions include error handling. Common errors:

- **"Profile already exists"** - User already registered
- **"User must be verified"** - Profile needs verification before creating incidents
- **"Only owner can call this function"** - Admin-only function
- **"Incident does not exist"** - Invalid incident ID

## Security Notes

⚠️ **Important:**
- Never commit private keys to version control
- Use environment variables for sensitive data
- Test on testnet before mainnet deployment
- Verify all transactions before signing

## Support

For issues or questions:
- GitHub Issues: https://github.com/cryptonique0/CECD/issues
- Documentation: See `../CONTRACT_INFO.md`

---

**Last Updated:** December 25, 2025
