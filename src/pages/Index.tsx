
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
import { getMockData, updateOdds, Horse } from '../utils/mockData';

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
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Trackside Odds Pulse
            </h1>
            <p className="text-gray-400">
              Live race track odds and pool movement dashboard
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-600">
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
        
        {/* Full width Sharp Bettor Timeline */}
        <div className="grid grid-cols-1 gap-4 mb-4">
          <SharpBettorTimeline bettingData={data.bettingTimeline} />
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SharpMovement movements={data.sharpMovements} />
          <div className="grid grid-cols-1 gap-4">
            <PaceAnalysis paceData={data.paceData} />
            <TrainingFigures figures={data.trainingFigures} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
