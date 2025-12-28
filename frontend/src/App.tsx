import { Toaster } from 'sonner';
import Dashboard from './pages/Dashboard';

export default function App() {
  console.log('App component rendering');
  
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Dashboard />
      <Toaster />
    </div>
  );
}
