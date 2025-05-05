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
import { getMockData, updateOdds } from '../utils/mockData';

const REFRESH_INTERVAL = 20; // seconds

const Index = () => {
  const [data, setData] = useState(getMockData());
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [nextUpdateIn, setNextUpdateIn] = useState(REFRESH_INTERVAL);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [currentTrack, setCurrentTrack] = useState("CHURCHILL DOWNS");
  const [currentRace, setCurrentRace] = useState(7);
  
  const refreshData = () => {
    // Update horses with new odds
    const updatedHorses = updateOdds([...data.horses]);
    
    setData({
      ...data,
      horses: updatedHorses
    });
    
    setLastUpdated(new Date().toLocaleTimeString());
    setNextUpdateIn(REFRESH_INTERVAL);
    
    // Show notification
    setShowUpdateNotification(true);
    setTimeout(() => setShowUpdateNotification(false), 3000);
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
  }, [data]);

  // Effect to check for updated mock data
  useEffect(() => {
    const checkForUpdates = () => {
      const latestData = getMockData();
      if (latestData.lastUpdated !== data.lastUpdated) {
        setData(latestData);
        setLastUpdated(latestData.lastUpdated);
        setShowUpdateNotification(true);
        setTimeout(() => setShowUpdateNotification(false), 3000);
      }
    };
    
    // Check for updates every 5 seconds
    const updateChecker = setInterval(checkForUpdates, 5000);
    return () => clearInterval(updateChecker);
  }, [data.lastUpdated]);

  const handleTrackChange = (track: string) => {
    setCurrentTrack(track);
    // In a real app, you would fetch data for this track
  };

  const handleRaceChange = (race: number) => {
    setCurrentRace(race);
    // In a real app, you would fetch data for this race
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
          <OddsTable horses={data.horses} highlightUpdates={showUpdateNotification} />
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
