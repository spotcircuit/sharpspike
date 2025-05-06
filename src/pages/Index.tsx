
import React, { useState } from 'react';
import { getMockData } from '../utils/mockData';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DataUpdateManager from '../components/dashboard/DataUpdateManager';
import DashboardContent from '../components/dashboard/DashboardContent';

const Index = () => {
  const [data, setData] = useState(getMockData());
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [currentTrack, setCurrentTrack] = useState("CHURCHILL DOWNS");
  const [currentRace, setCurrentRace] = useState(7);
  
  // Use our custom hook for data updates
  const { nextUpdateIn, isLoading, refreshData } = DataUpdateManager({
    currentTrack,
    currentRace,
    onDataUpdate: (updatedData, updatedTime) => {
      setData(updatedData);
      setLastUpdated(updatedTime);
      setShowUpdateNotification(true);
      setTimeout(() => setShowUpdateNotification(false), 3000);
    }
  });

  const handleTrackChange = (track: string) => {
    setCurrentTrack(track);
  };

  const handleRaceChange = (race: number) => {
    setCurrentRace(race);
  };

  return (
    <DashboardLayout 
      title="5D ODDS PULSE"
      subtitle="Live race track odds and pool movement dashboard"
    >
      <DashboardContent 
        data={data}
        currentTrack={currentTrack}
        currentRace={currentRace}
        lastUpdated={lastUpdated}
        nextUpdateIn={nextUpdateIn}
        showUpdateNotification={showUpdateNotification}
        isLoading={isLoading}
        onRefreshData={refreshData}
        onTrackChange={handleTrackChange}
        onRaceChange={handleRaceChange}
      />
    </DashboardLayout>
  );
};

export default Index;
