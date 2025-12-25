# Deployment Guide

## Smart Contract Deployment

### ✅ Deployed Contract
**Contract Address:** `0x05228Bba13D6B2BeDF97a7aaA729a962Bd8971BF`  
**Network:** Ethereum/EVM Compatible  
**Deployed:** December 25, 2025  
**Contract:** EmergencyCoordination.sol

### Interact with Contract
You can interact with the deployed contract at:
```
https://remix.ethereum.org/
```

### Contract Features
- ✅ User Profile Management
- ✅ Emergency Incident Reporting
- ✅ Volunteer Registration & Management
- ✅ Community Announcements
- ✅ Role-Based Access Control
- ✅ Analytics & Statistics

### Key Functions
- `createUserProfile(name, email, role)` - Register new users
- `createIncident(title, description, category, severity, lat, lng)` - Report incidents
- `registerVolunteer(name, email, skills, lat, lng)` - Register as volunteer
- `createAnnouncement(title, message, priority)` - Post announcements
- `getIncidentStats()` - View incident statistics
- `getVolunteerStats()` - View volunteer statistics

---

## Frontend Deployment

### Prerequisites
- Node.js 18+
- Git

### Build for Production
```bash
cd frontend
npm install
npm run build
```

The built files will be in `frontend/dist/`.

### Deploy to Vercel
```bash
npx vercel --prod
```

### Deploy to Netlify
```bash
cd frontend
npm run build
npx netlify deploy --prod --dir=dist
```

### Environment Variables
Create `.env` file:
```
VITE_CONTRACT_ADDRESS=0x05228Bba13D6B2BeDF97a7aaA729a962Bd8971BF
VITE_CELO_RPC_URL=https://forno.celo.org
VITE_ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org
```

## Backend Deployment

### Internet Computer
```bash
dfx deploy --network ic
```

### Update Canister
```bash
dfx canister install backend --mode upgrade --network ic
```

## Post-Deployment

### Verify
- Check frontend loads correctly
- Test wallet connection
- Verify blockchain interactions
- Test offline mode

### Monitoring
- Check error logs
- Monitor transaction success rate
- Track user metrics
