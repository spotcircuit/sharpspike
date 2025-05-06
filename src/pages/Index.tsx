
import React, { useState, useEffect } from 'react';
import OddsTable from '../components/OddsTable';
import LiveStreamingOdds from '../components/LiveStreamingOdds';
import PoolsPanel from '../components/PoolsPanel';
import PaceAnalysis from '../components/PaceAnalysis';
import SharpMovement from '../components/SharpMovement';
import SharpBettorTimeline from '../components/SharpBettorTimeline';
import TrainingFigures from '../components/TrainingFigures';
import StatusBar from '../components/StatusBar';
import TrackProfile from '../components/TrackProfile';
import HorseComments from '../components/HorseComments';
import RaceNavBar from '../components/RaceNavBar';
import LivePaddockComments from '../components/LivePaddockComments';
import AIThorianValue from '../components/AIThorianValue';
import AdminLink from '../components/AdminLink';
import UserProfile from '../components/UserProfile';
import { Horse } from '../utils/types';
import { getMockData, updateOdds } from '../utils/mockData';
import { supabase } from '@/integrations/supabase/client';

const REFRESH_INTERVAL = 20; // seconds

const Index = () => {
  const [data, setData] = useState(getMockData());
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [nextUpdateIn, setNextUpdateIn] = useState(REFRESH_INTERVAL);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [currentTrack, setCurrentTrack] = useState("CHURCHILL DOWNS");
  const [currentRace, setCurrentRace] = useState(7);
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
          
          // Update the data state with real odds
          setData({
            ...data,
            horses: horses
          });
          
          setLastUpdated(new Date().toLocaleTimeString());
          setShowUpdateNotification(true);
          setTimeout(() => setShowUpdateNotification(false), 3000);
        }
      } else {
        // If no real data, fall back to mock data
        const updatedHorses = updateOdds([...data.horses]);
        setData({
          ...data,
          horses: updatedHorses
        });
      }
    } catch (error) {
      console.error("Error fetching odds data:", error);
      // Fall back to mock data on error
      const updatedHorses = updateOdds([...data.horses]);
      setData({
        ...data,
        horses: updatedHorses
      });
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
  }, [data, currentTrack, currentRace]);

  // Effect to fetch data when track or race changes
  useEffect(() => {
    refreshData();
  }, [currentTrack, currentRace]);

  const handleTrackChange = (track: string) => {
    setCurrentTrack(track);
  };

  const handleRaceChange = (race: number) => {
    setCurrentRace(race);
  };

  return (
    <div className="min-h-screen bg-gradient-radial from-betting-dark to-black p-4 text-white">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex justify-between items-center p-4 bg-betting-darkPurple border-4 border-betting-secondaryPurple rounded-lg shadow-lg">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-600">
              Trackside Odds Pulse
            </h1>
            <p className="text-gray-400">
              Live race track odds and pool movement dashboard
            </p>
          </div>
          <div className="flex items-center gap-4">
            <UserProfile />
            <h2 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-betting-vividPurple">
              5D Racing Odds Pulse
            </h2>
          </div>
        </header>
        
        <RaceNavBar 
          currentTrack={currentTrack}
          currentRace={currentRace}
          mtp={21}
          allowanceInfo={{
            purse: "$127K",
            age: "3YO+",
            distance: "6F",
            surface: "Fast"
          }}
          onTrackChange={handleTrackChange}
          onRaceChange={handleRaceChange}
        />
        
        <div className="mb-4">
          <StatusBar 
            lastUpdated={lastUpdated} 
            onRefresh={refreshData}
            nextUpdateIn={nextUpdateIn}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 mb-4">
          <OddsTable 
            horses={data.horses} 
            highlightUpdates={showUpdateNotification} 
            isLoading={isLoading}
          />
        </div>
        
        {/* Sharp Bettor Timeline with Sharp Movement on the right */}
        <div className="grid grid-cols-5 gap-4 mb-4">
          <div className="col-span-4">
            <SharpBettorTimeline bettingData={data.bettingTimeline} />
          </div>
          <div className="col-span-1">
            <SharpMovement movements={data.sharpMovements} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <LiveStreamingOdds horses={data.horses} />
          <PoolsPanel poolData={data.poolData} exoticPools={data.exoticPools} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <TrackProfile 
            statistics={data.trackProfile.statistics} 
            postPositions={data.trackProfile.postPositions}
            timings={data.trackProfile.timings}
          />
          <HorseComments comments={data.horseComments} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <PaceAnalysis paceData={data.paceData} />
          <TrainingFigures figures={data.trainingFigures} />
        </div>
        
        {/* Live Paddock Comments and AI-Thorian Value at the bottom */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <LivePaddockComments comments={data.paddockComments} />
          <AIThorianValue valuePicks={data.valuePicks} pick3Combos={data.pick3Combos} />
        </div>
      </div>
      
      {/* Add admin link */}
      <AdminLink />
    </div>
  );
};

export default Index;
