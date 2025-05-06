
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { corsHeaders, SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.ts";
import { scrapeOdds } from "./scrape-odds.ts";
import { scrapeWillPays } from "./scrape-will-pays.ts";
import { scrapeResults } from "./scrape-results.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log("Checking for pending scrape jobs...");
    
    // Get specific job ID if provided
    let jobId = null;
    
    try {
      const requestData = await req.json();
      jobId = requestData?.jobId;
    } catch (e) {
      // No request body or invalid JSON, proceed with all pending jobs
    }
    
    // If jobId is provided, only get that specific job
    let jobsQuery = supabase
      .from('scrape_jobs')
      .select('*')
      .eq('is_active', true);
    
    if (jobId) {
      console.log(`Processing specific job: ${jobId}`);
      jobsQuery = jobsQuery.eq('id', jobId);
    } else {
      // Get jobs that are due to run (next_run_at <= current time)
      jobsQuery = jobsQuery.lte('next_run_at', new Date().toISOString());
    }
    
    // Order by next_run_at to prioritize most overdue jobs
    const { data: jobs, error: jobsError } = await jobsQuery.order('next_run_at');
    
    if (jobsError) {
      console.error("Error fetching scrape jobs:", jobsError);
      throw jobsError;
    }
    
    if (!jobs || jobs.length === 0) {
      console.log("No pending scrape jobs found.");
      return new Response(
        JSON.stringify({ success: true, message: "No pending scrape jobs" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Found ${jobs.length} jobs to process`);
    
    const results = [];
    
    // Process each job
    for (const job of jobs) {
      console.log(`Processing job: ${job.id} (${job.job_type}) for ${job.track_name}`);
      
      try {
        // Update job status to "running"
        await supabase
          .from('scrape_jobs')
          .update({ status: 'running' })
          .eq('id', job.id);
        
        let jobResult;
        
        // Execute the job based on its type
        switch (job.job_type) {
          case 'odds':
            jobResult = await scrapeOdds(job.url, job.track_name, supabase);
            break;
          case 'will_pays':
            jobResult = await scrapeWillPays(job.url, job.track_name, supabase);
            break;
          case 'results':
            jobResult = await scrapeResults(job.url, job.track_name, supabase);
            break;
          default:
            throw new Error(`Unknown job type: ${job.job_type}`);
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
          type: job.job_type, 
          success: true, 
          data: jobResult 
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
          type: job.job_type, 
          success: false, 
          error: error.message 
        });
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in scrape job runner:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});
