
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { OddsData, ExoticWillPay } from "@/types/ScraperTypes";
import { RaceResult } from "@/types/RaceResultTypes";

/**
 * Loads available races for a given track
 */
export const loadRaces = async (trackName: string): Promise<number[]> => {
  try {
    // Get race numbers from odds_data table
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
    return Array.from(uniqueRaceNumbers).sort((a, b) => a - b);
  } catch (error) {
    console.error('Error loading races:', error);
    return [];
  }
};

/**
 * Loads data for a selected track and race
 */
export const loadRaceData = async (
  trackName: string, 
  raceNumber: number
): Promise<{
  oddsData: OddsData[];
  willPays: ExoticWillPay[];
  results: RaceResult[];
  lastUpdateTime: string | null;
}> => {
  try {
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
    
    // Determine last update time
    let lastUpdateTime: string | null = null;
    if (oddsResponse.data && oddsResponse.data.length > 0) {
      lastUpdateTime = oddsResponse.data[0].scraped_at;
    } else if (willPaysResponse.data && willPaysResponse.data.length > 0) {
      lastUpdateTime = willPaysResponse.data[0].scraped_at;
    } else if (resultsResponse.data && resultsResponse.data.length > 0) {
      lastUpdateTime = resultsResponse.data[0].created_at;
    }
    
    return {
      oddsData: oddsResponse.data as OddsData[],
      willPays: willPaysResponse.data as ExoticWillPay[],
      results: resultsResponse.data as RaceResult[],
      lastUpdateTime
    };
  } catch (error) {
    console.error('Error loading data:', error);
    return {
      oddsData: [],
      willPays: [],
      results: [],
      lastUpdateTime: null
    };
  }
};

/**
 * Format timestamp for display
 */
export const formatTime = (timestamp: string): string => {
  try {
    return format(parseISO(timestamp), 'HH:mm:ss');
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid time';
  }
};

/**
 * Helper to format URL for off-track betting
 */
export const formatOTBUrl = (trackName: string, raceNumber?: number): string => {
  // Handle different track formats
  let formattedTrack = trackName;
  let programName = '';
  
  if (trackName.startsWith('NZ-')) {
    // New Zealand tracks have a special format
    const trackPart = trackName.replace('NZ-', '');
    programName = `N12`; // This might need to be determined dynamically
    formattedTrack = `NZ - ${trackPart}`;
  } else {
    // US tracks format
    programName = trackName.toLowerCase().replace(/\s+/g, '-');
  }
  
  // Construct URL with proper parameters
  const baseUrl = 'https://app.offtrackbetting.com/#/lobby/live-racing';
  const today = new Date().toISOString().split('T')[0];
  
  let url = `${baseUrl}?programDate=${today}&programName=${programName}`;
  if (raceNumber) {
    url += `&raceNumber=${raceNumber}`;
  }
  
  return url;
};
