
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LiveDataStream from './streaming/LiveDataStream';

interface TrackDataViewProps {
  trackName: string;
}

const TrackDataView: React.FC<TrackDataViewProps> = ({ trackName }) => {
  const [activeTab, setActiveTab] = useState('odds');
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{trackName} Track Data</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="odds">Odds Data</TabsTrigger>
          <TabsTrigger value="will_pays">Will Pays</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="odds" className="mt-4">
          <LiveDataStream trackName={trackName} jobType="odds" />
        </TabsContent>
        
        <TabsContent value="will_pays" className="mt-4">
          <LiveDataStream trackName={trackName} jobType="will_pays" />
        </TabsContent>
        
        <TabsContent value="results" className="mt-4">
          <LiveDataStream trackName={trackName} jobType="results" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrackDataView;
