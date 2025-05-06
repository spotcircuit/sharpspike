
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { RefreshCw, ChevronRight, BarChart2, Zap, Clock } from 'lucide-react';
import { OddsData, ExoticWillPay, TRACK_OPTIONS } from '@/types/ScraperTypes';
import { RaceResult } from '@/types/RaceResultTypes';

const ScraperDataDashboard = () => {
  const [selectedTrack, setSelectedTrack] = useState<string>('');
  const [selectedRace, setSelectedRace] = useState<number | null>(null);
  const [races, setRaces] = useState<number[]>([]);
  const [oddsData, setOddsData] = useState<OddsData[]>([]);
  const [willPays, setWillPays] = useState<ExoticWillPay[]>([]);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load tracks on mount
  useEffect(() => {
    if (selectedTrack && !selectedRace) {
      loadRaces(selectedTrack);
    }
  }, [selectedTrack]);

  // Load data when track and race are selected
  useEffect(() => {
    if (selectedTrack && selectedRace) {
      loadData(selectedTrack, selectedRace);
    }
  }, [selectedTrack, selectedRace]);

  // Load available races for a track
  const loadRaces = async (trackName: string) => {
    setIsLoading(true);
    try {
      // Get race numbers from odds_data table - using .select().in() instead of .distinct()
      const { data: oddsData, error: oddsError } = await supabase
        .from('odds_data')
        .select('race_number')
        .eq('track_name', trackName)
        .order('race_number');
      
      if (oddsError) throw oddsError;
      
      // Create a Set to get unique race numbers
      const uniqueRaceNumbers = new Set(oddsData.map(r => r.race_number));
      
      // Also check race_results table
      const { data: resultData, error: resultsError } = await supabase
        .from('race_results')
        .select('race_number')
        .eq('track_name', trackName)
        .order('race_number');
      
      if (resultsError) throw resultsError;
      
      // Add race numbers from results to the Set
      resultData.forEach(r => uniqueRaceNumbers.add(r.race_number));
      
      // Convert Set to array and sort
      const raceNumbers = Array.from(uniqueRaceNumbers).sort((a, b) => a - b);
      
      setRaces(raceNumbers);
      
      // Select the first race if we have races and none is selected
      if (raceNumbers.length > 0 && !selectedRace) {
        setSelectedRace(raceNumbers[0]);
      }
    } catch (error) {
      console.error('Error loading races:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load all data for a selected track and race
  const loadData = async (trackName: string, raceNumber: number) => {
    setIsLoading(true);
    try {
      // Get today's date as a string in ISO format (YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0];
      
      // We'll load all three data types in parallel
      const [oddsResponse, willPaysResponse, resultsResponse] = await Promise.all([
        // Load latest odds data
        supabase
          .from('odds_data')
          .select('*')
          .eq('track_name', trackName)
          .eq('race_number', raceNumber)
          .order('scraped_at', { ascending: false })
          .limit(20),
        
        // Load exotic will pays
        supabase
          .from('exotic_will_pays')
          .select('*')
          .eq('track_name', trackName)
          .eq('race_number', raceNumber)
          .order('scraped_at', { ascending: false }),
        
        // Load race results
        supabase
          .from('race_results')
          .select('*')
          .eq('track_name', trackName)
          .eq('race_number', raceNumber)
          .order('created_at', { ascending: false })
          .limit(1)
      ]);
      
      // Handle errors
      if (oddsResponse.error) throw oddsResponse.error;
      if (willPaysResponse.error) throw willPaysResponse.error;
      if (resultsResponse.error) throw resultsResponse.error;
      
      // Update state with fetched data
      setOddsData(oddsResponse.data as OddsData[]);
      setWillPays(willPaysResponse.data as ExoticWillPay[]);
      setResults(resultsResponse.data as RaceResult[]);
      
      // Set the last update time
      if (oddsResponse.data && oddsResponse.data.length > 0) {
        setLastUpdateTime(oddsResponse.data[0].scraped_at);
      } else if (willPaysResponse.data && willPaysResponse.data.length > 0) {
        setLastUpdateTime(willPaysResponse.data[0].scraped_at);
      } else if (resultsResponse.data && resultsResponse.data.length > 0) {
        setLastUpdateTime(resultsResponse.data[0].created_at);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render odds data
  const renderOddsData = () => {
    if (oddsData.length === 0) {
      return (
        <div className="text-center py-6 text-gray-400">
          No odds data available for this race
        </div>
      );
    }
    
    // Group by horse (showing only latest odds for each)
    const latestOddsByHorse: Record<string, OddsData> = {};
    
    oddsData.forEach(data => {
      const key = `${data.horse_number}-${data.horse_name}`;
      if (!latestOddsByHorse[key] || new Date(data.scraped_at) > new Date(latestOddsByHorse[key].scraped_at)) {
        latestOddsByHorse[key] = data;
      }
    });
    
    const latestOdds = Object.values(latestOddsByHorse)
      .sort((a, b) => a.horse_number - b.horse_number);
    
    return (
      <div className="rounded-md border border-betting-mediumBlue overflow-hidden">
        <Table>
          <TableHeader className="bg-betting-darkPurple">
            <TableRow>
              <TableHead className="text-white w-16">#</TableHead>
              <TableHead className="text-white">Horse</TableHead>
              <TableHead className="text-white">Odds</TableHead>
              <TableHead className="text-white">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {latestOdds.map(horse => (
              <TableRow key={`${horse.horse_number}-${horse.horse_name}`} className="hover:bg-betting-darkPurple/20">
                <TableCell className="font-medium">{horse.horse_number}</TableCell>
                <TableCell>{horse.horse_name}</TableCell>
                <TableCell className="font-bold">{horse.win_odds}</TableCell>
                <TableCell className="text-sm text-gray-400">
                  {format(parseISO(horse.scraped_at), 'HH:mm:ss')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  // Render will pays data
  const renderWillPays = () => {
    if (willPays.length === 0) {
      return (
        <div className="text-center py-6 text-gray-400">
          No will pays data available for this race
        </div>
      );
    }
    
    // Group by wager type
    const willPaysByType: Record<string, ExoticWillPay[]> = {};
    
    willPays.forEach(will => {
      if (!willPaysByType[will.wager_type]) {
        willPaysByType[will.wager_type] = [];
      }
      willPaysByType[will.wager_type].push(will);
    });
    
    return (
      <div className="space-y-4">
        {Object.entries(willPaysByType).map(([wagerType, pays]) => (
          <Card key={wagerType} className="bg-betting-darkCard border-betting-mediumBlue">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{wagerType}</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-betting-darkPurple">
                    <TableRow>
                      <TableHead className="text-white">Combination</TableHead>
                      <TableHead className="text-white">Payout</TableHead>
                      <TableHead className="text-white">Carryover</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pays.map((pay) => (
                      <TableRow key={pay.id} className="hover:bg-betting-darkPurple/20">
                        <TableCell className="font-medium">{pay.combination}</TableCell>
                        <TableCell className="font-bold">
                          {pay.payout ? `$${pay.payout.toFixed(2)}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {pay.is_carryover ? (
                            <span className="text-green-500">
                              {pay.carryover_amount ? `$${pay.carryover_amount.toFixed(2)}` : 'Yes'}
                            </span>
                          ) : 'No'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Render race results
  const renderResults = () => {
    if (results.length === 0) {
      return (
        <div className="text-center py-6 text-gray-400">
          No results available for this race
        </div>
      );
    }
    
    const result = results[0];
    const finishOrder = result.results_data?.finishOrder || [];
    const payouts = result.results_data?.payouts || {};
    
    return (
      <div className="space-y-6">
        <Card className="bg-betting-darkCard border-betting-mediumBlue">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Final Order of Finish</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-betting-darkPurple">
                  <TableRow>
                    <TableHead className="text-white w-16">Pos</TableHead>
                    <TableHead className="text-white">Horse</TableHead>
                    <TableHead className="text-white">Jockey</TableHead>
                    <TableHead className="text-white">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {finishOrder.length > 0 ? (
                    finishOrder.map((horse: any, index: number) => (
                      <TableRow key={index} className="hover:bg-betting-darkPurple/20">
                        <TableCell className="font-medium">{horse.position}</TableCell>
                        <TableCell>{horse.name}</TableCell>
                        <TableCell>{horse.jockey || 'N/A'}</TableCell>
                        <TableCell>{horse.time || 'N/A'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-400">
                        No finish order data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-betting-darkCard border-betting-mediumBlue">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(payouts).length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(payouts).map(([bet, amount]) => (
                  <div key={bet} className="flex justify-between items-center border-b border-betting-mediumBlue pb-2">
                    <span className="font-medium">{bet}</span>
                    <span className="font-bold text-lg">
                      ${typeof amount === 'number' ? amount.toFixed(2) : String(amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400">
                No payout data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Select
            value={selectedTrack}
            onValueChange={(value) => {
              setSelectedTrack(value);
              setSelectedRace(null);
            }}
          >
            <SelectTrigger className="w-full sm:w-40 bg-betting-dark border-betting-mediumBlue text-white">
              <SelectValue placeholder="Select track" />
            </SelectTrigger>
            <SelectContent className="bg-betting-dark border-betting-mediumBlue text-white">
              {TRACK_OPTIONS.map(track => (
                <SelectItem key={track.value} value={track.value}>
                  {track.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedTrack && (
            <Select
              value={selectedRace?.toString() || ''}
              onValueChange={(value) => setSelectedRace(parseInt(value))}
              disabled={races.length === 0}
            >
              <SelectTrigger className="w-full sm:w-32 bg-betting-dark border-betting-mediumBlue text-white">
                <SelectValue placeholder="Race #" />
              </SelectTrigger>
              <SelectContent className="bg-betting-dark border-betting-mediumBlue text-white">
                {races.map(race => (
                  <SelectItem key={race} value={race.toString()}>
                    Race {race}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {lastUpdateTime && (
            <div className="text-sm text-gray-400 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Last updated: {format(parseISO(lastUpdateTime), 'HH:mm:ss')}
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (selectedTrack && selectedRace) {
                loadData(selectedTrack, selectedRace);
              }
            }}
            disabled={isLoading || !selectedTrack || !selectedRace}
            className="ml-auto"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>
      </div>
      
      {selectedTrack && selectedRace ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-6">
            <Card className="bg-betting-darkCard border-betting-mediumBlue">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-blue-400" />
                    Current Odds
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <RefreshCw className="h-8 w-8 animate-spin opacity-50" />
                  </div>
                ) : (
                  renderOddsData()
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-6 space-y-6">
            <Card className="bg-betting-darkCard border-betting-mediumBlue">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    {results.length > 0 ? 'Race Results' : 'Will Pays'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <RefreshCw className="h-8 w-8 animate-spin opacity-50" />
                  </div>
                ) : (
                  results.length > 0 ? renderResults() : renderWillPays()
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="bg-betting-darkCard border-betting-mediumBlue">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <BarChart2 className="h-16 w-16 text-gray-400 mb-4 opacity-50" />
            <h3 className="text-xl font-medium mb-2">Select a Track and Race</h3>
            <p className="text-gray-400 max-w-lg">
              Choose a track and race number to view real-time odds, will pays for exotic bets, and race results scraped from offtrackbetting.com.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScraperDataDashboard;
