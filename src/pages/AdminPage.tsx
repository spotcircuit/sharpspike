
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import UserProfile from '@/components/UserProfile';
import PDFUploader from '@/components/PDFUploader';
import RaceDataManager from '@/components/RaceDataManager';
import ApiConnectionTab from '@/components/admin/ApiConnectionTab';
import DataImportTab from '@/components/admin/DataImportTab';
import { Button } from '@/components/ui/button';

const AdminPage = () => {
  const { user } = useAuth();
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isTestMode, setIsTestMode] = useState(true);

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

  const handlePDFDataExtracted = (data: any) => {
    console.log('Extracted PDF data:', data);
    // The data is already updated in the updateMockData function in PDFUploader
  };

  return (
    <div className="min-h-screen bg-gradient-radial from-betting-dark to-black p-6 text-white">
      <div className="max-w-5xl mx-auto">
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
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="connection">API Connection</TabsTrigger>
            <TabsTrigger value="import">Data Import</TabsTrigger>
            <TabsTrigger value="pdf-import">PDF Import</TabsTrigger>
            <TabsTrigger value="race-data">Race Database</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connection">
            <ApiConnectionTab 
              user={user}
              apiUrl={apiUrl}
              apiKey={apiKey}
              isTestMode={isTestMode}
              setApiUrl={setApiUrl}
              setApiKey={setApiKey}
              setIsTestMode={setIsTestMode}
            />
          </TabsContent>
          
          <TabsContent value="import">
            <DataImportTab 
              apiUrl={apiUrl}
              apiKey={apiKey}
              isTestMode={isTestMode}
            />
          </TabsContent>
          
          <TabsContent value="pdf-import">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Import Race Data from PDF</CardTitle>
            </CardHeader>
            <PDFUploader onDataExtracted={handlePDFDataExtracted} />
          </TabsContent>
          
          <TabsContent value="race-data">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Manage Race Database</CardTitle>
            </CardHeader>
            <RaceDataManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
