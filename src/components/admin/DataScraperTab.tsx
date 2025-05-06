import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { 
  Loader2, RefreshCw, Play, Pause, 
  Trash2, PlusCircle, Clock, BarChart2 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { 
  ScrapeJob, ScraperStats, TRACK_OPTIONS,
  JOB_TYPE_OPTIONS, INTERVAL_OPTIONS 
} from '@/types/ScraperTypes';
import TrackGrid from './TrackGrid';

const DataScraperTab = () => {
  const [activeTab, setActiveTab] = useState('tracks');
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRunningJob, setIsRunningJob] = useState(false);
  
  const form = useForm({
    defaultValues: {
      url: '',
      track_name: '',
      job_type: 'odds',
      interval_seconds: 60,
      is_active: true
    }
  });

  // Load jobs and stats on mount
  useEffect(() => {
    loadJobs();
    loadStats();
  }, []);

  // Function to load all scrape jobs
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

  // Function to calculate scraper stats
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

  // Function to handle form submission to create a new job
  const handleCreateJob = async (values: any) => {
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
      setIsDialogOpen(false);
      form.reset();
      
      toast.success('Scrape job created successfully');
      loadStats();
    } catch (error) {
      console.error('Error creating scrape job:', error);
      toast.error('Failed to create scrape job');
    }
  };

  // Function to toggle a job's active status
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

  // Function to delete a job
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

  // Function to run a job manually
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

  // Render stats cards
  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-betting-darkCard border-betting-mediumBlue">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Total Jobs</p>
            <h3 className="text-2xl font-bold">{stats.totalJobs}</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <BarChart2 className="h-5 w-5 text-purple-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-betting-darkCard border-betting-mediumBlue">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Active Jobs</p>
            <h3 className="text-2xl font-bold">{stats.activeJobs}</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <Play className="h-5 w-5 text-green-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-betting-darkCard border-betting-mediumBlue">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Total Records</p>
            <h3 className="text-2xl font-bold">
              {stats.oddsRecords + stats.willPaysRecords + stats.resultsRecords}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <BarChart2 className="h-5 w-5 text-blue-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-betting-darkCard border-betting-mediumBlue">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Last Execution</p>
            <h3 className="text-lg font-medium">
              {stats.lastExecutionTime 
                ? new Date(stats.lastExecutionTime).toLocaleString()
                : 'Never'}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Clock className="h-5 w-5 text-yellow-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <CardHeader className="px-0 pt-0">
        <CardTitle>Off-Track Betting Data Scraper</CardTitle>
        <div className="text-gray-400 mt-2">
          Configure automated scraping for odds, will pays, and results from offtrackbetting.com
        </div>
      </CardHeader>
      
      {renderStatsCards()}
      
      <div className="flex justify-between items-center mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-[400px] grid-cols-3">
            <TabsTrigger value="tracks">Track Overview</TabsTrigger>
            <TabsTrigger value="jobs">Scrape Jobs</TabsTrigger>
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
      
      <TabsContent value="jobs" className="mt-0">
        <div className="rounded-md border border-betting-mediumBlue overflow-hidden">
          <Table>
            <TableHeader className="bg-betting-darkPurple">
              <TableRow>
                <TableHead className="text-white">Track</TableHead>
                <TableHead className="text-white">Job Type</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Interval</TableHead>
                <TableHead className="text-white">Last Run</TableHead>
                <TableHead className="text-white">Next Run</TableHead>
                <TableHead className="text-white">Active</TableHead>
                <TableHead className="text-white text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-400">
                    No scrape jobs found. Create your first job to get started.
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map(job => (
                  <TableRow key={job.id} className="hover:bg-betting-darkPurple/20">
                    <TableCell className="font-medium">{job.track_name}</TableCell>
                    <TableCell>
                      <span className="capitalize">{job.job_type.replace('_', ' ')}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          job.status === 'running' ? 'bg-blue-500' :
                          job.status === 'completed' ? 'bg-green-500' :
                          job.status === 'failed' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`}></span>
                        <span className="capitalize">{job.status}</span>
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
                      {format(parseISO(job.next_run_at), 'MM/dd HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={job.is_active}
                        onCheckedChange={() => toggleJobStatus(job)}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runJobManually(job)}
                          disabled={isRunningJob}
                          className="h-8 px-2 text-sm"
                        >
                          {isRunningJob ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteJob(job.id)}
                          className="h-8 px-2 text-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
      
      <TabsContent value="latest" className="mt-0">
        <Card className="bg-betting-darkCard border-betting-mediumBlue p-4">
          <h3 className="text-lg font-medium mb-4">Latest Scraped Data</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-blue-400 mb-2">Odds Data</h4>
              <p className="text-sm text-gray-400">Total Records: {stats.oddsRecords}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-green-400 mb-2">Will Pays</h4>
              <p className="text-sm text-gray-400">Total Records: {stats.willPaysRecords}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-yellow-400 mb-2">Race Results</h4>
              <p className="text-sm text-gray-400">Total Records: {stats.resultsRecords}</p>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-400">
            <p>To view the actual scraped data, please check the respective tables in the Supabase dashboard:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Odds data is stored in the <code>odds_data</code> table</li>
              <li>Will pays are stored in the <code>exotic_will_pays</code> table</li>
              <li>Race results are stored in the <code>race_results</code> table</li>
            </ul>
          </div>
        </Card>
      </TabsContent>
      
      <TabsContent value="config" className="mt-0">
        <Card className="bg-betting-darkCard border-betting-mediumBlue p-4">
          <h3 className="text-lg font-medium mb-4">Scraper Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-blue-400 mb-2">URL Patterns</h4>
              <div className="text-sm text-gray-400 space-y-2">
                <p>Use these URL patterns for different types of scrapers:</p>
                
                <div className="bg-black/30 p-2 rounded">
                  <strong>Odds:</strong> https://www.offtrackbetting.com/[track-name]/race-[number]
                </div>
                
                <div className="bg-black/30 p-2 rounded">
                  <strong>Will Pays:</strong> https://www.offtrackbetting.com/[track-name]/race-[number]/will-pays
                </div>
                
                <div className="bg-black/30 p-2 rounded">
                  <strong>Results:</strong> https://www.offtrackbetting.com/[track-name]/race-[number]/results
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-green-400 mb-2">Job Types</h4>
              <div className="text-sm text-gray-400">
                <p>The scraper supports three types of jobs:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Odds:</strong> Scrapes current odds for each horse in a race</li>
                  <li><strong>Will Pays:</strong> Scrapes exotic bet payouts (DD, P3, P4, P5, P6)</li>
                  <li><strong>Results:</strong> Scrapes race results and payouts</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-yellow-400 mb-2">Intervals</h4>
              <div className="text-sm text-gray-400">
                <p>Jobs can be scheduled with different intervals ranging from 30 seconds to 1 hour.</p>
                <p className="mt-2">Choose shorter intervals (30-60 seconds) for odds that change frequently, and longer intervals for will pays and results.</p>
              </div>
            </div>
          </div>
        </Card>
      </TabsContent>
      
      {/* Dialog for creating a new job */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-betting-darkCard border-betting-mediumBlue text-white">
          <DialogHeader>
            <DialogTitle>Create New Scrape Job</DialogTitle>
            <DialogDescription>
              Configure a new job to automatically scrape data from offtrackbetting.com
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateJob)} className="space-y-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://www.offtrackbetting.com/..."
                        className="bg-betting-dark border-betting-mediumBlue text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-gray-400">
                      The URL to scrape data from
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="track_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Track</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-betting-dark border-betting-mediumBlue text-white">
                            <SelectValue placeholder="Select track" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-betting-dark border-betting-mediumBlue text-white">
                          {TRACK_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="job_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-betting-dark border-betting-mediumBlue text-white">
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-betting-dark border-betting-mediumBlue text-white">
                          {JOB_TYPE_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="interval_seconds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interval</FormLabel>
                      <Select 
                        onValueChange={(val) => field.onChange(parseInt(val))} 
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-betting-dark border-betting-mediumBlue text-white">
                            <SelectValue placeholder="Select interval" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-betting-dark border-betting-mediumBlue text-white">
                          {INTERVAL_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border border-betting-mediumBlue p-4 mt-6">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Job
                        </FormLabel>
                        <FormDescription className="text-gray-400">
                          Start scraping immediately
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-green-500"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Job</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DataScraperTab;
