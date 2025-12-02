# Deployment Guide

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
