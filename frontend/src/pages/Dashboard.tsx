import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-blue-500" />
            Community Emergency Coordination Dashboard
          </CardTitle>
          <CardDescription>Smart Contract: 0x05228Bba13D6B2BeDF97a7aaA729a962Bd8971BF</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Welcome to CECD! This is a minimal dashboard to verify the frontend is working.</p>
          <Button variant="default">Connect Wallet</Button>
        </CardContent>
      </Card>
    </div>
  );
}
