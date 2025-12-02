import ReactDOM from 'react-dom/client';
import { InternetIdentityProvider } from './hooks/useInternetIdentity';
import { initEditor } from './hooks/useEditor';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import './i18n';
import WalletConnectProvider from "@walletconnect/web3-provider";

const queryClient = new QueryClient();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initEditor());
} else {
    initEditor();
}

const provider = new WalletConnectProvider({
    rpc: {
        1: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID", // Replace with your RPC URL
    },
    qrcode: true,
});

// Enable session (triggers QR Code modal)
await provider.enable();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
        <InternetIdentityProvider>
            <App />
        </InternetIdentityProvider>
    </QueryClientProvider>
);
