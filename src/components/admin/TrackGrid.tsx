
import React, { useState } from 'react';
import { ScrapeJob } from '@/types/ScraperTypes';
import TrackCard from './TrackCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TrackDataView from './TrackDataView';

interface TrackGridProps {
  jobs: ScrapeJob[];
  onRunJob: (job: ScrapeJob) => void;
  isRunningJob: boolean;
}

const TrackGrid: React.FC<TrackGridProps> = ({ jobs, onRunJob, isRunningJob }) => {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  
  // Group jobs by track
  const trackJobs = jobs.reduce((acc, job) => {
    if (!acc[job.track_name]) {
      acc[job.track_name] = [];
    }
    acc[job.track_name].push(job);
    return acc;
  }, {} as Record<string, ScrapeJob[]>);
  
  const handleViewTrackData = (trackName: string) => {
    setSelectedTrack(trackName);
  };
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(trackJobs).map(([trackName, trackJobs]) => (
          <TrackCard
            key={trackName}
            trackName={trackName}
            jobs={trackJobs}
            onRunJob={onRunJob}
            onViewTrackData={handleViewTrackData}
            isRunningJob={isRunningJob}
          />
        ))}
      </div>
      
      <Dialog open={!!selectedTrack} onOpenChange={() => setSelectedTrack(null)}>
        <DialogContent className="bg-betting-darkPurple border-betting-tertiaryPurple text-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedTrack} Data</DialogTitle>
          </DialogHeader>
          
          {selectedTrack && (
            <TrackDataView trackName={selectedTrack} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TrackGrid;
