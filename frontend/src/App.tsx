import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Suspense, lazy } from 'react';

// Lazy load Dashboard to catch import errors
const Dashboard = lazy(() =>
  import('./pages/Dashboard').catch(err => {
    console.error('Failed to load Dashboard:', err);
    return {
      default: () => (
        <div style={{ padding: '20px', color: 'red' }}>
          <h2>Dashboard Load Error</h2>
          <p>{String(err)}</p>
        </div>
      ),
    };
  })
);

function AppContent() {
  return (
    <Suspense fallback={<div style={{ padding: '20px' }}>Loading Dashboard...</div>}>
      <Dashboard />
    </Suspense>
  );
}

export default function App() {
  console.log('App component rendering');
  
  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh' }}>
        <AppContent />
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}
