# Smart Contracts - Emergency Coordination Dashboard

This directory contains all Solidity smart contracts for the Community Emergency Coordination Dashboard (CECD).

## 📋 Directory Structure

```
contracts/
├── EmergencyCoordination.sol          # Main contract
├── EmergencyCoordinationTest.sol       # Test contract helper
├── interactions.js                     # Web3 & Ethers integration
├── CONTRACT_INFO.md                   # Complete contract documentation
├── TEST_SCENARIOS.md                  # Test cases and scenarios
├── DEPLOYMENT_CHECKLIST.md            # Deployment verification
└── README.md                          # This file
```

## 🚀 Quick Start

### Deploy to Remix
1. Go to https://remix.ethereum.org/
2. Create new file: `EmergencyCoordination.sol`
3. Copy contract code
4. Select compiler version `0.8.20+`
5. Click Deploy

### Use Web3.js
```javascript
const web3 = new Web3(window.ethereum);
const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
await contract.methods.createUserProfile("Name", "email@example.com", 0).send({from: userAddress});
```

### Use Ethers.js
```javascript
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
await contract.createUserProfile("Name", "email@example.com", 0);
```

## 📄 Contract Files

### EmergencyCoordination.sol
Main production contract with all core functionality:
- User Profile Management
- Incident Reporting & Management
- Volunteer Registration & Assignment
- Community Announcements
- Role-Based Access Control
- Analytics & Statistics

**Contract Address:** `0x05228Bba13D6B2BeDF97a7aaA729a962Bd8971BF`

### EmergencyCoordinationTest.sol
Test contract for verifying contract functionality:
- Test user registration
- Test volunteer registration
- Test incident creation
- Test status updates
- Test volunteer assignment
- Record and track test scenarios

### interactions.js
JavaScript library for contract interactions:
- 20+ helper functions
- Web3.js examples
- Ethers.js examples
- Event listeners
- Utility functions

**Includes:**
- User profile functions
- Incident management
- Volunteer operations
- Announcement creation
- Statistics retrieval

## 📚 Documentation Files

### CONTRACT_INFO.md
Complete contract documentation:
- Function signatures
- Parameters and return types
- Usage examples
- Integration guides
- Security features
- Event descriptions

### TEST_SCENARIOS.md
Comprehensive test cases:
- 10 different test scenarios
- Step-by-step instructions
- Expected results
- Troubleshooting guide
- Performance tests

### DEPLOYMENT_CHECKLIST.md
Deployment verification:
- Pre-deployment checklist
- Deployment details
- Post-deployment verification
- Function deployment status
- Network deployment status

## 🔐 Contract Features

### User Roles
- **Citizen:** Basic user, can report incidents
- **Volunteer:** Offers emergency assistance
- **Community Leader:** Posts announcements
- **Emergency Desk:** Manages operations

### Incident Management
- Report emergencies with location
- Categorize (Medical, Fire, Flood, Storm, Earthquake, Other)
- Set severity (Low, Medium, High, Critical)
- Track status (Reported → Acknowledged → InProgress → Resolved → Closed)
- Assign volunteers
- Get real-time statistics

### Volunteer System
- Register with skills
- Availability tracking (Available, Unavailable, Busy)
- Location-based assignments
- Rating system
- Verification process

### Analytics
- Incident statistics
- Volunteer availability
- User metrics
- Real-time dashboards

## 🛠️ Development

### Prerequisites
- Solidity ^0.8.20
- Remix IDE or Hardhat
- Web3.js or Ethers.js
- MetaMask or similar wallet

### Compile
```bash
# Remix: Click "Compile"
# Or with Hardhat:
npx hardhat compile
```

### Deploy
```bash
# Remix: Click "Deploy"
# Or with Hardhat:
npx hardhat run scripts/deploy.js --network <network-name>
```

### Test
```bash
# With Hardhat:
npx hardhat test

# Or use TEST_SCENARIOS.md for manual testing
```

