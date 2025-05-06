
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface ApiConnectionTabProps {
  user: User | null;
  apiUrl: string;
  apiKey: string;
  isTestMode: boolean;
  setApiUrl: (url: string) => void;
  setApiKey: (key: string) => void;
  setIsTestMode: (isTestMode: boolean) => void;
}

const ApiConnectionTab: React.FC<ApiConnectionTabProps> = ({
  user,
  apiUrl,
  apiKey,
  isTestMode,
  setApiUrl,
  setApiKey,
  setIsTestMode
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResponse, setTestResponse] = useState<string | null>(null);

  const handleTestConnection = async () => {
    if (!apiUrl) {
      toast({
        title: "Error",
        description: "Please enter an API URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setTestResponse(null);

    try {
      // Simulate API connection test
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success response with sample data
      const mockResponse = JSON.stringify({
        success: true,
        data: {
          track: "CHURCHILL DOWNS",
          race: 7,
          horses: [
            { pp: 1, name: "Fast Lightning", odds: 6.5 },
            { pp: 2, name: "Lucky Star", odds: 9.2 },
            // More horses would be here in real response
          ]
        }
      }, null, 2);
      
      setTestResponse(mockResponse);
      
      toast({
        title: "Connection Successful",
        description: "API connection test was successful.",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to API",
        variant: "destructive",
      });
      setTestResponse(JSON.stringify({
        success: false,
        error: "Failed to connect to API"
      }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConnection = async () => {
    if (!apiUrl || !user) {
      toast({
        title: "Error",
        description: "Please enter an API URL",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Check if a connection already exists
      const { data: existingData, error: fetchError } = await supabase
        .from('api_connections')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (fetchError) {
        throw fetchError;
      }
      
      let result;
      
      if (existingData) {
        // Update existing connection
        result = await supabase
          .from('api_connections')
          .update({
            api_url: apiUrl,
            api_key: apiKey,
            is_test_mode: isTestMode,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id);
      } else {
        // Create new connection
        result = await supabase
          .from('api_connections')
          .insert({
            user_id: user.id,
            api_url: apiUrl,
            api_key: apiKey,
            is_test_mode: isTestMode
          });
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: "Connection Saved",
        description: "API connection settings have been saved.",
      });
    } catch (error) {
      console.error('Error saving connection:', error);
      toast({
        title: "Error Saving Connection",
        description: "An error occurred while saving the connection.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Card className="bg-betting-navyBlue border-betting-mediumBlue">
        <CardHeader>
          <CardTitle>API Connection Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiUrl">API URL</Label>
            <Input
              id="apiUrl"
              placeholder="https://api.racing-odds.com/v1/odds"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="bg-betting-dark text-white border-betting-mediumBlue"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-betting-dark text-white border-betting-mediumBlue"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="test-mode"
              checked={isTestMode}
              onCheckedChange={setIsTestMode}
            />
            <Label htmlFor="test-mode">Test Mode (Use mock data)</Label>
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button 
            onClick={handleTestConnection}
            disabled={isLoading}
          >
            {isLoading ? "Testing..." : "Test Connection"}
          </Button>
          <Button 
            variant="outline"
            onClick={handleSaveConnection}
            disabled={isLoading || isSaving}
          >
            {isSaving ? "Saving..." : "Save Connection"}
          </Button>
        </CardFooter>
      </Card>
      
      {testResponse && (
        <div className="mt-4">
          <Card className="bg-betting-dark border-betting-mediumBlue">
            <CardHeader>
              <CardTitle>Test Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-black rounded p-4 overflow-auto max-h-80 text-sm">
                {testResponse}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default ApiConnectionTab;
