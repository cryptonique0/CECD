# Frontend Deployment Configuration

## Environment Variables (.env.local)

```env
# Contract Configuration
VITE_CONTRACT_ADDRESS=0x05228Bba13D6B2BeDF97a7aaA729a962Bd8971BF
VITE_CONTRACT_CHAIN_ID=1

# RPC Endpoints (choose based on your network)
# Ethereum Mainnet
VITE_RPC_URL=https://eth-rpc.publicnode.com

# Ethereum Sepolia Testnet
# VITE_RPC_URL=https://sepolia-rpc.publicnode.com

# Polygon Mainnet
# VITE_RPC_URL=https://polygon-rpc.publicnode.com

# Polygon Mumbai Testnet
# VITE_RPC_URL=https://rpc-mumbai.maticvigil.com

# Build Configuration
VITE_API_TIMEOUT=30000
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
```

## Build Commands

### Development
```bash
npm run start
# Frontend runs on http://localhost:5173
```

### Production Build
```bash
npm run build
# Creates optimized build in dist/ folder
```

### Preview Production Build
```bash
npm run serve
# Serves the production build locally
```

### Run Tests
```bash
npm run test
```

## Deployment Targets

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
# Follow the prompts to connect to your Vercel account
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Manual/Self-Hosted
```bash
npm run build
# Upload dist/ folder to your server
# Configure web server to serve SPA (all routes → index.html)
```

## Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:
```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

Build and run:
```bash
docker build -t cecd-frontend .
docker run -p 80:80 cecd-frontend
```

## Network Configuration

### Supported Networks
1. **Ethereum Mainnet** - Production (Contract deployed)
2. **Sepolia Testnet** - Testing
3. **Polygon Mainnet** - Alternative
4. **Polygon Mumbai** - Testing

## Performance Optimization

### Already Configured
- ✅ Vite for fast build
- ✅ Code splitting
- ✅ Lazy loading
- ✅ CSS optimization (Tailwind)
- ✅ React 19 with fast refresh

### Additional Recommendations
1. Enable gzip compression on server
2. Use CDN for static assets
3. Enable browser caching headers
4. Consider image optimization
5. Monitor bundle size

## Post-Deployment Checklist

- [ ] Environment variables configured correctly
- [ ] Contract address verified
- [ ] RPC endpoint working
- [ ] MetaMask/Web3 connection tested
- [ ] All contract functions callable
- [ ] Events listening working
- [ ] Error messages displaying
- [ ] Notifications working
- [ ] Mobile responsive
- [ ] Performance acceptable

## Troubleshooting

### Contract connection fails
- Check VITE_CONTRACT_ADDRESS is correct
- Verify RPC_URL is valid
- Ensure MetaMask is installed
- Check network matches contract deployment

### Transaction fails
- Verify user has gas tokens
- Check account has required role
- Ensure contract is verified
- Look at contract events for details

### MetaMask connection issues
- Refresh browser
- Disconnect and reconnect wallet
- Clear browser cache
- Check browser console for errors

## Support & Resources

- Frontend Code: `frontend/src/`
- Contract Service: `frontend/src/services/contractService.ts`
- Web3 Hook: `frontend/src/hooks/useWeb3Contract.ts`
- Contract Documentation: `contracts/CONTRACT_INFO.md`
- Deployment Guide: `DEPLOYMENT.md`

## Security Notes

- Never commit .env.local to git
- Use environment-specific .env files
- Rotate RPC keys regularly
- Monitor for suspicious activity
- Keep dependencies updated
- Use security headers on server

## Performance Targets

- Page Load: < 3s
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Bundle Size: < 500KB (gzipped)

---

**Deployment Ready:** ✅ Yes
**Last Updated:** December 25, 2025
