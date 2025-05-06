
import React from 'react';
import TrackSelector from './TrackSelector';
import LastUpdateInfo from './LastUpdateInfo';
import ScraperControls from './ScraperControls';

interface DashboardHeaderProps {
  selectedTrack: string;
  selectedRace: number | null;
  races: number[];
  onTrackChange: (track: string) => void;
  onRaceChange: (race: number) => void;
  isLoading: boolean;
  lastUpdateTime: string | null;
  onRefresh: () => void;
  jobsCount: number;
  showActiveJobs: boolean;
  showDatabaseMonitor: boolean;
  toggleActiveJobs: () => void;
  toggleDatabaseMonitor: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  selectedTrack,
  selectedRace,
  races,
  onTrackChange,
  onRaceChange,
  isLoading,
  lastUpdateTime,
  onRefresh,
  jobsCount,
  showActiveJobs,
  showDatabaseMonitor,
  toggleActiveJobs,
  toggleDatabaseMonitor
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
      <TrackSelector
        selectedTrack={selectedTrack}
        selectedRace={selectedRace}
        races={races}
        onTrackChange={onTrackChange}
        onRaceChange={onRaceChange}
        isLoading={isLoading}
      />
      
      <div className="flex items-center gap-3 w-full md:w-auto">
        <LastUpdateInfo
          lastUpdateTime={lastUpdateTime}
          isLoading={isLoading}
          onRefresh={onRefresh}
          selectedTrack={selectedTrack}
          selectedRace={selectedRace}
        />
        
        <ScraperControls
          jobsCount={jobsCount}
          showActiveJobs={showActiveJobs}
          showDatabaseMonitor={showDatabaseMonitor}
          toggleActiveJobs={toggleActiveJobs}
          toggleDatabaseMonitor={toggleDatabaseMonitor}
        />
      </div>
    </div>
  );
};

export default DashboardHeader;
