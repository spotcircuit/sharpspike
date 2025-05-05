
import React, { useState } from 'react';
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
import ApiConnectionForm from '../components/ApiConnectionForm';
import { useOddsData } from '../hooks/useOddsData';
import { getMockData } from '../utils/mockData';
import { Link } from 'react-router-dom';

const OddsDashboard = () => {
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [currentTrack, setCurrentTrack] = useState("CHURCHILL DOWNS");
  const [currentRace, setCurrentRace] = useState(7);
  
  // Get additional mock data that isn't part of the odds API
  const mockData = getMockData();
  
  // Use our custom hook to fetch and manage odds data
  const { 
    horses, 
    lastUpdated, 
    isLoading,
    error,
    mtp,
    nextUpdateIn, 
    showUpdateNotification, 
    refreshData 
  } = useOddsData({
    track: currentTrack,
    race: currentRace,
    refreshInterval: 20,
    autoRefresh: isApiConnected,
  });

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
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-white hover:text-blue-300 transition-colors">
              Home
            </Link>
            <h2 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-betting-vividPurple">
              5D Racing Odds Pulse
            </h2>
          </div>
        </header>
        
        {!isApiConnected ? (
          <div className="py-6">
            <ApiConnectionForm onConnect={setIsApiConnected} />
          </div>
        ) : (
          <>
            <RaceNavBar 
              currentTrack={currentTrack}
              currentRace={currentRace}
              mtp={mtp}
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
              <OddsTable horses={horses} highlightUpdates={showUpdateNotification} />
            </div>
            
            {/* Sharp Bettor Timeline with Sharp Movement on the right */}
            <div className="grid grid-cols-5 gap-4 mb-4">
              <div className="col-span-4">
                <SharpBettorTimeline bettingData={mockData.bettingTimeline} />
              </div>
              <div className="col-span-1">
                <SharpMovement movements={mockData.sharpMovements} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <LiveStreamingOdds horses={horses} />
              <PoolsPanel poolData={mockData.poolData} exoticPools={mockData.exoticPools} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <TrackProfile 
                statistics={mockData.trackProfile.statistics} 
                postPositions={mockData.trackProfile.postPositions}
                timings={mockData.trackProfile.timings}
              />
              <HorseComments comments={mockData.horseComments} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <PaceAnalysis paceData={mockData.paceData} />
              <TrainingFigures figures={mockData.trainingFigures} />
            </div>
            
            {/* Live Paddock Comments and AI-Thorian Value at the bottom */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <LivePaddockComments comments={mockData.paddockComments} />
              <AIThorianValue valuePicks={mockData.valuePicks} pick3Combos={mockData.pick3Combos} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OddsDashboard;
