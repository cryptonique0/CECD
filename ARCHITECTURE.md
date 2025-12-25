# Architecture Overview (Dec 2025)

This document describes the current CECD architecture after the frontend/web3 integration work completed in December 2025.

## System Snapshot
- **Frontend:** React 19 + Vite + TypeScript + Tailwind, bundled in `frontend/`
- **Web3:** Ethers.js v6 with a dedicated contract service and React hook
- **Smart Contract:** Deployed at `0x05228Bba13D6B2BeDF97a7aaA729a962Bd8971BF` (Sepolia)
- **Docs:** Deployment and build guides live in `FRONTEND_DEPLOYMENT.md`, `BUILD_SUMMARY.md`, `DEPLOY_NOW.md`
- **Legacy Backend:** Motoko canister code remains in `backend/` but the active dApp path is Ethereum + React

## Frontend Architecture
```
frontend/
├── src/
│   ├── components/        # Feature UIs + reusable UI kit (17 primitives)
│   ├── contexts/          # Cross-cutting contexts (e.g., Stacks placeholder)
│   ├── hooks/             # Custom React hooks (useWeb3Contract)
│   ├── lib/               # Utilities (e.g., className helper)
│   ├── locales/           # i18n assets
│   ├── pages/             # Top-level routed views
│   └── services/          # Web3 contract service (Ethers v6)
├── public/                # Static assets, manifest, service worker
└── package.json           # Dependencies and scripts
```

### Key Frontend Building Blocks
- **UI Kit:** Buttons, cards, inputs, alerts, sheets, dialogs, tabs, dropdowns, etc. (all custom in `src/components/ui/`).
- **Contract Service (`src/services/contractService.ts`):**
  - Wraps the deployed contract ABI (28 functions, 10 events).
  - Handles provider/signer lifecycle via EIP-1193 (MetaMask).
  - Exposes typed helpers: incidents, volunteers, announcements, analytics, roles.
- **React Hook (`src/hooks/useWeb3Contract.ts`):**
  - Manages connection state, loading/error flags, and toast reporting.
  - Provides component-friendly methods for contract calls.
- **Pages & Features:** Incident feed/map, announcements, notifications, analytics, volunteer flows, etc.
- **Styling:** Tailwind utility-first styles; minimal custom CSS in `index.css`.
- **Build:** Vite for bundling; PWA assets in `public/` (manifest + service worker).

### State & Data Flow
1. **User connects wallet** via MetaMask → `contractService` instantiates provider + signer.
2. **UI calls hook methods** → `useWeb3Contract` delegates to `contractService`.
3. **On-chain ops** execute against contract at `0x0522…71BF`; results/events feed UI.
4. **Optimistic UI + toasts** for feedback; minimal local state, no global state library required.

## Smart Contract Integration
- **Address:** `0x05228Bba13D6B2BeDF97a7aaA729a962Bd8971BF` (Sepolia, chainId 11155111)
- **Provider:** EIP-1193 (window.ethereum) → Ethers v6 `BrowserProvider`
- **Features exposed:**
  - User profiles and role-based access control
  - Incident creation, updates, and history
  - Volunteer registration and assignments
  - Announcements and notifications
  - Analytics and report generation

## Deployment Flow
1. `npm run build` in `frontend/` → outputs to `frontend/dist/`.
2. Deploy static assets to Vercel/Netlify/GitHub Pages/Docker Nginx.
3. Set environment variables:
   - `VITE_CONTRACT_ADDRESS=0x05228Bba13D6B2BeDF97a7aaA729a962Bd8971BF`
   - `VITE_RPC_URL=https://sepolia.infura.io/v3/<KEY>`
   - `VITE_CHAIN_ID=11155111`

## Security Considerations
- Wallet permissions requested minimally (EIP-1193).
- Input validation on forms; user feedback via toasts.
- Contract enforces roles/permissions on-chain.
- PWA assets served statically; no server-side secrets.

## Performance Notes
- Vite code splitting; lazy loading where appropriate.
- Tailwind for small CSS footprint.
- Service worker for offline caching of static assets.

## Legacy / Secondary Stack
- `backend/` retains Motoko canister code (main.mo, migration.mo, authorization/access-control.mo).
- Current production path does **not** rely on these canisters; future integration can rewire `contractService` equivalents for Motoko if needed.