## 📊 Contract Statistics

| Metric | Value |
|--------|-------|
| Total Functions | 28 |
| Total Events | 10 |
| Deployment Gas | ~2.7M |
| Average Tx Gas | 100K-200K |
| Lines of Code | 467 |
| Data Structures | 4 |
| Mappings | 10 |
| Arrays | 4 |

## 🔗 Integration

### Frontend Integration
```javascript
import { 
    createUserProfileEthers,
    createIncidentEthers,
    registerVolunteerEthers,
    getIncidentStatsEthers
} from './contracts/interactions.js';
```

### Event Listening
```javascript
contract.on("IncidentCreated", (id, reporter, category, severity) => {
    console.log(`New incident: ${id}`);
});
```

### Read Operations
```javascript
const incidents = await contract.getAllIncidents();
const stats = await contract.getIncidentStats();
const volunteers = await contract.getAvailableVolunteers();
```

### Write Operations
```javascript
const tx = await contract.createIncident(
    title, description, category, severity, lat, lng
);
await tx.wait();
```

## 🧪 Testing Guide

### Quick Test (5 minutes)
1. Deploy contract to Remix VM
2. Create user profile
3. Register volunteer
4. Create incident
5. Verify with getIncidentStats()

### Full Test Suite (30 minutes)
Follow TEST_SCENARIOS.md for:
- User registration flow
- Volunteer management
- Complete incident lifecycle
- Access control verification
- Event emission testing
- Statistics calculation

### Performance Test
- Create 100+ users
- Create 50+ incidents
- Retrieve all at once
- Monitor gas costs

## 🚨 Security Considerations

### Implemented
✅ Role-based access control
✅ User verification requirement
✅ Input validation
✅ Event logging
✅ No reentrancy risks
✅ Proper access modifiers

### Recommendations
- Monitor for unusual activity
- Regular security audits
- Keep dependencies updated
- Use hardware wallet for owner
- Implement rate limiting (at L2 level)

## 🐛 Known Issues

### Current
1. Location precision requires * 1e6
2. No pagination on large arrays
3. Time depends on block.timestamp

### Planned Fixes
- Implement paginated queries
- Add geospatial indexing
- Add upgrade pattern for future versions

## 📞 Support

### Resources
- **Documentation:** See .md files
- **Code Examples:** See interactions.js
- **Test Cases:** See TEST_SCENARIOS.md
- **GitHub:** https://github.com/cryptonique0/CECD

### Getting Help
1. Check TEST_SCENARIOS.md for common issues
2. Review CONTRACT_INFO.md for function details
3. Check event logs for errors
4. Open GitHub issue for bugs

## 📝 Version History

### v1.0.0 - Released December 25, 2025
- ✅ Core functionality implemented
- ✅ User management system
- ✅ Incident tracking
- ✅ Volunteer coordination
- ✅ Announcement system
- ✅ Analytics dashboard

### Planned v2.0
- Upgrade pattern implementation
- Advanced filtering
- Token incentives
- Multi-signature features

## 📄 License

MIT License - See LICENSE file for details

## 👥 Contributors

- **Developer:** web3joker
- **Repository:** https://github.com/cryptonique0/CECD
- **Network:** EVM Compatible Blockchains

## 🎯 Roadmap

### Phase 1 (Complete)
- [x] Smart contract development
- [x] Contract deployment
- [x] Documentation

### Phase 2 (In Progress)
- [ ] Frontend integration
- [ ] Event monitoring
- [ ] Advanced analytics

### Phase 3 (Planned)
- [ ] Mobile app integration
- [ ] Advanced search
- [ ] Token rewards system

---

**Last Updated:** December 25, 2025  
**Contract Address:** `0x05228Bba13D6B2BeDF97a7aaA729a962Bd8971BF`  
**Status:** ✅ Live & Operational
