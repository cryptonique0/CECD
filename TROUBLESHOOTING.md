# Troubleshooting Guide

## Common Issues

### Wallet Connection Issues

#### Problem: WalletConnect not showing QR code
**Solution:**
- Clear browser cache
- Try a different browser
- Ensure popup blockers are disabled

#### Problem: Wrong network detected
**Solution:**
```javascript
// Switch to Celo Mainnet
await window.ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: '0xA4EC' }], // 42220 in hex
});
```

### Transaction Errors

#### Problem: "Insufficient funds for gas"
**Solution:**
- Ensure you have enough CELO for gas fees
- Try reducing transaction amount
- Check current gas prices

#### Problem: Transaction stuck pending
**Solution:**
- Wait for network confirmation (can take 5-10 seconds)
- Check transaction on block explorer
- If stuck for >5 minutes, try increasing gas price

### Build/Development Issues

#### Problem: `npm install` fails
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### Problem: Vite dev server won't start
**Solution:**
```bash
# Check if port 5173 is in use
lsof -i :5173
# Kill the process if needed
kill -9 <PID>
# Restart dev server
npm run dev
```

### PWA/Offline Issues

####Problem: Service worker not registering
**Solution:**
- Must be served over HTTPS (except localhost)
- Check browser console for errors
- Clear service worker cache in DevTools

#### Problem: Offline mode not working
**Solution:**
- Ensure service worker is active
- Check Application tab in DevTools
- Verify cache storage

## Still Having Issues?

1. Check [GitHub Issues](https://github.com/cryptonique0/CECD/issues)
2. Read the [FAQ](FAQ.md)
3. Open a new issue with details
