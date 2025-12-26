import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { StacksProvider } from './contexts/StacksContext';
// import Dashboard from './pages/Dashboard';
import TestDashboard from './pages/TestDashboard';

export default function App() {
  console.log('App component rendering');
  
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <StacksProvider>
        <div className="flex min-h-screen flex-col bg-background">
          <TestDashboard />
          <Toaster />
        </div>
      </StacksProvider>
    </ThemeProvider>
  );
}
