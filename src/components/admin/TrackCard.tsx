
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { ScrapeJob } from '@/types/ScraperTypes';

interface TrackCardProps {
  trackName: string;
  jobs: ScrapeJob[];
  onRunJob: (job: ScrapeJob) => void;
  onViewTrackData: (trackName: string) => void;
  isRunningJob: boolean;
}

const TrackCard: React.FC<TrackCardProps> = ({ 
  trackName, 
  jobs, 
  onRunJob, 
  onViewTrackData,
  isRunningJob 
}) => {
  // Get the active jobs count
  const activeJobs = jobs.filter(job => job.is_active).length;
  
  // Find the most recent job execution time
  const lastRunTime = jobs.reduce((latest, job) => {
    if (!job.last_run_at) return latest;
    if (!latest) return job.last_run_at;
    return new Date(job.last_run_at) > new Date(latest) ? job.last_run_at : latest;
  }, null as string | null);

  // Determine card status
  const hasFailedJobs = jobs.some(job => job.status === 'failed');
  const hasRunningJobs = jobs.some(job => job.status === 'running');
  
  return (
    <Card className="border-4 border-betting-tertiaryPurple bg-betting-darkPurple transition-all hover:scale-[1.02]">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-white">{trackName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={activeJobs > 0 ? "default" : "outline"} 
                className={activeJobs > 0 ? "bg-green-600" : "text-gray-400"}>
                {activeJobs} Active Jobs
              </Badge>
              
              {lastRunTime && (
                <div className="text-xs text-gray-400 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(parseISO(lastRunTime), 'MM/dd HH:mm:ss')}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Find the first active job and run it
                const activeJob = jobs.find(job => job.is_active);
                if (activeJob) onRunJob(activeJob);
              }}
              disabled={activeJobs === 0 || isRunningJob}
              className="h-8 px-3 text-xs border-betting-tertiaryPurple text-white"
            >
              {activeJobs > 0 ? (
                hasRunningJobs ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />
              ) : null}
              <span className="ml-1">{
                hasRunningJobs ? "Running" : 
                activeJobs > 0 ? "Run Jobs" : "No Jobs"
              }</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewTrackData(trackName)}
              className="h-8 px-3 text-xs border-betting-tertiaryPurple text-white"
            >
              View Data
            </Button>
          </div>
        </div>
        
        <div className="mt-3 grid grid-cols-3 gap-2">
          {jobs.map((job, index) => (
            <div key={index} className="text-xs bg-black/20 p-1.5 rounded text-gray-200">
              <div className="flex items-center justify-between">
                <span className="capitalize">{job.job_type.replace('_', ' ')}</span>
                <span className={`w-2 h-2 rounded-full ${
                  job.status === 'running' ? 'bg-blue-500' :
                  job.status === 'completed' ? 'bg-green-500' :
                  job.status === 'failed' ? 'bg-red-500' :
                  'bg-yellow-500'
                }`}></span>
              </div>
              <div className="text-gray-400 mt-0.5">
                {job.interval_seconds >= 60 
                  ? `${Math.floor(job.interval_seconds / 60)} min` 
                  : `${job.interval_seconds} sec`}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrackCard;
