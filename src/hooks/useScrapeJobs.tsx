
import { useState, useEffect } from 'react';
import { ScrapeJob } from '@/types/ScraperTypes';
import { useJobFetching } from './useJobFetching';
import { useScraperStats } from './useScraperStats';
import { useJobOperations } from './useJobOperations';
import { toast } from '@/components/ui/sonner';

export const useScrapeJobs = () => {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Use our smaller hooks
  const { jobs, isLoading, loadJobs, setJobs } = useJobFetching();
  const { stats, loadStats } = useScraperStats();
  const { isRunningJob, createJob: createJobOperation, toggleJobStatus: toggleJobStatusOperation, deleteJob: deleteJobOperation, runJobManually: runJobManuallyOperation } = useJobOperations();

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      loadJobs();
      loadStats();
      setLastRefresh(new Date());
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Load data on mount
  useEffect(() => {
    loadJobs();
    loadStats();
  }, []);

  // Enhanced versions of the operations that update local state
  const createJob = async (values: any) => {
    const result = await createJobOperation(values);
    if (result.success && result.data) {
      setJobs([result.data as ScrapeJob, ...jobs]);
      loadStats();
    }
    return result.success;
  };

  const toggleJobStatus = async (job: ScrapeJob) => {
    const result = await toggleJobStatusOperation(job);
    if (result.success) {
      // Update jobs state
      setJobs(jobs.map(j => 
        j.id === job.id ? { ...j, is_active: result.isActive } : j
      ));
      loadStats();
    }
  };

  const deleteJob = async (jobId: string) => {
    const result = await deleteJobOperation(jobId);
    if (result.success) {
      setJobs(jobs.filter(job => job.id !== jobId));
      loadStats();
    }
  };

  const runJobManually = async (job: ScrapeJob) => {
    const result = await runJobManuallyOperation(job);
    if (result.success) {
      // Wait a moment before refreshing to allow the edge function to complete
      setTimeout(async () => {
        await loadJobs();
        await loadStats();
      }, 3000);
    }
  };

  return {
    jobs,
    stats,
    isLoading,
    isRunningJob,
    loadJobs,
    loadStats,
    createJob,
    toggleJobStatus,
    deleteJob,
    runJobManually,
    lastRefresh
  };
};
