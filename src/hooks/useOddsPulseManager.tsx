
import { useState, useEffect, useCallback } from 'react';
import { OddsPulseData } from '@/types/RaceResultTypes';
import { processOddsData, getOddsPulseConfig } from '@/utils/oddsPulseUtils';
import { supabase } from "@/integrations/supabase/client";

// Simulated API call that would be replaced with a real fetch to the Odds Pulse API
const mockFetchOddsData = async (trackName: string, raceNumber: number): Promise<OddsPulseData | null> => {
  // This is a placeholder - in production, we would call the actual API
  // For now, we'll generate mock data that matches the expected format
  return {
    timestamp: new Date().toISOString(),
    source: "offtrackbetting",
    track_id: trackName,
    race_number: raceNumber,
    odds_data: [
      {
        horse_id: "1",
        horse_name: "Fast Lightning",
        program_number: "1",
        current_odds: 6.5,
        morning_line: 5.0
      },
      {
        horse_id: "2",
        horse_name: "Lucky Star",
        program_number: "2",
        current_odds: 9.2,
        morning_line: 8.0
      },
      // Additional horses would be here in a real response
    ]
  };
};

interface UseOddsPulseManagerProps {
  trackName: string;
  raceNumber: number;
  enabled?: boolean;
}

const useOddsPulseManager = ({
  trackName,
  raceNumber,
  enabled: explicitEnabled
}: UseOddsPulseManagerProps) => {
  const [isPolling, setIsPolling] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Get configuration from localStorage or use defaults
  const { enabled: configEnabled, pollingInterval } = getOddsPulseConfig();
  
  // Use explicit enabled prop if provided, otherwise use config value
  const isEnabled = explicitEnabled !== undefined ? explicitEnabled : configEnabled;

  const fetchAndProcessOdds = useCallback(async () => {
    if (!trackName || !raceNumber || !isEnabled) return;
    
    try {
      // In production, fetch from the real API
      const oddsData = await mockFetchOddsData(trackName, raceNumber);
      
      if (!oddsData) {
        throw new Error("Failed to fetch odds data");
      }
      
      // Process and store the odds data
      const success = await processOddsData(oddsData);
      
      if (success) {
        setLastUpdate(new Date().toISOString());
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching odds data:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, [trackName, raceNumber, isEnabled]);

  // Set up polling interval
  useEffect(() => {
    if (!isEnabled || !trackName || !raceNumber) {
      setIsPolling(false);
      return;
    }
    
    setIsPolling(true);
    const intervalId = setInterval(fetchAndProcessOdds, pollingInterval * 1000);
    
    // Initial fetch
    fetchAndProcessOdds();
    
    return () => {
      clearInterval(intervalId);
      setIsPolling(false);
    };
  }, [fetchAndProcessOdds, isEnabled, pollingInterval, trackName, raceNumber]);

  // Provide a way to manually trigger an update
  const forceUpdate = () => {
    if (isEnabled) {
      fetchAndProcessOdds();
    }
  };

  return {
    isPolling,
    lastUpdate,
    error,
    forceUpdate
  };
};

export default useOddsPulseManager;
