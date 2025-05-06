
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScrapeJob } from '@/types/ScraperTypes';
import { toast } from '@/components/ui/sonner';

export const useJobFetching = () => {
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load jobs
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

  // Update jobs state from external sources
  const updateJobs = (updatedJobs: ScrapeJob[]) => {
    setJobs(updatedJobs);
  };

  return {
    jobs,
    isLoading,
    loadJobs,
    updateJobs,
    setJobs
  };
};
