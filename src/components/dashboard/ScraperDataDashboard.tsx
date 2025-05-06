
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useScrapeJobs } from '@/hooks/useScrapeJobs';
import StatsCards from '@/components/admin/stats/StatsCards';
import JobsTable from '@/components/admin/jobs/JobsTable';
import CreateJobDialog from '@/components/admin/jobs/CreateJobDialog';
import ActiveScrapeJobsList from '@/components/dashboard/ActiveScrapeJobsList';
import ScheduledJobsMonitor from '@/components/dashboard/ScheduledJobsMonitor';
import { RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';

const ScraperDataDashboard: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { 
    jobs, 
    stats, 
    isLoading, 
    loadJobs, 
    loadStats, 
    createJob, 
    toggleJobStatus, 
    deleteJob, 
    runJobManually, 
    lastRefresh
  } = useScrapeJobs();

  const handleRefresh = () => {
    loadJobs();
    loadStats();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Scraper Dashboard</h2>
          <p className="text-gray-400">
            Manage web scraping jobs and view data statistics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} variant="default">
            Create Scrape Job
          </Button>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Last updated: {format(lastRefresh, 'MMM d, yyyy h:mm:ss a')}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StatsCards stats={stats} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-1">
          <ScheduledJobsMonitor />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-betting-navyBlue border-betting-secondaryPurple">
          <CardHeader>
            <CardTitle>Active Scrape Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <ActiveScrapeJobsList />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="active">Active Jobs</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Jobs</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <JobsTable 
            jobs={jobs} 
            isLoading={isLoading} 
            onToggleJobStatus={toggleJobStatus} 
            onDeleteJob={deleteJob}
            onRunJob={runJobManually}
            isRunningJob={false}
          />
        </TabsContent>
        <TabsContent value="active">
          <JobsTable 
            jobs={jobs.filter(job => job.is_active)} 
            isLoading={isLoading} 
            onToggleJobStatus={toggleJobStatus} 
            onDeleteJob={deleteJob}
            onRunJob={runJobManually}
            isRunningJob={false}
          />
        </TabsContent>
        <TabsContent value="inactive">
          <JobsTable 
            jobs={jobs.filter(job => !job.is_active)} 
            isLoading={isLoading} 
            onToggleJobStatus={toggleJobStatus} 
            onDeleteJob={deleteJob}
            onRunJob={runJobManually}
            isRunningJob={false}
          />
        </TabsContent>
      </Tabs>

      <CreateJobDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        createJob={createJob} 
      />
    </div>
  );
};

export default ScraperDataDashboard;
