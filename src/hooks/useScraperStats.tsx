
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScraperStats } from '@/types/ScraperTypes';

export const useScraperStats = () => {
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

  return {
    stats,
    loadStats
  };
};
