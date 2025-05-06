
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScrapeJob, ScraperStats } from '@/types/ScraperTypes';
import { toast } from '@/components/ui/sonner';

export const useScrapeJobs = () => {
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);
  const [stats, setStats] = useState<ScraperStats>({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    oddsRecords: 0,
    willPaysRecords: 0,
    resultsRecords: 0,
    lastExecutionTime: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isRunningJob, setIsRunningJob] = useState(false);

  // Load jobs and stats
  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('scrape_jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setJobs(data as ScrapeJob[]);
    } catch (error) {
      console.error('Error loading scrape jobs:', error);
      toast.error('Failed to load scrape jobs');
    } finally {
      setIsLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      // Get counts from each table
      const [
        jobsResponse,
        activeJobsResponse,
        completedJobsResponse,
        failedJobsResponse,
        oddsResponse,
        willPaysResponse,
        resultsResponse
      ] = await Promise.all([
        supabase.from('scrape_jobs').select('id', { count: 'exact', head: true }),
        supabase.from('scrape_jobs').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('scrape_jobs').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('scrape_jobs').select('id', { count: 'exact', head: true }).eq('status', 'failed'),
        supabase.from('odds_data').select('id', { count: 'exact', head: true }),
        supabase.from('exotic_will_pays').select('id', { count: 'exact', head: true }),
        supabase.from('race_results').select('id', { count: 'exact', head: true })
      ]);
      
      // Get last execution time
      const { data: lastJobData } = await supabase
        .from('scrape_jobs')
        .select('last_run_at')
        .not('last_run_at', 'is', null)
        .order('last_run_at', { ascending: false })
        .limit(1);
      
      setStats({
        totalJobs: jobsResponse.count || 0,
        activeJobs: activeJobsResponse.count || 0,
        completedJobs: completedJobsResponse.count || 0,
        failedJobs: failedJobsResponse.count || 0,
        oddsRecords: oddsResponse.count || 0,
        willPaysRecords: willPaysResponse.count || 0,
        resultsRecords: resultsResponse.count || 0,
        lastExecutionTime: lastJobData && lastJobData.length > 0 ? lastJobData[0].last_run_at : null
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Create a new job
  const createJob = async (values: any) => {
    try {
      const { data, error } = await supabase
        .from('scrape_jobs')
        .insert({
          url: values.url,
          track_name: values.track_name,
          job_type: values.job_type,
          interval_seconds: values.interval_seconds,
          is_active: values.is_active,
          status: 'pending',
          next_run_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      setJobs([data as ScrapeJob, ...jobs]);
      toast.success('Scrape job created successfully');
      loadStats();
      return true;
    } catch (error) {
      console.error('Error creating scrape job:', error);
      toast.error('Failed to create scrape job');
      return false;
    }
  };

  // Toggle job status
  const toggleJobStatus = async (job: ScrapeJob) => {
    try {
      const updatedIsActive = !job.is_active;
      
      const { error } = await supabase
        .from('scrape_jobs')
        .update({ 
          is_active: updatedIsActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);
      
      if (error) {
        throw error;
      }
      
      // Update jobs state
      setJobs(jobs.map(j => 
        j.id === job.id ? { ...j, is_active: updatedIsActive } : j
      ));
      
      toast.success(`Job ${updatedIsActive ? 'activated' : 'paused'} successfully`);
      loadStats();
    } catch (error) {
      console.error('Error toggling job status:', error);
      toast.error('Failed to update job status');
    }
  };

  // Delete a job
  const deleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('scrape_jobs')
        .delete()
        .eq('id', jobId);
      
      if (error) {
        throw error;
      }
      
      setJobs(jobs.filter(job => job.id !== jobId));
      toast.success('Job deleted successfully');
      loadStats();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  // Run a job manually
  const runJobManually = async (job: ScrapeJob) => {
    setIsRunningJob(true);
    try {
      // Call the edge function to run the job
      const { data, error } = await supabase.functions.invoke('run-scrape-jobs', {
        body: { jobId: job.id }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Job executed successfully');
      await loadJobs();
      await loadStats();
    } catch (error) {
      console.error('Error running job:', error);
      toast.error('Failed to execute job');
    } finally {
      setIsRunningJob(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadJobs();
    loadStats();
  }, []);

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
    runJobManually
  };
};
