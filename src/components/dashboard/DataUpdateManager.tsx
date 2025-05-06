
import React, { useState, useEffect } from 'react';
import { Horse } from '../../utils/types';
import { getMockData, updateOdds } from '../../utils/mockData';
import { supabase } from '@/integrations/supabase/client';

interface DataUpdateManagerProps {
  currentTrack: string;
  currentRace: number;
  onDataUpdate: (data: any, lastUpdated: string) => void;
}

const REFRESH_INTERVAL = 20; // seconds

const DataUpdateManager: React.FC<DataUpdateManagerProps> = ({ 
  currentTrack, 
  currentRace,
  onDataUpdate 
}) => {
  const [nextUpdateIn, setNextUpdateIn] = useState(REFRESH_INTERVAL);
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = async () => {
    // First try to get real data from Supabase
    setIsLoading(true);
    try {
      const { data: oddsData, error } = await supabase
        .from('odds_data')
        .select('*')
        .eq('track_name', currentTrack)
        .eq('race_number', currentRace)
        .order('scraped_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (oddsData && oddsData.length > 0) {
        // Transform Supabase odds data to match the format expected by the app
        const horseMap = new Map<number, any>();
        
        // Get the latest data for each horse
        oddsData.forEach(record => {
          if (!horseMap.has(record.horse_number) || 
              new Date(record.scraped_at) > new Date(horseMap.get(record.horse_number).scraped_at)) {
            horseMap.set(record.horse_number, record);
          }
        });
        
        // Convert to the Horse format used by the app
        const horses: Horse[] = Array.from(horseMap.values()).map(record => {
          // Parse odds (format like "2/1" to numeric 2.0)
          let liveOdds = 0;
          if (record.win_odds) {
            const oddsParts = record.win_odds.split('/');
            if (oddsParts.length === 2) {
              liveOdds = parseFloat(oddsParts[0]) / parseFloat(oddsParts[1]);
            } else {
              liveOdds = parseFloat(record.win_odds) || 0;
            }
          }
          
          // Create a horse object from the DB record
          return {
            id: record.id,
            name: record.horse_name,
            pp: record.horse_number,
            liveOdds: liveOdds,
            mlOdds: 0, // We don't have this in our DB yet
            modelOdds: liveOdds * 1.1, // Just a mock calculation
            difference: 0, // Will calculate below
            jockey: record.pool_data?.jockey || 'Unknown',
            trainer: record.pool_data?.trainer || 'Unknown',
            jockeyWinPct: Math.floor(Math.random() * 30) + 10, // Mock data
            trainerWinPct: Math.floor(Math.random() * 30) + 10, // Mock data
            weight: 120,
            isFavorite: false, // Will set below
            irregularBetting: Math.random() > 0.8, // Random for now
            hFactors: {
              speed: Math.random() > 0.5,
              pace: Math.random() > 0.5,
              form: Math.random() > 0.5,
              class: Math.random() > 0.5
            }
          };
        });
        
        // Find the favorite (lowest odds)
        if (horses.length > 0) {
          const favoriteHorse = horses.reduce((prev, current) => 
            (prev.liveOdds < current.liveOdds) ? prev : current);
          favoriteHorse.isFavorite = true;
          
          // Calculate difference for all horses
          horses.forEach(horse => {
            horse.difference = horse.liveOdds - horse.modelOdds;
          });
          
          // Get current data and update horses
          const currentData = getMockData();
          currentData.horses = horses;
          
          // Update with real data
          onDataUpdate(currentData, new Date().toLocaleTimeString());
        }
      } else {
        // If no real data, fall back to mock data
        const currentData = getMockData();
        const updatedHorses = updateOdds([...currentData.horses]);
        currentData.horses = updatedHorses;
        
        onDataUpdate(currentData, new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Error fetching odds data:", error);
      // Fall back to mock data on error
      const currentData = getMockData();
      const updatedHorses = updateOdds([...currentData.horses]);
      currentData.horses = updatedHorses;
      
      onDataUpdate(currentData, new Date().toLocaleTimeString());
    } finally {
      setIsLoading(false);
      setNextUpdateIn(REFRESH_INTERVAL);
    }
  };

  useEffect(() => {
    // Update countdown timer
    const timer = setInterval(() => {
      setNextUpdateIn((prev) => {
        if (prev <= 1) {
          refreshData();
          return REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentTrack, currentRace]);

  // Effect to fetch data when track or race changes
  useEffect(() => {
    refreshData();
  }, [currentTrack, currentRace]);

  return { nextUpdateIn, isLoading, refreshData };
};

export default DataUpdateManager;
