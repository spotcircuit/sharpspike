
import React, { useState, useEffect } from 'react';
import { ScrapeJob, STATUS_COLORS } from '@/types/ScraperTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Pause, Eye, RefreshCw, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import TrackDataView from './TrackDataView';
import { Progress } from '@/components/ui/progress';
import LiveDataStream from './streaming/LiveDataStream';

interface ActiveJobsListProps {
  jobs: ScrapeJob[];
  onRunJob: (job: ScrapeJob) => void;
  isRunningJob: boolean;
}

const ActiveJobsList: React.FC<ActiveJobsListProps> = ({ jobs, onRunJob, isRunningJob }) => {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [selectedJobType, setSelectedJobType] = useState<'odds' | 'will_pays' | 'results' | null>(null);
  const [activeJobs, setActiveJobs] = useState<ScrapeJob[]>([]);
  const [timeProgress, setTimeProgress] = useState<{ [key: string]: number }>({});
  const [showLiveStream, setShowLiveStream] = useState(false);
  
  // Filter for active jobs only
  useEffect(() => {
    setActiveJobs(jobs.filter(job => job.is_active));
  }, [jobs]);
  
  // Calculate time progress for each job
  useEffect(() => {
    const timer = setInterval(() => {
      const progress: { [key: string]: number } = {};
      
      activeJobs.forEach(job => {
        const lastRun = job.last_run_at ? new Date(job.last_run_at).getTime() : Date.now();
        const nextRun = new Date(job.next_run_at).getTime();
        const now = Date.now();
        
        // Calculate progress percentage
        const totalTime = nextRun - lastRun;
        const elapsedTime = now - lastRun;
        let progressPercent = Math.min(Math.floor((elapsedTime / totalTime) * 100), 100);
        
        // Handle edge cases
        if (isNaN(progressPercent) || progressPercent < 0) {
          progressPercent = 0;
        }
        
        progress[job.id] = progressPercent;
      });
      
      setTimeProgress(progress);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [activeJobs]);
  
  // View data for a specific track
  const handleViewTrackData = (trackName: string, jobType: 'odds' | 'will_pays' | 'results') => {
    setSelectedTrack(trackName);
    setSelectedJobType(jobType);
    setShowLiveStream(true);
  };
  
  // Group jobs by status
  const jobsByStatus = activeJobs.reduce((acc, job) => {
    if (!acc[job.status]) {
      acc[job.status] = [];
    }
    acc[job.status].push(job);
    return acc;
  }, {} as Record<string, ScrapeJob[]>);

  // Calculate seconds until next run
  const getSecondsUntilNextRun = (nextRunAt: string): number => {
    const nextRun = new Date(nextRunAt).getTime();
    const now = Date.now();
    const secondsRemaining = Math.max(0, Math.floor((nextRun - now) / 1000));
    return secondsRemaining;
  };

  // Time formatter
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="bg-betting-darkCard border-betting-mediumBlue col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <span>Active Scrape Jobs</span>
              </div>
              <div className="flex items-center gap-2">
                {Object.keys(STATUS_COLORS).map(status => (
                  <Badge 
                    key={status} 
                    variant="outline" 
                    className={`${STATUS_COLORS[status as keyof typeof STATUS_COLORS].border} ${STATUS_COLORS[status as keyof typeof STATUS_COLORS].text}`}
                  >
                    <span className={`w-2 h-2 rounded-full mr-1 ${STATUS_COLORS[status as keyof typeof STATUS_COLORS].dot}`}></span>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                ))}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Track</TableHead>
                    <TableHead>Job Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Interval</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Next Run</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-400">
                        No active scrape jobs found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    activeJobs.map(job => {
                      const statusColor = STATUS_COLORS[job.status as keyof typeof STATUS_COLORS];
                      const secondsUntilNextRun = getSecondsUntilNextRun(job.next_run_at);
                      
                      return (
                        <TableRow key={job.id} className={`${statusColor.bg} hover:bg-opacity-30`}>
                          <TableCell className="font-medium">{job.track_name}</TableCell>
                          <TableCell>
                            <span className="capitalize">{job.job_type.replace('_', ' ')}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${statusColor.dot} ${job.status === 'running' ? 'animate-pulse' : ''}`}></span>
                              <span className={`capitalize ${statusColor.text}`}>{job.status}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {job.interval_seconds >= 60 
                              ? `${Math.floor(job.interval_seconds / 60)} min`
                              : `${job.interval_seconds} sec`}
                          </TableCell>
                          <TableCell>
                            {job.last_run_at 
                              ? format(parseISO(job.last_run_at), 'MM/dd HH:mm:ss')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{format(parseISO(job.next_run_at), 'MM/dd HH:mm:ss')}</span>
                              <span className="text-xs text-gray-400">
                                {formatTimeRemaining(secondsUntilNextRun)} remaining
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="w-36">
                            <Progress 
                              value={timeProgress[job.id] || 0} 
                              className="h-2 bg-betting-darkPurple"
                              style={{ 
                                "--progress-color": statusColor.dot,
                                background: 'rgba(30, 30, 50, 0.4)'
                              } as any}
                            />
                            <div className="text-xs text-right mt-1">
                              {timeProgress[job.id] || 0}%
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onRunJob(job)}
                                disabled={isRunningJob}
                                className="h-7 px-2 text-xs"
                              >
                                {isRunningJob ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : job.status === "running" ? (
                                  <Pause className="h-3 w-3" />
                                ) : (
                                  <Play className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewTrackData(job.track_name, job.job_type as any)}
                                className="h-7 px-2 text-xs"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            
            {activeJobs.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {Object.entries(jobsByStatus).map(([status, statusJobs]) => (
                  <Card key={status} className={`${STATUS_COLORS[status as keyof typeof STATUS_COLORS].bg} bg-opacity-20 border-${STATUS_COLORS[status as keyof typeof STATUS_COLORS].border}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-medium ${STATUS_COLORS[status as keyof typeof STATUS_COLORS].text}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </h3>
                        <span className="text-2xl font-bold">{statusJobs.length}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <LiveDataStream 
          trackName={selectedTrack || undefined} 
          jobType={selectedJobType || undefined} 
        />
      </div>
      
      <Dialog open={!!selectedTrack && !showLiveStream} onOpenChange={() => setSelectedTrack(null)}>
        <DialogContent className="bg-betting-darkCard border-betting-mediumBlue text-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTrack} Data</DialogTitle>
          </DialogHeader>
          
          {selectedTrack && (
            <TrackDataView trackName={selectedTrack} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActiveJobsList;
