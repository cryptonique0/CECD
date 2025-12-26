import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { StacksProvider } from './contexts/StacksContext';
import Dashboard from './pages/Dashboard';

export default function App() {
  console.log('App component rendering');
  
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <StacksProvider>
        <div className="flex min-h-screen flex-col bg-background">
          <Dashboard />
          <Toaster />
        </div>
      </StacksProvider>
    </ThemeProvider>
  );
}
