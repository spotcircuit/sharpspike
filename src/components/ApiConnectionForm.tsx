
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { connectToRealOddsApi } from '../utils/api/oddsService';
import { useToast } from "@/components/ui/use-toast";

interface ApiConnectionFormProps {
  onConnect: (connected: boolean) => void;
}

const ApiConnectionForm: React.FC<ApiConnectionFormProps> = ({ onConnect }) => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [useMockData, setUseMockData] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    if (useMockData) {
      toast({
        title: "Using Mock Data",
        description: "The application is now using simulated odds data",
        duration: 3000,
      });
      onConnect(true);
      return;
    }
    
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid API key to connect",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    setIsConnecting(true);
    
    try {
      // Connect to the real API
      const result = connectToRealOddsApi(apiKey, apiUrl.trim() || undefined);
      
      if (result.isConnected) {
        toast({
          title: "Connected Successfully",
          description: "The application is now using real odds data",
          duration: 3000,
        });
        onConnect(true);
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to odds API",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card className="border-4 border-betting-mediumBlue shadow-xl bg-betting-darkCard overflow-hidden w-full">
      <CardHeader className="bg-naval-gradient px-4 py-3">
        <CardTitle className="text-lg font-semibold text-white">Connect to Odds API</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="use-mock" 
            checked={useMockData} 
            onCheckedChange={setUseMockData} 
          />
          <Label htmlFor="use-mock">Use simulated data</Label>
        </div>
        
        {!useMockData && (
          <>
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your odds API key"
                className="bg-gray-800 text-white"
                type="password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="api-url">API URL (Optional)</Label>
              <Input
                id="api-url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.example.com/v1"
                className="bg-gray-800 text-white"
              />
              <p className="text-xs text-gray-400">Leave empty to use the default API endpoint</p>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="border-t border-gray-700 bg-gray-800/30 px-4 py-3">
        <Button 
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
        >
          {isConnecting ? "Connecting..." : "Connect to Odds Data"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApiConnectionForm;
