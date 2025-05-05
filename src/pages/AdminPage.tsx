
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { updateMockData, getMockData } from '../utils/mockData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import UserProfile from '@/components/UserProfile';

const AdminPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isTestMode, setIsTestMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load API connection settings from Supabase
    const loadApiConnectionSettings = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('api_connections')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error loading API connection settings:', error);
          return;
        }
        
        if (data) {
          setApiUrl(data.api_url);
          setApiKey(data.api_key || '');
          setIsTestMode(data.is_test_mode);
        }
      } catch (error) {
        console.error('Error in loading API settings:', error);
      }
    };
    
    loadApiConnectionSettings();
  }, [user]);

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

  const handleImportData = async () => {
    setIsLoading(true);
    
    try {
      // In real implementation, this would fetch from the actual API
      // For now, simulate data import with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update mock data with "imported" data
      const importedData = {
        horses: getMockData().horses.map(horse => ({
          ...horse,
          liveOdds: parseFloat((horse.liveOdds * (0.9 + Math.random() * 0.3)).toFixed(2))
        }))
      };
      
      updateMockData(importedData);
      
      toast({
        title: "Data Imported",
        description: "Race data has been successfully imported.",
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-radial from-betting-dark to-black p-6 text-white">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-600">
              Odds Admin Panel
            </h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => window.location.href = "/"}>
                Back to Dashboard
              </Button>
              <UserProfile />
            </div>
          </div>
          <p className="text-gray-400 mt-2">
            Configure API connections and import race data
          </p>
        </header>

        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="connection">API Connection</TabsTrigger>
            <TabsTrigger value="import">Data Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connection">
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
          </TabsContent>
          
          <TabsContent value="import">
            <Card className="bg-betting-navyBlue border-betting-mediumBlue">
              <CardHeader>
                <CardTitle>Import Race Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  This will import the latest race data from the configured API.
                  Make sure your API connection is properly set up before proceeding.
                </p>
                
                <div className="bg-betting-dark border border-betting-mediumBlue rounded-md p-4 mb-4">
                  <h3 className="text-lg font-semibold mb-2">Connection Status</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>API URL:</div>
                    <div className="font-mono truncate">{apiUrl || "Not set"}</div>
                    
                    <div>API Key:</div>
                    <div>{apiKey ? "••••••••" : "Not set"}</div>
                    
                    <div>Mode:</div>
                    <div>{isTestMode ? "Test Mode (Mock Data)" : "Production Mode"}</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleImportData}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Importing..." : "Import Latest Race Data"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
