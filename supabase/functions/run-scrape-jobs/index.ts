
// Add type declarations for Deno modules
// @ts-ignore: Deno-specific imports
import "https://deno.land/x/xhr@0.1.0/mod.ts";
// @ts-ignore: Deno-specific imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno-specific imports
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
// @ts-ignore: Deno-specific imports
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";
import { corsHeaders, SUPABASE_URL, SUPABASE_ANON_KEY, OTB_BASE_URL, OTB_SCHEDULE_URL } from "./config.ts";
import { scrapeOdds } from "./scrape-odds.ts";
import { scrapeWillPays } from "./scrape-will-pays.ts";
import { scrapeResults } from "./scrape-results.ts";
import { scrapeEntries } from "./scrape-entries.ts";

// Function to discover active tracks from the main schedule page
async function discoverActiveTracks(supabase: any) {
  console.log("Discovering active tracks from schedule page...");
  const scheduleUrl = OTB_SCHEDULE_URL;
  
  try {
    const response = await fetch(scheduleUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch schedule page: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const trackLinks: { name: string; url: string }[] = [];
    
    // Use Cheerio to find active track links
    console.log("Looking for active track links...");
    
    // First, look for specific tracks mentioned in the "Bet Horse Racing with OTB" section
    $('h3:contains("Bet Horse Racing with OTB")').next('ul').find('a').each((i, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      
      // Extract track name from the link text
      let trackName = text;
      if (text.includes('at ')) {
        const parts = text.split('at ');
        if (parts.length > 1) {
          trackName = parts[1].split('-')[0].trim();
        }
      } else if (text.includes('|')) {
        const parts = text.split('|');
        if (parts.length > 0) {
          trackName = parts[0].replace('Bet', '').trim();
        }
      }
      
      // Skip results and news links
      if (!href.includes('/results/') && 
          !href.includes('/news/') && 
          trackName && 
          trackName.length > 0) {
        const fullUrl = href.startsWith('http') ? href : new URL(href, scheduleUrl).href;
        trackLinks.push({ name: trackName, url: fullUrl });
        console.log(`Found active track: ${trackName} (${fullUrl})`);
      }
    });
    
    // If no tracks found, try to find links to specific tracks in the page
    if (trackLinks.length === 0) {
      console.log("No tracks found in primary section, looking elsewhere...");
      
      // Look for track links in the main content
      $('a').each((i, el) => {
        const href = $(el).attr('href') || '';
        const text = $(el).text().trim();
        
        // Check for known track patterns
        if ((href.includes('/racetracks/') || 
             href.includes('/tracks/') || 
             href.includes('/santa-anita') || 
             href.includes('/belmont') || 
             href.includes('/saratoga') || 
             href.includes('/del-mar')) && 
            !href.includes('/results/')) {
          
          // Extract track name
          let trackName = text;
          if (!trackName || trackName.length === 0) {
            // Try to extract from URL
            const urlParts = href.split('/');
            const lastPart = urlParts[urlParts.length - 1];
            if (lastPart) {
              trackName = lastPart.replace(/-/g, ' ').replace('.html', '').trim();
              // Capitalize first letter of each word
              trackName = trackName.split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            }
          }
          
          if (trackName && trackName.length > 0) {
            const fullUrl = href.startsWith('http') ? href : new URL(href, scheduleUrl).href;
            trackLinks.push({ name: trackName, url: fullUrl });
            console.log(`Found track link: ${trackName} (${fullUrl})`);
          }
        }
      });
    }
    
    // Also look for links with '/horse-racing/' which indicate active tracks
    $('a[href*="/horse-racing/"]').each((i, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      
      // Skip results links
      if (!href.includes('/results/')) {
        // Extract track name
        let trackName = text;
        
        // If no text, try to extract from URL
        if (!trackName || trackName.length === 0) {
          const match = href.match(/\/horse-racing\/([\w-]+)/);
          if (match && match[1]) {
            trackName = match[1].replace(/-/g, ' ').trim();
            // Capitalize first letter of each word
            trackName = trackName.split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          }
        }
        
        if (trackName && trackName.length > 0) {
          const fullUrl = href.startsWith('http') ? href : new URL(href, scheduleUrl).href;
          
          // Check if this track is already in our list
          const exists = trackLinks.some(track => 
            track.name.toLowerCase() === trackName.toLowerCase() ||
            track.url === fullUrl
          );
          
          if (!exists) {
            trackLinks.push({ name: trackName, url: fullUrl });
            console.log(`Found active track link: ${trackName} (${fullUrl})`);
          }
        }
      }
    });
    
    // If still no tracks found, add some default tracks for testing
    if (trackLinks.length === 0) {
      console.log("No active tracks found on page, adding default tracks for testing...");
      
      // Add Santa Anita as a default track for testing
      trackLinks.push({
        name: "Santa Anita",
        url: `${OTB_BASE_URL}/racetracks/SA/santa_anita.html`
      });
      
      // Add Belmont Park as another default track
      trackLinks.push({
        name: "Belmont Park",
        url: `${OTB_BASE_URL}/racetracks/BEL/belmont_park.html`
      });
      
      console.log("Added default tracks for testing");
    }
    
    // Remove duplicates based on track name
    const uniqueTracks = trackLinks.filter((track, index, self) =>
      index === self.findIndex(t => t.name.toLowerCase() === track.name.toLowerCase())
    );
    
    console.log(`Found ${uniqueTracks.length} unique active tracks`);
    
    // Log the discovered tracks
    uniqueTracks.forEach(track => {
      console.log(`Active track: ${track.name} (${track.url})`);
      
      // Record this discovery in the scrape_attempts table for tracking
      supabase.from('scrape_attempts').insert({
        track_name: track.name,
        url: track.url,
        job_type: 'discovery',
        status: 'completed',
        created_at: new Date().toISOString()
      }).then(result => {
        if (result.error) {
          console.error(`Error recording discovery for ${track.name}:`, result.error);
        }
      });
    });
    
    return uniqueTracks;
  } catch (error) {
    console.error("Error discovering active tracks:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log("=== Starting scrape job runner ===");
    console.log("Checking for pending scrape jobs...");
    
    // Get request data
    const requestData = await req.json().catch(() => ({}));
    
    // Extract job specific details
    const jobId = requestData?.jobId;
    const jobType = requestData?.jobType;
    const trackName = requestData?.trackName;
    const url = requestData?.url;
    const forcedRun = requestData?.force === true;
    
    console.log(`Request data: ${JSON.stringify(requestData)}`);
    
    // Special case for discover-tracks - find all active tracks and scrape entries
    if (jobType === 'discover-tracks') {
      console.log(`Discovering active tracks and scraping entries`);
      try {
        // Call the discovery function
        const discoveredTracks = await discoverActiveTracks(supabase);
        console.log(`Discovered ${discoveredTracks.length} active tracks`);
        
        // For each discovered track, we can optionally scrape entries right away
        // Define the result type to fix type errors
        type ScrapeResult = {
          track: string;
          success: boolean;
          message?: string;
          error?: string;
          data?: any;
        };
        const scrapeResults: ScrapeResult[] = [];
        
        if (requestData.scrapeEntries === true) {
          console.log("Auto-scraping entries for discovered tracks...");
          
          for (const track of discoveredTracks) {
            try {
              // Generate URL for entries
              const trackSlug = track.name.toLowerCase().replace(/\s+/g, '-');
              const entriesUrl = `${OTB_BASE_URL}/tracks/${trackSlug}`;
              
              console.log(`Scraping entries for ${track.name}`);
              const result = await scrapeEntries(entriesUrl, track.name, supabase);
              
              scrapeResults.push({
                track: track.name,
                success: true,
                message: `Successfully scraped entries for ${track.name}`,
                data: result
              });
            } catch (error) {
              console.error(`Error scraping entries for ${track.name}:`, error);
              
              scrapeResults.push({
                track: track.name,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
              });
            }
          }
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            tracks: discoveredTracks,
            scrapeResults: scrapeResults.length > 0 ? scrapeResults : undefined
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error("Error during track discovery:", error);
        
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
    }
    
    // Special case for check-active-odds - find races within 40 minutes of post time and scrape their odds
    if (jobType === 'check-active-odds') {
      console.log("Checking for active races within 40 minutes of post time...");
      const now = new Date();
      const cutoffTime = new Date(now.getTime() + 40 * 60 * 1000); // 40 minutes from now
      
      try {
        // Get races that are scheduled to run within the next 40 minutes
        const { data: activeRaces, error: racesError } = await supabase
          .from('race_data')
          .select('*')
          .gte('race_time', now.toISOString())
          .lte('race_time', cutoffTime.toISOString())
          .order('race_time');
        
        if (racesError) {
          throw racesError;
        }
        
        console.log(`Found ${activeRaces?.length || 0} races within 40 minutes of post time`);
        
        if (activeRaces && activeRaces.length > 0) {
          // Define the result type to fix type errors
          type OddsResult = {
            track: string;
            race: number;
            success: boolean;
            message?: string;
            error?: string;
          };
          const oddsResults: OddsResult[] = [];
          
          // Scrape odds for each active race
          for (const race of activeRaces) {
            try {
              const trackSlug = race.track_name.toLowerCase().replace(/\s+/g, '-');
              const oddsUrl = `${OTB_BASE_URL}/tracks/${trackSlug}?raceNumber=${race.race_number}`;
              
              console.log(`Scraping odds for ${race.track_name} Race ${race.race_number}`);
              // Fix argument count by providing race number as an optional parameter
              const result = await scrapeOdds(oddsUrl, race.track_name, supabase);
              
              oddsResults.push({
                track: race.track_name,
                race: race.race_number,
                success: true,
                message: `Successfully scraped odds for ${race.track_name} Race ${race.race_number}`
              });
            } catch (error) {
              console.error(`Error scraping odds for ${race.track_name} Race ${race.race_number}:`, error);
              
              oddsResults.push({
                track: race.track_name,
                race: race.race_number,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
              });
            }
          }
          
          return new Response(
            JSON.stringify({ success: true, results: oddsResults }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: "No races found within 40 minutes of post time", 
              results: [] 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (error) {
        console.error("Error checking for active races:", error);
        
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
    }
    
    // Special case for entries scraping
    if (jobType === 'entries' && trackName && url) {
      console.log(`Manual entries scraping for ${trackName} from ${url}`);
      try {
        const entriesResult = await scrapeEntries(url, trackName, supabase);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Successfully scraped entries for ${trackName}`,
            data: entriesResult
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error(`Error scraping entries for ${trackName}:`, error);
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
    }
    
    // Special case for odds scraping
    if (jobType === 'odds' && trackName) {
      console.log(`Manual odds scraping for ${trackName}${url ? ` from ${url}` : ''}`);
      try {
        const oddsResult = await scrapeOdds(url || '', trackName, supabase);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Successfully scraped odds for ${trackName}`,
            data: oddsResult
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error(`Error scraping odds for ${trackName}:`, error);
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
    }
    
    // Special case for results scraping
    if (jobType === 'results' && trackName) {
      console.log(`Manual results scraping for ${trackName}${url ? ` from ${url}` : ''}`);
      try {
        const resultsResult = await scrapeResults(url || '', trackName, supabase);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Successfully scraped results for ${trackName}`,
            data: resultsResult
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error(`Error scraping results for ${trackName}:`, error);
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
    }
    
    // If jobId is provided, only get that specific job
    let jobsQuery = supabase
      .from('scrape_jobs')
      .select('*')
      .eq('is_active', true);
    
    if (jobId) {
      console.log(`Processing specific job: ${jobId}`);
      jobsQuery = jobsQuery.eq('id', jobId);
    } else if (!forcedRun) {
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
    
    console.log(`Found ${jobs.length} jobs to process: ${jobs.map(j => j.id).join(', ')}`);
    
    // Define the result type to fix type errors
    type JobResult = {
      id: string | number;
      type: string;
      track: string;
      success: boolean;
      message: string;
      data?: any;
      error?: any;
    };
    const results: JobResult[] = [];
    
    // Process each job
    for (const job of jobs) {
      console.log(`Processing job: ${job.id} (${job.job_type}) for ${job.track_name}`);
      console.log(`URL: "${job.url || 'No URL provided'}"`);
      
      try {
        // Generate default URL if none provided
        let jobUrl = job.url;
        if (!jobUrl || jobUrl.trim() === '') {
          // Generate a default URL based on track and job type
          const trackSlug = job.track_name.toLowerCase().replace(/\s+/g, '-');
          jobUrl = `${OTB_BASE_URL}/tracks/${trackSlug}`;
          console.log(`No URL provided, using default: ${jobUrl}`);
        }
        
        // Update job status to "running"
        await supabase
          .from('scrape_jobs')
          .update({ status: 'running' })
          .eq('id', job.id);
        
        let jobResult;
        
        // Execute the job based on its type
        switch (job.job_type) {
          case 'odds':
            console.log(`Scraping odds for ${job.track_name}`);
            jobResult = await scrapeOdds(jobUrl, job.track_name, supabase);
            break;
          case 'will_pays':
            console.log(`Scraping will-pays for ${job.track_name}`);
            jobResult = await scrapeWillPays(jobUrl, job.track_name, supabase);
            break;
          case 'results':
            console.log(`Scraping results for ${job.track_name}`);
            jobResult = await scrapeResults(jobUrl, job.track_name, supabase);
            break;
          case 'entries':
            console.log(`Scraping entries for ${job.track_name}`);
            jobResult = await scrapeEntries(jobUrl, job.track_name, supabase);
            break;
          case 'daily_schedule_scrape': // New job type
            console.log(`Processing daily_schedule_scrape job ${job.id}`);
            // Note: This job type typically does not use job.url or job.track_name from the scrape_jobs table
            // as scrape-daily-schedule has its own configured SCHEDULE_URL.
            const { data: scheduleScrapeData, error: scheduleScrapeError } = await supabase.functions.invoke(
              "scrape-daily-schedule", 
              { body: { /* No top-level params for scrape-daily-schedule currently */ } }
            );

            if (scheduleScrapeError) {
              console.error(`Error invoking scrape-daily-schedule for job ${job.id}:`, scheduleScrapeError.message);
              throw scheduleScrapeError; // Let the main catch block handle this as a job failure
            }

            let overallSuccess = true;
            let failureReason = "Daily schedule scrape completed but with issues.";

            if (scheduleScrapeData && Array.isArray(scheduleScrapeData.invocationSummary)) {
              if (scheduleScrapeData.invocationSummary.length === 0 && (scheduleScrapeData.message || "").includes("Processed 0 tracks")) {
                // This could be a success if no tracks were scheduled for the day.
                // However, if it's consistently 0, it might indicate an upstream issue with schedule page itself.
                // For now, treat as success but log a warning.
                console.warn(`Job ${job.id} (daily_schedule_scrape): scrape-daily-schedule reported 0 tracks processed. This might be normal or an issue with the source page.`);
              }
              for (const summary of scheduleScrapeData.invocationSummary) {
                if (summary.status === 'failed') {
                  overallSuccess = false;
                  failureReason = `One or more track scrapes failed. First failure: Track ${summary.trackName || 'Unknown'} - ${summary.error || 'Unknown error'}`;
                  console.warn(`Track ${summary.trackName || summary.trackId || 'Unknown'} failed during daily schedule scrape for job ${job.id}. Error: ${summary.error}`);
                  break; 
                }
              }
            } else if (!scheduleScrapeData || typeof scheduleScrapeData !== 'object') { 
              overallSuccess = false;
              failureReason = "scrape-daily-schedule returned no data or unexpected data format.";
              console.error(`Job ${job.id} (daily_schedule_scrape) failed: ${failureReason}. Data:`, scheduleScrapeData);
            }
            // Additional check: if invocationSummary is empty but the main message indicates tracks were processed,
            // it implies an issue with the invocation loop or response from scrape-track-races.
            else if (Array.isArray(scheduleScrapeData.invocationSummary) && 
                     scheduleScrapeData.invocationSummary.length === 0 && 
                     !(scheduleScrapeData.message || "").includes("Processed 0 tracks")) {
                overallSuccess = false;
                failureReason = `scrape-daily-schedule processed tracks but invocation summary is empty. Message: ${scheduleScrapeData.message}`;
                console.error(`Job ${job.id} (daily_schedule_scrape) failed: ${failureReason}`);
            }


            if (!overallSuccess) {
              console.error(`Daily schedule job ${job.id} determined as failed: ${failureReason}`);
              throw new Error(failureReason); // This will be caught by the outer try/catch
            }
            
            jobResult = scheduleScrapeData; // Store the summary from scrape-daily-schedule
            console.log(`Daily schedule job ${job.id} completed successfully.`);
            break;
          default:
            throw new Error(`Unknown job type: ${job.job_type}`);
        }
        
        // Calculate next run time
        const nextRunAt = new Date();
        nextRunAt.setSeconds(nextRunAt.getSeconds() + job.interval_seconds);
        
        console.log(`Job ${job.id} completed successfully. Next run at: ${nextRunAt.toISOString()}`);
        
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
          track: job.track_name,
          success: true, 
          data: jobResult,
          message: `Successfully scraped ${job.job_type} data for ${job.track_name}`
        });
        
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
        
        // Calculate next run time even for failed jobs
        const nextRunAt = new Date();
        nextRunAt.setSeconds(nextRunAt.getSeconds() + job.interval_seconds);
        
        console.log(`Job ${job.id} failed. Next run at: ${nextRunAt.toISOString()}`);
        
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
          track: job.track_name,
          success: false, 
          error: error.message,
          message: `Failed to scrape ${job.job_type} data for ${job.track_name}: ${error.message}`
        });
      }
    }
    
    console.log(`Job processing complete. Results: ${JSON.stringify(results)}`);
    
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
