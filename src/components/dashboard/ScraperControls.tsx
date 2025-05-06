
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, Database } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface ScraperControlsProps {
  jobsCount: number;
  showActiveJobs: boolean;
  showDatabaseMonitor: boolean;
  toggleActiveJobs: () => void;
  toggleDatabaseMonitor: () => void;
}

const ScraperControls: React.FC<ScraperControlsProps> = ({
  jobsCount,
  showActiveJobs,
  showDatabaseMonitor,
  toggleActiveJobs,
  toggleDatabaseMonitor
}) => {
  const [isRefreshingJobs, setIsRefreshingJobs] = React.useState(false);

  // Function to manually trigger scrape jobs
  const triggerScrapeJobs = async () => {
    setIsRefreshingJobs(true);
    try {
      // Call the edge function to execute jobs
      const { data, error } = await supabase.functions.invoke('run-scrape-jobs', {
        body: { force: true }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Scrape jobs triggered successfully");
    } catch (error) {
      console.error('Error triggering scrape jobs:', error);
      toast.error("Failed to trigger scrape jobs");
    } finally {
      setIsRefreshingJobs(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={showActiveJobs ? "default" : "outline"}
        size="sm"
        className={showActiveJobs 
          ? "bg-betting-tertiaryPurple text-white hover:bg-betting-secondaryPurple" 
          : "border-betting-tertiaryPurple text-white hover:bg-betting-darkPurple/20"}
        onClick={toggleActiveJobs}
      >
        <span>Active Jobs ({jobsCount})</span>
      </Button>
      
      <Button
        variant={showDatabaseMonitor ? "default" : "outline"}
        size="sm"
        className={showDatabaseMonitor 
          ? "bg-betting-tertiaryPurple text-white hover:bg-betting-secondaryPurple" 
          : "border-betting-tertiaryPurple text-white hover:bg-betting-darkPurple/20"}
        onClick={toggleDatabaseMonitor}
      >
        <Database className="h-4 w-4 mr-2" />
        <span>DB Monitor</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={triggerScrapeJobs}
        disabled={isRefreshingJobs}
        className="border-betting-tertiaryPurple text-white hover:bg-betting-darkPurple/20"
      >
        {isRefreshingJobs ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Zap className="h-4 w-4 mr-2" />
        )}
        <span>Run All Jobs</span>
      </Button>
    </div>
  );
};

export default ScraperControls;
