
import React, { useState } from 'react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { Loader2, RefreshCw, PlusCircle } from 'lucide-react';
import { useScrapeJobs } from '@/hooks/useScrapeJobs';
import StatsCards from './stats/StatsCards';
import CreateJobDialog from './jobs/CreateJobDialog';
import JobsTable from './jobs/JobsTable';
import ConfigInfo from './config/ConfigInfo';
import TrackGrid from './TrackGrid';
import ActiveJobsList from './ActiveJobsList';

const DataScraperTab = () => {
  const [activeTab, setActiveTab] = useState('tracks');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const {
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
  } = useScrapeJobs();
  
  const form = useForm({
    defaultValues: {
      url: '',
      track_name: '',
      job_type: 'odds',
      interval_seconds: 60,
      is_active: true
    }
  });

  // Function to handle form submission to create a new job
  const handleCreateJob = async (values: any) => {
    const success = await createJob(values);
    if (success) {
      setIsDialogOpen(false);
      form.reset();
    }
  };

  return (
    <>
      <CardHeader className="px-0 pt-0">
        <CardTitle>Off-Track Betting Data Scraper</CardTitle>
        <div className="text-gray-400 mt-2">
          Configure automated scraping for odds, will pays, and results from offtrackbetting.com
        </div>
      </CardHeader>
      
      <StatsCards stats={stats} />
      
      <div className="flex justify-between items-center mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-[500px] grid-cols-4">
            <TabsTrigger value="tracks">Track Overview</TabsTrigger>
            <TabsTrigger value="active">Active Jobs</TabsTrigger>
            <TabsTrigger value="jobs">All Jobs</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => {
              loadJobs();
              loadStats();
            }}
            disabled={isLoading}
            className="h-8 px-3"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="h-8 px-3"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Job
          </Button>
        </div>
      </div>
      
      <TabsContent value="tracks" className="mt-0">
        <TrackGrid 
          jobs={jobs} 
          onRunJob={runJobManually} 
          isRunningJob={isRunningJob} 
        />
      </TabsContent>
      
      <TabsContent value="active" className="mt-0">
        <ActiveJobsList 
          jobs={jobs} 
          onRunJob={runJobManually} 
          isRunningJob={isRunningJob} 
        />
      </TabsContent>
      
      <TabsContent value="jobs" className="mt-0">
        <JobsTable
          jobs={jobs}
          onRunJob={runJobManually}
          onToggleJobStatus={toggleJobStatus}
          onDeleteJob={deleteJob}
          isRunningJob={isRunningJob}
        />
      </TabsContent>
      
      <TabsContent value="config" className="mt-0">
        <ConfigInfo />
      </TabsContent>
      
      <CreateJobDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        form={form}
        onSubmit={handleCreateJob}
      />
    </>
  );
};

export default DataScraperTab;
