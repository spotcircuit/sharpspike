
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log("Starting scheduled race results scrape");
    
    let requestData = {};
    try {
      requestData = await req.json();
    } catch (e) {
      // If no JSON, use empty object
      console.log("No request body or invalid JSON");
    }
    
    // Get the job ID if specified
    const jobId = requestData?.jobId;
    const forceRun = requestData?.force === true;
    
    // Get active scrape jobs of type 'results'
    let jobsQuery = supabase.from('scrape_jobs')
      .select('*')
      .eq('is_active', true)
      .eq('job_type', 'results');
    
    if (jobId) {
      // If specific job ID provided, only get that job
      jobsQuery = jobsQuery.eq('id', jobId);
    } else if (!forceRun) {
      // Only get jobs that are due to run
      jobsQuery = jobsQuery.lte('next_run_at', new Date().toISOString());
    }
    
    const { data: jobs, error: jobsError } = await jobsQuery.order('next_run_at');
    
    if (jobsError) {
      throw jobsError;
    }
    
    if (!jobs || jobs.length === 0) {
      console.log("No pending scrape jobs for race results");
      return new Response(
        JSON.stringify({ success: true, message: "No pending scrape jobs for race results" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Found ${jobs.length} result scrape jobs to process`);
    
    const results = [];
    
    // Process each job
    for (const job of jobs) {
      console.log(`Processing job: ${job.id} for ${job.track_name} Race ${job.race_number || 'all races'}`);
      
      try {
        // Update job status to "running"
        await supabase
          .from('scrape_jobs')
          .update({ status: 'running' })
          .eq('id', job.id);
        
        // Generate URL if none provided
        let jobUrl = job.url;
        if (!jobUrl || jobUrl.trim() === '') {
          // Generate a default URL based on track and job type
          const trackSlug = job.track_name.toLowerCase().replace(/\s+/g, '-');
          jobUrl = `https://app.offtrackbetting.com/#/lobby/live-racing?programName=${trackSlug}`;
          if (job.race_number) {
            jobUrl += `&raceNumber=${job.race_number}`;
          }
          console.log(`Using generated URL: ${jobUrl}`);
        }
        
        // Call the run-scrape-jobs function with the job parameters
        const { data: scrapeResult, error: scrapeError } = await supabase.functions.invoke('run-scrape-jobs', {
          body: { 
            jobId: job.id,
            force: true
          }
        });
        
        if (scrapeError) {
          throw scrapeError;
        }
        
        // Calculate next run time
        const nextRunAt = new Date();
        nextRunAt.setSeconds(nextRunAt.getSeconds() + job.interval_seconds);
        
        // Update job status to "completed" and set next_run_at
        await supabase
          .from('scrape_jobs')
          .update({
            status: 'completed',
            last_run_at: new Date().toISOString(),
            next_run_at: nextRunAt.toISOString()
          })
          .eq('id', job.id);
        
        results.push({
          id: job.id,
          track: job.track_name,
          race: job.race_number || 'all',
          success: true,
          message: `Successfully scraped results for ${job.track_name} Race ${job.race_number || 'all'}`
        });
        
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
        
        // Calculate next run time even for failed jobs
        const nextRunAt = new Date();
        nextRunAt.setSeconds(nextRunAt.getSeconds() + job.interval_seconds);
        
        // Update job status to "failed"
        await supabase
          .from('scrape_jobs')
          .update({
            status: 'failed',
            last_run_at: new Date().toISOString(),
            next_run_at: nextRunAt.toISOString()
          })
          .eq('id', job.id);
        
        results.push({
          id: job.id,
          track: job.track_name,
          race: job.race_number || 'all',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in scheduled scrape:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
