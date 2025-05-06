
import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Play } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { ScrapeJob, STATUS_COLORS } from '@/types/ScraperTypes';
import { toast } from '@/components/ui/sonner';

const ActiveScrapeJobsList = () => {
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [runningJob, setRunningJob] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Force refresh of job countdown timers
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchActiveJobs = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('scrape_jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setJobs(data as ScrapeJob[]);
      } else {
        console.error('Error fetching active jobs:', error);
      }
      setIsLoading(false);
    };

    fetchActiveJobs();

    // Set up a subscription for real-time updates
    const channel = supabase
      .channel('scrape-jobs-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'scrape_jobs'
      }, () => {
        fetchActiveJobs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  // Manually run a job
  const runJobNow = async (job: ScrapeJob) => {
    setRunningJob(job.id);
    try {
      // Update job to run immediately
      const { error: updateError } = await supabase
        .from('scrape_jobs')
        .update({ 
          next_run_at: new Date().toISOString(),
          status: 'pending'
        })
        .eq('id', job.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Call the edge function to execute jobs
      const { error: functionError } = await supabase.functions.invoke('run-scrape-jobs');
      
      if (functionError) {
        throw functionError;
      }
      
      toast.success('Job execution triggered successfully');
    } catch (error) {
      console.error('Error running job:', error);
      toast.error('Failed to run job');
    } finally {
      setRunningJob(null);
    }
  };

  // Check if a job is overdue
  const isJobOverdue = (job: ScrapeJob): boolean => {
    const now = new Date();
    const nextRun = new Date(job.next_run_at);
    return nextRun < now && job.status === 'pending';
  };

  return (
    <div className="overflow-x-auto">
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-betting-skyBlue" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          No active scrape jobs found.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Track</TableHead>
              <TableHead>Job Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Interval</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead>Next Run</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map(job => {
              const statusColor = STATUS_COLORS[job.status as keyof typeof STATUS_COLORS];
              const secondsUntilNextRun = getSecondsUntilNextRun(job.next_run_at);
              const overdue = isJobOverdue(job);
              
              return (
                <TableRow key={job.id} className={`${statusColor.bg} hover:bg-opacity-30 ${overdue ? 'bg-red-500/10' : ''}`}>
                  <TableCell className="font-medium">{job.track_name}</TableCell>
                  <TableCell>
                    <span className="capitalize">{job.job_type.replace('_', ' ')}</span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`${statusColor.border} ${statusColor.text}`}
                    >
                      <span className={`w-2 h-2 rounded-full mr-2 inline-block ${statusColor.dot} ${job.status === 'running' ? 'animate-pulse' : ''}`}></span>
                      {job.status}
                    </Badge>
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
                      <span className={`text-xs ${overdue ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
                        {overdue 
                          ? 'OVERDUE' 
                          : `${formatTimeRemaining(secondsUntilNextRun)} remaining`}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runJobNow(job)}
                      disabled={!!runningJob || job.status === 'running'}
                      className="h-8 px-2 text-sm"
                    >
                      {runningJob === job.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      <span className="ml-1">Run Now</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ActiveScrapeJobsList;
