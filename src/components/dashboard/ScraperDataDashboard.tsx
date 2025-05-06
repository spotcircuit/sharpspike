
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { OddsData, ExoticWillPay } from '@/types/ScraperTypes';
import { RaceResult } from '@/types/RaceResultTypes';
import { loadRaces, loadRaceData } from './utils/scraper-utils';
import EmptyStatePrompt from './EmptyStatePrompt';
import { toast } from '@/components/ui/sonner';
import ActiveScrapeJobsList from './ActiveScrapeJobsList';
import ScraperStatusMonitor from './ScraperStatusMonitor';
import { supabase } from '@/integrations/supabase/client';
import DashboardHeader from './DashboardHeader';
import NoRacesAlert from './NoRacesAlert';
import DataDisplaySection from './DataDisplaySection';

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
        toast(`No races available for ${trackName}. Data may still be loading.`);
      }
    } catch (error) {
      console.error('Error loading races:', error);
      toast.error("Failed to load races");
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
      toast.error("Failed to load race data");
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
      <DashboardHeader
        selectedTrack={selectedTrack}
        selectedRace={selectedRace}
        races={races}
        onTrackChange={handleTrackChange}
        onRaceChange={handleRaceChange}
        isLoading={isLoading}
        lastUpdateTime={lastUpdateTime}
        onRefresh={handleRefresh}
        jobsCount={jobsCount}
        showActiveJobs={showActiveJobs}
        showDatabaseMonitor={showDatabaseMonitor}
        toggleActiveJobs={toggleActiveJobs}
        toggleDatabaseMonitor={toggleDatabaseMonitor}
      />
      
      {showDatabaseMonitor && (
        <ScraperStatusMonitor />
      )}
      
      {showActiveJobs && (
        <ActiveScrapeJobsList />
      )}
      
      <NoRacesAlert selectedTrack={selectedTrack} races={races} />
      
      {selectedTrack && selectedRace !== null ? (
        <DataDisplaySection
          selectedTrack={selectedTrack}
          selectedRace={selectedRace}
          oddsData={oddsData}
          willPays={willPays}
          results={results}
          isLoading={isLoading}
        />
      ) : (
        <EmptyStatePrompt />
      )}
    </div>
  );
};

export default ScraperDataDashboard;
