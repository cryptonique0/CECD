import React, { useState } from 'react';
import { useStacks } from '../contexts/StacksContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Bitcoin, Send } from 'lucide-react';

const StacksDonation: React.FC = () => {
  const { address, isConnected } = useStacks();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const handleDonate = () => {
    console.log('Donate', amount, 'STX with message:', message);
    // Placeholder for actual Stacks donation logic
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bitcoin className="text-orange-500" />
          Donate STX
        </CardTitle>
        <CardDescription>Support emergency response efforts</CardDescription>
      </CardHeader>
      <CardContent>
        {!isConnected ? (
          <div className="p-4 bg-orange-50 rounded-lg text-center">
            <p className="text-sm text-gray-600">
              Connect your Stacks wallet to donate
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount (STX)</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message (optional)</label>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Support message"
              />
            </div>
            <Button onClick={handleDonate} disabled={!amount} className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Donate
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StacksDonation;
