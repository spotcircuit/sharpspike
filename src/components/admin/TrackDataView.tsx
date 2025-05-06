
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { OddsData, ExoticWillPay } from '@/types/ScraperTypes';
import { format, parseISO } from 'date-fns';
import { RaceResult } from '@/types/RaceResultTypes';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TrackDataViewProps {
  trackName: string;
}

const TrackDataView: React.FC<TrackDataViewProps> = ({ trackName }) => {
  const [activeTab, setActiveTab] = useState('odds');
  const [raceNumbers, setRaceNumbers] = useState<number[]>([]);
  const [selectedRace, setSelectedRace] = useState<number | null>(null);
  const [oddsData, setOddsData] = useState<OddsData[]>([]);
  const [willPays, setWillPays] = useState<ExoticWillPay[]>([]);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  
  // Load race numbers when track changes
  useEffect(() => {
    loadRaceNumbers();
  }, [trackName]);
  
  // Load data when race changes
  useEffect(() => {
    if (selectedRace) {
      loadData();
    }
  }, [selectedRace, activeTab]);
  
  const loadRaceNumbers = async () => {
    setIsLoading(true);
    try {
      // Get distinct race numbers for this track from odds data
      const { data: oddsRaces, error: oddsError } = await supabase
        .from('odds_data')
        .select('race_number')
        .eq('track_name', trackName);
      
      if (oddsError) throw oddsError;
      
      // Get race numbers from will pays
      const { data: willPaysRaces, error: willPaysError } = await supabase
        .from('exotic_will_pays')
        .select('race_number')
        .eq('track_name', trackName);
        
      if (willPaysError) throw willPaysError;
      
      // Get race numbers from results
      const { data: resultsRaces, error: resultsError } = await supabase
        .from('race_results')
        .select('race_number')
        .eq('track_name', trackName);
        
      if (resultsError) throw resultsError;
      
      // Combine all race numbers and remove duplicates
      const allRaces = [
        ...oddsRaces.map(r => r.race_number),
        ...willPaysRaces.map(r => r.race_number),
        ...resultsRaces.map(r => r.race_number)
      ];
      
      const uniqueRaces = [...new Set(allRaces)].sort((a, b) => a - b);
      setRaceNumbers(uniqueRaces);
      
      // Select the first race by default
      if (uniqueRaces.length > 0 && !selectedRace) {
        setSelectedRace(uniqueRaces[0]);
      }
    } catch (error) {
      console.error('Error loading race numbers:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadData = async () => {
    if (!selectedRace) return;
    
    setIsLoading(true);
    try {
      // Load the appropriate data based on the active tab
      if (activeTab === 'odds') {
        const { data, error } = await supabase
          .from('odds_data')
          .select('*')
          .eq('track_name', trackName)
          .eq('race_number', selectedRace)
          .order('horse_number', { ascending: true });
          
        if (error) throw error;
        setOddsData(data as OddsData[]);
        
        if (data.length > 0) {
          setLastUpdate(data[0].scraped_at);
        }
      } else if (activeTab === 'willpays') {
        const { data, error } = await supabase
          .from('exotic_will_pays')
          .select('*')
          .eq('track_name', trackName)
          .eq('race_number', selectedRace)
          .order('wager_type', { ascending: true });
          
        if (error) throw error;
        setWillPays(data as ExoticWillPay[]);
        
        if (data.length > 0) {
          setLastUpdate(data[0].scraped_at);
        }
      } else if (activeTab === 'results') {
        const { data, error } = await supabase
          .from('race_results')
          .select('*')
          .eq('track_name', trackName)
          .eq('race_number', selectedRace);
          
        if (error) throw error;
        setResults(data as RaceResult[]);
        
        if (data.length > 0) {
          setLastUpdate(data[0].created_at);
        }
      }
    } catch (error) {
      console.error(`Error loading ${activeTab} data:`, error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Select
            value={selectedRace?.toString() || ''}
            onValueChange={(value) => setSelectedRace(parseInt(value))}
          >
            <SelectTrigger className="w-32 bg-betting-dark border-betting-mediumBlue text-white">
              <SelectValue placeholder="Race #" />
            </SelectTrigger>
            <SelectContent className="bg-betting-dark border-betting-mediumBlue text-white">
              {raceNumbers.map(race => (
                <SelectItem key={race} value={race.toString()}>
                  Race {race}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {lastUpdate && (
            <div className="text-sm text-gray-400 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Last updated: {format(parseISO(lastUpdate), 'MM/dd HH:mm:ss')}
            </div>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={isLoading || !selectedRace}
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-betting-darkPurple">
          <TabsTrigger value="odds">Odds</TabsTrigger>
          <TabsTrigger value="willpays">Will Pays</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="odds" className="border border-betting-mediumBlue rounded-md p-4 mt-4">
          {oddsData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PP</TableHead>
                  <TableHead>Horse</TableHead>
                  <TableHead>Win Odds</TableHead>
                  <TableHead>Scraped At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {oddsData.map((odds) => (
                  <TableRow key={odds.id}>
                    <TableCell>{odds.horse_number}</TableCell>
                    <TableCell>{odds.horse_name}</TableCell>
                    <TableCell>{odds.win_odds}</TableCell>
                    <TableCell>{format(parseISO(odds.scraped_at), 'MM/dd HH:mm:ss')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-gray-400">
              No odds data found for this race
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="willpays" className="border border-betting-mediumBlue rounded-md p-4 mt-4">
          {willPays.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wager Type</TableHead>
                  <TableHead>Combination</TableHead>
                  <TableHead>Payout</TableHead>
                  <TableHead>Carryover</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {willPays.map((wp) => (
                  <TableRow key={wp.id}>
                    <TableCell>{wp.wager_type}</TableCell>
                    <TableCell>{wp.combination}</TableCell>
                    <TableCell>
                      {wp.payout ? `$${wp.payout.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>
                      {wp.is_carryover ? 
                        (wp.carryover_amount ? `$${wp.carryover_amount.toFixed(2)}` : 'Yes') 
                        : 'No'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-gray-400">
              No will pays found for this race
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="results" className="border border-betting-mediumBlue rounded-md p-4 mt-4">
          {results.length > 0 ? (
            <div>
              <h3 className="text-lg font-medium mb-2">Race {selectedRace} Results</h3>
              <pre className="bg-black/30 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(results[0].results_data, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              No results found for this race
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrackDataView;
