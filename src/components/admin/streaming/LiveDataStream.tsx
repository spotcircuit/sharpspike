
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Loader2, Database, FileText, AlertCircle } from 'lucide-react';

interface LiveDataStreamProps {
  trackName?: string;
  jobType?: 'odds' | 'will_pays' | 'results';
}

const LiveDataStream: React.FC<LiveDataStreamProps> = ({ 
  trackName,
  jobType
}) => {
  const [streamData, setStreamData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    const fetchData = async () => {
      try {
        let data;
        
        if (jobType === 'odds') {
          const response = await supabase
            .from('odds_data')
            .select('*')
            .order('scraped_at', { ascending: false })
            .limit(15);
            
          if (trackName) {
            const filteredResponse = await supabase
              .from('odds_data')
              .select('*')
              .eq('track_name', trackName)
              .order('scraped_at', { ascending: false })
              .limit(15);
            
            if (filteredResponse.error) throw filteredResponse.error;
            data = filteredResponse.data;
          } else {
            if (response.error) throw response.error;
            data = response.data;
          }
          
        } else if (jobType === 'will_pays') {
          const response = await supabase
            .from('exotic_will_pays')
            .select('*')
            .order('scraped_at', { ascending: false })
            .limit(15);
            
          if (trackName) {
            const filteredResponse = await supabase
              .from('exotic_will_pays')
              .select('*')
              .eq('track_name', trackName)
              .order('scraped_at', { ascending: false })
              .limit(15);
            
            if (filteredResponse.error) throw filteredResponse.error;
            data = filteredResponse.data;
          } else {
            if (response.error) throw response.error;
            data = response.data;
          }
          
        } else if (jobType === 'results') {
          const response = await supabase
            .from('race_results')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(15);
            
          if (trackName) {
            const filteredResponse = await supabase
              .from('race_results')
              .select('*')
              .eq('track_name', trackName)
              .order('created_at', { ascending: false })
              .limit(15);
            
            if (filteredResponse.error) throw filteredResponse.error;
            data = filteredResponse.data;
          } else {
            if (response.error) throw response.error;
            data = response.data;
          }
          
        } else {
          // Default to odds data if no type specified
          const response = await supabase
            .from('odds_data')
            .select('*')
            .order('scraped_at', { ascending: false })
            .limit(15);
            
          if (trackName) {
            const filteredResponse = await supabase
              .from('odds_data')
              .select('*')
              .eq('track_name', trackName)
              .order('scraped_at', { ascending: false })
              .limit(15);
            
            if (filteredResponse.error) throw filteredResponse.error;
            data = filteredResponse.data;
          } else {
            if (response.error) throw response.error;
            data = response.data;
          }
        }
        
        setStreamData(data || []);
      } catch (err: any) {
        console.error('Error fetching stream data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Initial fetch
    fetchData();
    
    // Set up real-time subscription
    let channel;
    
    if (jobType === 'odds') {
      channel = supabase
        .channel('odds-data-changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'odds_data',
          filter: trackName ? `track_name=eq.${trackName}` : undefined
        }, (payload) => {
          setStreamData(prevData => {
            const newData = [payload.new, ...prevData].slice(0, 15);
            return newData;
          });
        })
        .subscribe();
    } else if (jobType === 'will_pays') {
      channel = supabase
        .channel('will-pays-changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'exotic_will_pays',
          filter: trackName ? `track_name=eq.${trackName}` : undefined
        }, (payload) => {
          setStreamData(prevData => {
            const newData = [payload.new, ...prevData].slice(0, 15);
            return newData;
          });
        })
        .subscribe();
    } else if (jobType === 'results') {
      channel = supabase
        .channel('results-changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'race_results',
          filter: trackName ? `track_name=eq.${trackName}` : undefined
        }, (payload) => {
          setStreamData(prevData => {
            const newData = [payload.new, ...prevData].slice(0, 15);
            return newData;
          });
        })
        .subscribe();
    } else {
      // Default to odds data if no type specified
      channel = supabase
        .channel('odds-data-changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'odds_data',
          filter: trackName ? `track_name=eq.${trackName}` : undefined
        }, (payload) => {
          setStreamData(prevData => {
            const newData = [payload.new, ...prevData].slice(0, 15);
            return newData;
          });
        })
        .subscribe();
    }
    
    // Refresh data every 10 seconds as backup
    const interval = setInterval(fetchData, 10000);
    
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [trackName, jobType]);
  
  const getStreamContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-betting-skyBlue mb-4" />
          <p className="text-gray-400">Loading live data stream...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
          <p className="text-red-400">{error}</p>
        </div>
      );
    }
    
    if (streamData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <Database className="h-10 w-10 text-gray-500 mb-4" />
          <p className="text-gray-400">No data available. Run a scrape job to see live data.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
        {streamData.map((item, index) => (
          <div 
            key={item.id || index} 
            className={`bg-betting-darkPurple/30 p-3 rounded-md border-l-4 ${
              index === 0 ? 'border-green-500 animate-pulse' : 'border-betting-mediumBlue'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                {jobType === 'odds' && (
                  <span className="font-medium">
                    {item.horse_name || `Horse #${item.horse_number}`} - {item.win_odds}
                  </span>
                )}
                
                {jobType === 'will_pays' && (
                  <span className="font-medium">
                    {item.wager_type} - {item.combination} - ${item.payout?.toFixed(2) || 'Carryover'}
                  </span>
                )}
                
                {jobType === 'results' && (
                  <span className="font-medium">
                    Race {item.race_number} Results
                  </span>
                )}
              </div>
              
              <Badge variant="outline" className="text-xs">
                {item.scraped_at ? format(new Date(item.scraped_at), 'HH:mm:ss') : 'Now'}
              </Badge>
            </div>
            
            <div className="text-xs text-gray-400">
              <span className="inline-block mr-4">Race: {item.race_number}</span>
              <span>{item.track_name}</span>
            </div>
            
            {index === 0 && (
              <div className="mt-2 text-xs text-betting-skyBlue">
                <FileText className="h-3 w-3 inline mr-1" />
                Latest data received
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="border-betting-mediumBlue bg-betting-darkCard">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Database className="h-4 w-4 mr-2" />
          Live Data Stream
          {isLoading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
        </CardTitle>
        <div className="text-sm text-gray-400">
          {trackName ? `Track: ${trackName}` : 'All Tracks'} • 
          {jobType ? ` Type: ${jobType}` : ' All Types'} •
          {' '}{streamData.length} records
        </div>
      </CardHeader>
      <CardContent>
        {getStreamContent()}
      </CardContent>
    </Card>
  );
};

export default LiveDataStream;
