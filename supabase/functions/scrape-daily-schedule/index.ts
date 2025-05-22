import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4';
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12';
import { corsHeaders, SUPABASE_URL, SUPABASE_ANON_KEY } from './config.ts';

const SCHEDULE_URL = 'https://www.offtrackbetting.com/horse-racing-schedule.html';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    });

    console.log('Fetching schedule from:', SCHEDULE_URL);
    const response = await fetch(SCHEDULE_URL);

    if (!response.ok) {
      console.error(`Failed to fetch schedule: ${response.status} ${response.statusText}`);
      return new Response(JSON.stringify({ error: 'Failed to fetch schedule' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const html = await response.text();
    // console.log('Fetched HTML:', html.substring(0, 1000) + '...'); // Log a snippet

    const $ = cheerio.load(html);

    // --- Determine Race Date ---
    let raceDateStr: string;
    let dateFoundOnPage = false;
    try {
      // Attempt to find date on the page, e.g., in a header
      // Example selector: $('h1.page-title, .schedule-date-header').first().text();
      // OTB.com has a <div class="page-header"><h1>Horse Racing Schedule for [Month Day, Year]</h1></div>
      const dateHeaderText = $('.page-header h1').first().text().trim();
      if (dateHeaderText) {
        const dateMatch = dateHeaderText.match(/Schedule for (.+)/i);
        if (dateMatch && dateMatch[1]) {
          const parsedDate = new Date(dateMatch[1]);
          // Check if parsedDate is valid
          if (!isNaN(parsedDate.getTime())) {
            raceDateStr = parsedDate.toISOString().split('T')[0];
            dateFoundOnPage = true;
            console.log(`Race date extracted from page: ${raceDateStr}`);
          } else {
            console.warn(`Could not parse date string from page: "${dateMatch[1]}"`);
          }
        }
      }
    } catch (e) {
      console.error("Error trying to extract date from page:", e.message);
    }

    if (!dateFoundOnPage) {
      raceDateStr = new Date().toISOString().split('T')[0];
      console.log(`Race date not found on page or parsing failed, using current server date: ${raceDateStr}`);
    }
    // --- End Determine Race Date ---

    const tracks: { name: string; url: string }[] = [];
    const baseUrl = 'https://www.offtrackbetting.com';

    // Try to find a schedule container, e.g., a div or table
    // Common selectors to try: $('table').first(), $('#schedule'), $('.schedule-container')
    // For offtrackbetting.com, schedule is often in <div class="panel panel-primary">
    // then inside <div class="panel-body">, then a <table>
    // Let's try a more specific selector based on observed structure, but fall back if needed.
    
    // Updated selector strategy:
    // The tracks are listed in <div class="col-xs-12 col-sm-4"> elements
    // within a <div class="row"> that is a sibling of <div class="page-header">
    // Each track link is an <a> tag directly inside these column divs.

    $('div.page-header + div.row div.col-xs-12.col-sm-4 a').each((_i, el) => {
      const linkElement = $(el);
      const trackName = linkElement.text().trim();
      let trackUrl = linkElement.attr('href');

      if (trackName && trackUrl) {
        if (trackUrl.startsWith('/')) {
          trackUrl = baseUrl + trackUrl;
        }
        tracks.push({ name: trackName, url: trackUrl });
      }
    });
    
    // Fallback if the primary selector yields no results
    if (tracks.length === 0) {
        console.log("Primary selector didn't find tracks, trying fallback: 'table.table-striped td a'");
        $('table.table-striped td a').each((_i, el) => {
          const linkElement = $(el);
          const trackName = linkElement.text().trim();
          let trackUrl = linkElement.attr('href');

          if (trackName && trackUrl) {
            // Filter out non-track links if possible (e.g., by URL structure)
            if (trackUrl.includes('/results/') || trackUrl.includes('/entries/')) {
                 if (trackUrl.startsWith('/')) {
                    trackUrl = baseUrl + trackUrl;
                }
                // Avoid duplicates if different links have the same name
                if (!tracks.some(t => t.name === trackName && t.url === trackUrl)) {
                     tracks.push({ name: trackName, url: trackUrl });
                }
            }
          }
        });
    }
    
    console.log('Extracted tracks from page:', tracks);

    let tracksWithIds: { id: string; name: string; url: string; }[] = [];

    if (tracks.length > 0) {
      const upsertData = tracks.map(track => ({
        name: track.name,
        scraped_url: track.url,
        last_seen_on_schedule: new Date().toISOString(),
      }));

      // Upsert tracks and select their names and ids
      const { data: upsertedTracksData, error: upsertError } = await supabaseClient
        .from('tracks')
        .upsert(upsertData, { onConflict: 'name' })
        .select('id, name, scraped_url'); // Ensure 'scraped_url' is selected to match 'url'

      if (upsertError) {
        console.error('Error upserting tracks to database:', upsertError.message);
      } else {
        console.log('Tracks successfully upserted to database.');
        // Match upsertedTracksData (which has id, name, scraped_url) back to the original tracks array structure
        // or directly use upsertedTracksData if it contains all necessary info.
        // For simplicity, we'll re-query to ensure we have the IDs for all tracks found on the page.
        
        const trackNames = tracks.map(t => t.name);
        const { data: fetchedTracks, error: fetchError } = await supabaseClient
            .from('tracks')
            .select('id, name, scraped_url')
            .in('name', trackNames);

        if (fetchError) {
            console.error('Error fetching track IDs after upsert:', fetchError.message);
        } else if (fetchedTracks) {
            // Map fetchedTracks (id, name, scraped_url) to tracksWithIds (id, name, url)
            tracksWithIds = fetchedTracks.map(ft => ({
                id: ft.id,
                name: ft.name,
                url: ft.scraped_url // use scraped_url as the 'url' for invocation
            }));
            console.log('Successfully fetched track IDs for invocation:', tracksWithIds.length, 'tracks matched.');
        }
      }
    }

    const invocationSummaries: { 
      trackName: string; 
      trackId?: string;
      status: 'success' | 'failed'; 
      racesFound?: number; 
      racesUpserted?: number;
      horsesUpserted?: number;
      message?: string;
      error?: string; 
    }[] = [];

    if (tracksWithIds.length > 0) {
      console.log(`\n--- Starting batch invocation of scrape-track-races for ${tracksWithIds.length} tracks ---`);
      for (const track of tracksWithIds) { // Use tracksWithIds here
        console.log(`Invoking scrape-track-races for track: ${track.name} (ID: ${track.id}), URL: ${track.url}, Date: ${raceDateStr}`);
        try {
          const { data: trackRaceData, error: invokeError } = await supabaseClient.functions.invoke(
            "scrape-track-races",
            // Pass trackId instead of trackName (though trackName is still useful for logging in the child function)
            { body: { trackId: track.id, trackName: track.name, trackUrl: track.url, raceDate: raceDateStr } }
          );

          if (invokeError) {
            console.error(`Error invoking scrape-track-races for ${track.name}: ${invokeError.message}`);
            invocationSummaries.push({
              trackName: track.name,
              trackId: track.id,
              status: 'failed',
              error: invokeError.message,
            });
          } else {
            // Assuming scrape-track-races now returns a more detailed summary
            const racesFound = trackRaceData?.races?.length || 0; // Original meaning: races identified in HTML
            const racesUpsertedCount = trackRaceData?.racesUpserted || 0;
            const horsesUpsertedCount = trackRaceData?.totalHorseEntriesUpserted || 0;
            const summaryMessage = trackRaceData?.summary || `Races found: ${racesFound}, Races upserted: ${racesUpsertedCount}, Horses upserted: ${horsesUpsertedCount}`;
            
            console.log(`Successfully invoked scrape-track-races for ${track.name}. ${summaryMessage}`);
            invocationSummaries.push({
              trackName: track.name,
              trackId: track.id,
              status: 'success',
              racesFound: racesFound, // Keep this if it means something different from upserted
              racesUpserted: racesUpsertedCount,
              horsesUpserted: horsesUpsertedCount,
              message: summaryMessage
            });
          }
        } catch (e) {
            console.error(`Critical error during functions.invoke for ${track.name} (ID: ${track.id}): ${e.message}`);
            invocationSummaries.push({
              trackName: track.name,
              trackId: track.id,
              status: 'failed',
              error: `Critical client-side error: ${e.message}`,
            });
        }
      }
      console.log(`--- Finished batch invocation of scrape-track-races ---\n`);
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${tracksWithIds.length} tracks from the schedule for date ${raceDateStr}.`,
        raceDateUsed: raceDateStr,
        invocationSummary: invocationSummaries,
        // Optionally, can still include the original tracks list if needed
        // tracks: tracks 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing request in scrape-daily-schedule:', error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
