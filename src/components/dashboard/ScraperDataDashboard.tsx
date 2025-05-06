
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw, BarChart2, Zap, AlertCircle, Loader2 } from 'lucide-react';
import { OddsData, ExoticWillPay } from '@/types/ScraperTypes';
import { RaceResult } from '@/types/RaceResultTypes';
import { loadRaces, loadRaceData, formatTime } from './utils/scraper-utils';
import OddsDisplay from './OddsDisplay';
import WillPaysDisplay from './WillPaysDisplay';
import ResultsDisplay from './ResultsDisplay';
import TrackSelector from './TrackSelector';
import EmptyStatePrompt from './EmptyStatePrompt';
import { toast } from '@/components/ui/sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ActiveScrapeJobsList from './ActiveScrapeJobsList';
import ScraperStatusMonitor from './ScraperStatusMonitor';
import { supabase } from '@/integrations/supabase/client';

const ScraperDataDashboard = () => {
  const [selectedTrack, setSelectedTrack] = useState<string>('');
  const [selectedRace, setSelectedRace] = useState<number | null>(null);
  const [races, setRaces] = useState<number[]>([]);
  const [oddsData, setOddsData] = useState<OddsData[]>([]);
  const [willPays, setWillPays] = useState<ExoticWillPay[]>([]);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showActiveJobs, setShowActiveJobs] = useState(false);
  const [showDatabaseMonitor, setShowDatabaseMonitor] = useState(false);
  const [jobsCount, setJobsCount] = useState(0);
  const [isRefreshingJobs, setIsRefreshingJobs] = useState(false);

  // Check active jobs count
  useEffect(() => {
    const fetchActiveJobsCount = async () => {
      const { count, error } = await supabase
        .from('scrape_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      if (!error && count !== null) {
        setJobsCount(count);
      }
    };
    
    fetchActiveJobsCount();
  }, []);

  // Load races when track changes
  useEffect(() => {
    if (selectedTrack) {
      handleLoadRaces(selectedTrack);
    }
  }, [selectedTrack]);

  // Load data when track and race are selected
  useEffect(() => {
    if (selectedTrack && selectedRace !== null) {
      handleLoadData(selectedTrack, selectedRace);
    }
  }, [selectedTrack, selectedRace]);

  // Handler for loading races
  const handleLoadRaces = async (trackName: string) => {
    setIsLoading(true);
    setRaces([]);
    setSelectedRace(null);
    
    try {
      const raceNumbers = await loadRaces(trackName);
      setRaces(raceNumbers);
      
      // Select the first race if we have races and none is selected
      if (raceNumbers.length > 0) {
        setSelectedRace(raceNumbers[0]);
      } else {
        setSelectedRace(null);
        toast({
          title: "No races found",
          description: `No races available for ${trackName}. Data may still be loading.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error loading races:', error);
      toast({
        title: "Error",
        description: "Failed to load races",
        variant: "destructive",
      });
      setSelectedRace(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for loading race data
  const handleLoadData = async (trackName: string, raceNumber: number) => {
    setIsLoading(true);
    try {
      const { oddsData, willPays, results, lastUpdateTime } = await loadRaceData(trackName, raceNumber);
      
      setOddsData(oddsData);
      setWillPays(willPays);
      setResults(results);
      setLastUpdateTime(lastUpdateTime);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load race data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for track change
  const handleTrackChange = (track: string) => {
    if (track !== selectedTrack) {
      setSelectedTrack(track);
      setSelectedRace(null);
      setOddsData([]);
      setWillPays([]);
      setResults([]);
    }
  };

  // Handler for race change
  const handleRaceChange = (race: number) => {
    if (race !== selectedRace) {
      setSelectedRace(race);
    }
  };

  // Handler for refresh button
  const handleRefresh = () => {
    if (selectedTrack && selectedRace !== null) {
      handleLoadData(selectedTrack, selectedRace);
    }
  };

  // Function to manually trigger scrape jobs
  const triggerScrapeJobs = async () => {
    setIsRefreshingJobs(true);
    try {
      // Call the edge function to execute jobs
      const { data, error } = await supabase.functions.invoke('run-scrape-jobs', {
        body: { force: true }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Scrape jobs triggered successfully",
        variant: "default",
      });
      
      // Wait a bit and then refresh the race data
      setTimeout(() => {
        if (selectedTrack) {
          handleLoadRaces(selectedTrack);
        }
      }, 5000); // Give time for the scrape to complete
      
    } catch (error) {
      console.error('Error triggering scrape jobs:', error);
      toast({
        title: "Error",
        description: "Failed to trigger scrape jobs",
        variant: "destructive",
      });
    } finally {
      setIsRefreshingJobs(false);
    }
  };

  // Toggle active jobs list
  const toggleActiveJobs = () => {
    setShowActiveJobs(!showActiveJobs);
    
    // Close database monitor if opening jobs list
    if (!showActiveJobs) {
      setShowDatabaseMonitor(false);
    }
  };
  
  // Toggle database monitor
  const toggleDatabaseMonitor = () => {
    setShowDatabaseMonitor(!showDatabaseMonitor);
    
    // Close jobs list if opening database monitor
    if (!showDatabaseMonitor) {
      setShowActiveJobs(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <TrackSelector
          selectedTrack={selectedTrack}
          selectedRace={selectedRace}
          races={races}
          onTrackChange={handleTrackChange}
          onRaceChange={handleRaceChange}
          isLoading={isLoading}
        />
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {lastUpdateTime && (
            <div className="text-sm text-gray-400 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Last updated: {formatTime(lastUpdateTime)}
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || !selectedTrack || selectedRace === null}
            className="ml-auto"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">Refresh</span>
          </Button>
          
          <Button
            variant={showActiveJobs ? "default" : "outline"}
            size="sm"
            onClick={toggleActiveJobs}
            className="ml-2"
          >
            <span>Active Jobs ({jobsCount})</span>
          </Button>
          
          <Button
            variant={showDatabaseMonitor ? "default" : "outline"}
            size="sm"
            onClick={toggleDatabaseMonitor}
            className="ml-2"
          >
            <Database className="h-4 w-4 mr-2" />
            <span>DB Monitor</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={triggerScrapeJobs}
            disabled={isRefreshingJobs}
            className="ml-2"
          >
            {isRefreshingJobs ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            <span>Run All Jobs</span>
          </Button>
        </div>
      </div>
      
      {showDatabaseMonitor && (
        <ScraperStatusMonitor />
      )}
      
      {showActiveJobs && (
        <Card className="bg-betting-darkCard border-betting-mediumBlue mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              Active Scrape Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActiveScrapeJobsList />
          </CardContent>
        </Card>
      )}
      
      {races.length === 0 && selectedTrack && (
        <Alert variant="default" className="bg-betting-darkCard border-yellow-600">
          <AlertCircle className="h-4 w-4 text-yellow-400" />
          <AlertDescription>
            No races found for {selectedTrack}. There may be a scrape job running to fetch this data.
            Click the "Active Jobs" button to check the status of running jobs, or click "Run All Jobs" to trigger the scraper.
            You can also check the "DB Monitor" to see if any data is being added to the database.
          </AlertDescription>
        </Alert>
      )}
      
      {selectedTrack && selectedRace !== null ? (
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
                <OddsDisplay 
                  oddsData={oddsData} 
                  isLoading={isLoading} 
                />
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
                {results.length > 0 ? (
                  <ResultsDisplay 
                    results={results} 
                    isLoading={isLoading} 
                  />
                ) : (
                  <WillPaysDisplay 
                    willPays={willPays} 
                    isLoading={isLoading} 
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <EmptyStatePrompt />
      )}
    </div>
  );
};

export default ScraperDataDashboard;
