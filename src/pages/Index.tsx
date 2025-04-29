
import React, { useState, useEffect } from 'react';
import OddsTable from '../components/OddsTable';
import LiveStreamingOdds from '../components/LiveStreamingOdds';
import PoolsPanel from '../components/PoolsPanel';
import PaceAnalysis from '../components/PaceAnalysis';
import SharpMovement from '../components/SharpMovement';
import StatusBar from '../components/StatusBar';
import { getMockData, updateOdds, Horse } from '../utils/mockData';

const REFRESH_INTERVAL = 20; // seconds

const Index = () => {
  const [data, setData] = useState(getMockData());
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [nextUpdateIn, setNextUpdateIn] = useState(REFRESH_INTERVAL);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  
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

  return (
    <div className="min-h-screen bg-gradient-radial from-betting-dark to-black p-4 text-white">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Trackside Odds Pulse
          </h1>
          <p className="text-gray-400">
            Live race track odds and pool movement dashboard
          </p>
        </header>
        
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <LiveStreamingOdds horses={data.horses} />
          <PoolsPanel poolData={data.poolData} exoticPools={data.exoticPools} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PaceAnalysis paceData={data.paceData} />
          <SharpMovement movements={data.sharpMovements} />
        </div>
      </div>
    </div>
  );
};

export default Index;
