
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScrapeJob } from '@/types/ScraperTypes';
import { toast } from '@/components/ui/sonner';

export const useJobOperations = () => {
  const [isRunningJob, setIsRunningJob] = useState(false);

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
      
      toast.success('Scrape job created successfully');
      return { success: true, data };
    } catch (error) {
      console.error('Error creating scrape job:', error);
      toast.error('Failed to create scrape job');
      return { success: false, data: null };
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
      
      toast.success(`Job ${updatedIsActive ? 'activated' : 'paused'} successfully`);
      return { success: true, isActive: updatedIsActive };
    } catch (error) {
      console.error('Error toggling job status:', error);
      toast.error('Failed to update job status');
      return { success: false };
    }
  };

  // Delete a job
  const deleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) {
      return { success: false };
    }
    
    try {
      const { error } = await supabase
        .from('scrape_jobs')
        .delete()
        .eq('id', jobId);
      
      if (error) {
        throw error;
      }
      
      toast.success('Job deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
      return { success: false };
    }
  };

  // Run a job manually
  const runJobManually = async (job: ScrapeJob) => {
    setIsRunningJob(true);
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
      
      // Call the edge function with the specific job ID to run it immediately
      const { data, error } = await supabase.functions.invoke('run-scrape-jobs', {
        body: { jobId: job.id, force: true }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Job executed successfully');
      return { success: true };
    } catch (error) {
      console.error('Error running job:', error);
      toast.error('Failed to execute job');
      return { success: false };
    } finally {
      setIsRunningJob(false);
    }
  };

  return {
    isRunningJob,
    createJob,
    toggleJobStatus,
    deleteJob,
    runJobManually
  };
};
