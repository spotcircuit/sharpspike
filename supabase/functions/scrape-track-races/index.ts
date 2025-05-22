import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4';
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12';
import { corsHeaders, SUPABASE_URL, SUPABASE_ANON_KEY } from './config.ts';

console.log('scrape-track-races function booting up');

// Helper function to standardize time to HH:MM (24-hour format)
function standardizeTime(timeStr: string | null | undefined, trackName?: string): string | null {
  if (!timeStr) return null;
  let time = timeStr.toUpperCase().trim();
  let hours = -1; // Use -1 to indicate not yet parsed
  let minutes = -1;

  // Regex for HH:MM AM/PM, HH:MM, H:MM AM/PM, H:MM
  const pmMatch = time.match(/(\d{1,2}):(\d{2})\s*P\.?M\.?/); // Added optional periods
  const amMatch = time.match(/(\d{1,2}):(\d{2})\s*A\.?M\.?/); // Added optional periods
  const noAmPmMatch = time.match(/^(\d{1,2}):(\d{2})$/); // Stricter match for no AM/PM

  if (pmMatch) {
    hours = parseInt(pmMatch[1], 10);
    minutes = parseInt(pmMatch[2], 10);
    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return timeStr; // Invalid 12hr time
    if (hours !== 12) hours += 12;
  } else if (amMatch) {
    hours = parseInt(amMatch[1], 10);
    minutes = parseInt(amMatch[2], 10);
    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return timeStr; // Invalid 12hr time
    if (hours === 12) hours = 0; // Midnight case (12 AM is 00 hours)
  } else if (noAmPmMatch) {
    hours = parseInt(noAmPmMatch[1], 10);
    minutes = parseInt(noAmPmMatch[2], 10);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return timeStr; // Invalid 24hr time
    // Heuristic: If a time like "6:30" is received (no AM/PM), and it's a typical US racing site,
    // it's often PM. This is risky but can be a fallback.
    // For example, if hours < 8 (e.g. 1:00 to 7:59), assume PM.
    // This needs careful consideration based on typical race schedules.
    // For now, we'll assume it's already 24-hour or needs explicit AM/PM.
    // A more advanced version might take typical race hours for a track into account.
    // console.log(`Time for ${trackName} without AM/PM: ${timeStr}. Assuming 24-hour or already contextualized.`);
  } else {
    console.warn(`Could not parse time string: "${timeStr}" for track ${trackName}. Returning original.`);
    return timeStr; // Return original if not parsable by the main patterns
  }

  if (hours === -1 || minutes === -1) { // Should not happen if logic above is correct
      console.warn(`Time parsing logic error for: "${timeStr}" for track ${trackName}. Returning original.`);
      return timeStr;
  }
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// Helper function to parse odds
// Returns decimal odds, or special negative values for scratched/MTO
function parseOddsToDecimal(oddsString: string | null | undefined): number | null {
  if (!oddsString) return null;
  const upperOddsString = oddsString.toUpperCase().trim();

  if (upperOddsString === 'SCR' || upperOddsString === 'SCRATCHED') return -1; // Scratched indicator
  if (upperOddsString === 'MTO') return -2; // Main Track Only indicator
  if (upperOddsString === 'N/A' || upperOddsString === '---' || upperOddsString === '') return null;
  if (upperOddsString === 'EVEN' || upperOddsString === 'EVENS') return 1.0;

  if (upperOddsString.includes('/')) {
    const parts = upperOddsString.split('/');
    if (parts.length === 2) {
      const numerator = parseFloat(parts[0]);
      const denominator = parseFloat(parts[1]);
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        return numerator / denominator;
      }
    }
  } else if (upperOddsString.includes('-')) {
    const parts = upperOddsString.split('-');
    if (parts.length === 2) {
      const numerator = parseFloat(parts[0]);
      const denominator = parseFloat(parts[1]);
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        return numerator / denominator; // e.g. 8-5 is 8/5
      }
    }
  } else {
    const decimalVal = parseFloat(upperOddsString);
    if (!isNaN(decimalVal)) {
      return decimalVal;
    }
  }
  return null; // Cannot parse
}


serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Received request:', req.method, req.url);
    const body = await req.json();
    const trackId = body.trackId; // Expect UUID
    const trackUrl = body.trackUrl; 
    const trackName = body.trackName || 'Unknown Track'; // Still useful for logging
    const raceDate = body.raceDate; // Expect YYYY-MM-DD

    const missingParams = [];
    if (!trackId) missingParams.push('trackId');
    if (!trackUrl) missingParams.push('trackUrl');
    if (!raceDate) missingParams.push('raceDate');

    if (missingParams.length > 0) {
      console.error(`Missing required parameters: ${missingParams.join(', ')} in request body`);
      return new Response(JSON.stringify({ error: `Missing required parameters: ${missingParams.join(', ')}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    // Validate raceDate format (simple check for YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raceDate)) {
        console.error(`Invalid raceDate format: ${raceDate}. Expected YYYY-MM-DD.`);
        return new Response(JSON.stringify({ error: 'Invalid raceDate format. Expected YYYY-MM-DD.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
    // Basic UUID validation for trackId (does not check for v4 specifically)
    if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(trackId)) {
        console.error(`Invalid trackId format: ${trackId}. Expected UUID.`);
        return new Response(JSON.stringify({ error: 'Invalid trackId format. Expected UUID.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }


    console.log(`Processing request for track: ${trackName} (ID: ${trackId}), URL: ${trackUrl}, Date: ${raceDate}`);

    // Initialize Supabase client (not used in this step but good practice to have it ready)
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    });

    console.log('Fetching HTML from:', trackUrl);
    const response = await fetch(trackUrl);

    if (!response.ok) {
      console.error(`Failed to fetch HTML: ${response.status} ${response.statusText} from ${trackUrl}`);
      return new Response(JSON.stringify({ error: `Failed to fetch HTML: ${response.status}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      });
    }

    const html = await response.text();
    console.log(`Fetched HTML content of length: ${html.length} for ${trackName}`);
    
    const $ = cheerio.load(html);
    console.log(`Ready to parse races for ${trackName} from ${trackUrl}`);

    // This 'races' array will store the data extracted from HTML, before DB operations
    const parsedRacesFromHtml: {
      raceDate: string; 
      raceNumber: string;
      scheduledTime: string; 
      status: string;
      horses: {
        programNumber?: string;
        horseName?: string;
        jockey?: string;
        trainer?: string;
        odds?: number | null; // Corresponds to live_odds in DB
        finishingPosition?: string | number;
        payouts?: { win?: number; place?: number; show?: number } | string;
        scratched: boolean;
      }[];
    }[] = [];
    
    let racesUpsertedCount = 0;
    let totalHorseEntriesUpsertedCount = 0;

    // Strategy: Select potential elements for individual race entries
    const raceEntrySelectors = [
      'div.race-card',      // Common for a card-like display of a race
      'article.race-item',  // Semantic tag for a race item
      'li.race-entry',      // If races are in a list
      'tr.race-summary',    // If races are rows in a table
      'div.race',           // Generic div that might contain race info
      'div[class*="race-details"]', // Class name often implies race details
      'div[id*="race-"]:not(div[id*="races-container"])', // ID contains "race-", but not a general container
    ].join(', ');

    const raceEntries = $(raceEntrySelectors);
    console.log(`Found ${raceEntries.length} potential individual race entries for ${trackName}.`);

    raceEntries.each((i, el) => {
      const raceElement = $(el);
      let raceNumber: string | undefined;
      let rawScheduledTime: string | undefined; // Store the original time string
      let raceStatus: string = 'Unknown'; // Default status

      // --- Extract Race Number ---
      // (Existing logic for raceNumber extraction - keeping it concise here)
      let raceNumEl = raceElement.find('.race-number, .race-num, .race-title, .race-id, h3, h4, h5, strong').first();
      if (raceNumEl.length) {
        const numText = raceNumEl.text().trim();
        let match = numText.match(/Race\s*(\d+)/i); // "Race 1", "Race: 1"
        if (!match) match = numText.match(/R\s*(\d+)/i);    // "R1", "R 1"
        if (!match) match = numText.match(/^(\d+)$/);     // Just "1"
        if (match && match[1]) raceNumber = match[1];
      }

      // Attempt 2: If no specific element, check broader text within the race element for "Race X"
      if (!raceNumber) {
        const raceText = raceElement.text();
        const match = raceText.match(/Race\s*(\d+)/i);
        if (match && match[1]) raceNumber = match[1];
      }
      
      // Attempt 3: Check for elements with "race" in an attribute and a number inside
      // ... (assuming raceNumber extraction logic from previous step is here)
      let raceNumEl = raceElement.find('.race-number, .race-num, .race-title, .race-id, h3, h4, h5, strong').first();
      if (raceNumEl.length) {
        const numText = raceNumEl.text().trim();
        let match = numText.match(/Race\s*(\d+)/i);
        if (!match) match = numText.match(/R\s*(\d+)/i);
        if (!match) match = numText.match(/^(\d+)$/);
        if (match && match[1]) raceNumber = match[1];
      }
      if (!raceNumber) { /* ... other attempts ... */ }


      // --- Extract Scheduled Time ---
      // (Existing logic for scheduledTime extraction - keeping it concise here)
      let timeEl = raceElement.find('.race-time, .post-time, .scheduled-time, .time, .racetime').first();
      if (timeEl.length) {
        const timeText = timeEl.text().trim();
        const match = timeText.match(/\d{1,2}:\d{2}\s*(?:P\.?M\.?|A\.?M\.?)?/i); // Adjusted regex slightly
        if (match) rawScheduledTime = match[0];
      }

      // Attempt 2: Search all text nodes within the race element for a time pattern
      if (!rawScheduledTime) {
        // Iterate through direct text content of common tags or elements with 'time' in class/id
        raceElement.find('p, span, div, td, [class*="time"], [id*="time"]').each((_idx, textEl) => {
          const elementText = $(textEl).text().trim();
          const timeMatch = elementText.match(/\d{1,2}:\d{2}\s*(?:P\.?M\.?|A\.?M\.?)?/i);
          if (timeMatch && timeMatch[0]) {
            const context = $(textEl).parent().text().toLowerCase();
            if (context.includes('post time') || context.includes('scheduled') || $(textEl).is('[class*="time"]')) {
                 rawScheduledTime = timeMatch[0];
                 return false; 
            }
            if(!rawScheduledTime) rawScheduledTime = timeMatch[0]; 
          }
        });
      }
      
      // Attempt 3: Check for time in attributes (e.g. data-time)
      if (!rawScheduledTime) {
        const timeAttr = raceElement.find('[data-time]').first().attr('data-time');
        if (timeAttr) {
            const match = timeAttr.match(/\d{1,2}:\d{2}\s*(?:P\.?M\.?|A\.?M\.?)?/i);
            if (match) rawScheduledTime = match[0];
        }
      }
      // ... (assuming scheduledTime extraction logic from previous step is here, sets rawScheduledTime)

      // If basic details aren't found, skip this entry
      if (!raceNumber || !rawScheduledTime) {
        // console.log(`Skipping entry ${i + 1} due to missing race number or time. R#${raceNumber} T:${rawScheduledTime}`);
        return; // Skips to the next raceEntry
      }
      
      const standardizedScheduledTime = standardizeTime(rawScheduledTime, trackName);
      if (!standardizedScheduledTime) {
        console.warn(`Could not standardize time "${rawScheduledTime}" for Race ${raceNumber} at ${trackName}. Skipping race.`);
        return; // Skip if time cannot be standardized
      }

      // --- Determine Race Status ---
      const raceTextContent = raceElement.text().toLowerCase();
      if (raceTextContent.includes('official')) raceStatus = 'Official';
      else if (raceTextContent.includes('unofficial')) raceStatus = 'Unofficial';
      else if (raceTextContent.includes('result')) raceStatus = 'Results Available'; // Could be official or unofficial
      else if (raceTextContent.includes('live')) raceStatus = 'Live';
      else if (raceTextContent.includes('canceled') || raceTextContent.includes('cancelled')) raceStatus = 'Canceled';
      
      const currentRaceHorses: typeof races[0]['horses'] = [];

      // --- Iterate Over Horse Entries ---
      const horseEntrySelectors = [
        'tr.horse-row', 'tr.entry',                 // Table rows for horses
        'li.horse-entry', 'li.entry',               // List items for horses
        'div.horse-card', 'div.entry',              // Divs for horses
        'table tbody tr',                           // More generic table rows if others fail
        'div[class*="horse"], div[class*="runner"]' // Generic divs with class containing horse/runner
      ].join(', ');
      
      raceElement.find(horseEntrySelectors).each((horseIdx, horseEl) => {
        const horseElement = $(horseEl);
        let programNumber, horseName, jockey, trainer, oddsDecimal, finishingPosition, payouts;
        let scratched = false;

        // Program Number
        let progEl = horseElement.find('.program-number, .post-position, .pp, .entry-num').first();
        if (!progEl.length) progEl = horseElement.find('td').first(); // First cell
        programNumber = progEl.text().trim().replace(/\.$/, ''); // Remove trailing dot if any

        // Horse Name
        let nameEl = horseElement.find('.horse-name, .entry-name, .runner-name').first();
        horseName = nameEl.text().trim();
        if (!horseName && progEl.length) { // If specific name class not found, try next cell to program number
            horseName = progEl.next().text().trim();
        }


        // Jockey
        let jockeyEl = horseElement.find('.jockey, .jockey-name, .jky').first();
        jockey = jockeyEl.text().trim();

        // Trainer
        let trainerEl = horseElement.find('.trainer, .trainer-name, .trn').first();
        trainer = trainerEl.text().trim();

        // Odds
        let oddsEl = horseElement.find('.odds, .win-odds, .current-odds, .price').first();
        const oddsRaw = oddsEl.text().trim();
        oddsDecimal = parseOddsToDecimal(oddsRaw);
        if (oddsDecimal === -1 || oddsDecimal === -2) { // SCR or MTO
          scratched = true;
          oddsDecimal = null; // Store null for odds if scratched/MTO
        }
        
        // Finishing Position (only if status might be concluded)
        if (raceStatus.includes('Official') || raceStatus.includes('Unofficial') || raceStatus.includes('Result')) {
            let finishEl = horseElement.find('.finish-position, .pos, .result-pos').first();
            if (!finishEl.length) finishEl = horseElement.find('td').eq(0); // Often first cell in results
             // Check if the first cell contains a number (could be program or position)
            const firstCellText = horseElement.find('td').eq(0).text().trim();
            if (/^\d+$/.test(firstCellText)) { // It's a number
                // If program number was already found and different, this might be position
                if (programNumber && firstCellText !== programNumber && firstCellText.length <= 2) {
                    finishingPosition = firstCellText;
                } else if (!programNumber && firstCellText.length <=2) { // If prog wasn't found, this might be it or pos
                     // Heuristic: if it's a small number, could be position.
                    finishingPosition = firstCellText; // Could be overridden if programNumber also matches this
                }
            }
            if (!finishingPosition && finishEl.length) finishingPosition = finishEl.text().trim();

            // Basic Payouts (Win only for simplicity, can be expanded)
            // This is highly variable. Look for cells with '$'
            horseElement.find('td').each((_k, cell) => {
                const cellText = $(cell).text().trim();
                if (cellText.startsWith('$') && (finishingPosition === '1' || finishingPosition === 1 )) {
                    const winPayout = parseFloat(cellText.replace('$', ''));
                    if (!isNaN(winPayout)) {
                        payouts = { win: winPayout };
                        return false; // found win payout for the winner
                    }
                }
            });
        }
        
        // If no specific status, try to infer
        if (raceStatus === 'Unknown') {
            if (finishingPosition || payouts) raceStatus = 'Concluded';
            else if (oddsDecimal !== null && oddsDecimal > 0) raceStatus = 'Upcoming';
        }


        // Only add horse if we have at least program number and name
        if (programNumber && horseName) {
          currentRaceHorses.push({
            programNumber,
            horseName,
            jockey: jockey || undefined,
            trainer: trainer || undefined,
            odds: oddsDecimal,
            finishingPosition: finishingPosition || undefined,
            payouts: payouts || undefined,
            scratched,
          });
        }
      }); // End of horse entries loop

      // After processing all horses for a race, if status is still Unknown, set to Scheduled
      if (raceStatus === 'Unknown' && currentRaceHorses.length > 0) {
          raceStatus = 'Scheduled';
      }


      // Add the parsed race to the temporary array
      parsedRacesFromHtml.push({
        raceDate: raceDate,
        raceNumber,
        scheduledTime: standardizedScheduledTime,
        status: raceStatus,
        horses: currentRaceHorses,
      });
      console.log(`Parsed from HTML: Race Date=${raceDate}, R#${raceNumber}, Time=${standardizedScheduledTime}, S:${raceStatus}, Horses:${currentRaceHorses.length} for ${trackName}`);
    }); // End of HTML parsing race entries loop

    // --- Database Operations ---
    for (const parsedRace of parsedRacesFromHtml) {
      const raceDataToUpsert = {
        track_id: trackId,
        race_date: parsedRace.raceDate,
        race_number: parsedRace.raceNumber,
        scheduled_time_local: parsedRace.scheduledTime, // Already HH:MM
        status: parsedRace.status,
        // conditions: null, // Not scraped yet
        // results_info: null, // Not scraped yet
      };

      const { data: upsertedRace, error: raceUpsertError } = await supabaseClient
        .from('races')
        .upsert(raceDataToUpsert, { onConflict: 'track_id, race_date, race_number' })
        .select('id')
        .single(); // We expect one row back

      if (raceUpsertError) {
        console.error(`Error upserting race R#${parsedRace.raceNumber} for track ${trackId} on ${parsedRace.raceDate}: ${raceUpsertError.message}`);
        continue; // Skip to next race if this one fails
      }

      if (!upsertedRace || !upsertedRace.id) {
        console.error(`Failed to get ID for upserted race R#${parsedRace.raceNumber} for track ${trackId} on ${parsedRace.raceDate}.`);
        continue;
      }
      racesUpsertedCount++;
      const raceId = upsertedRace.id;
      let horseEntriesForThisRaceUpserted = 0;

      for (const horse of parsedRace.horses) {
        const horseDataToUpsert = {
          race_id: raceId,
          program_number: horse.programNumber,
          horse_name: horse.horseName,
          jockey: horse.jockey,
          trainer: horse.trainer,
          live_odds: horse.odds, // This is decimal odds from parseOddsToDecimal
          // morning_line_odds: null, // Not scraped yet
          finishing_position: horse.finishingPosition ? parseInt(horse.finishingPosition.toString(), 10) : null,
          scratched: horse.scratched,
          payouts: horse.payouts ? horse.payouts : null, // Ensure it's null if undefined
        };

        const { error: horseUpsertError } = await supabaseClient
          .from('race_horse_entries')
          .upsert(horseDataToUpsert, { onConflict: 'race_id, program_number' });

        if (horseUpsertError) {
          console.error(`Error upserting horse ${horse.programNumber} for race ${raceId}: ${horseUpsertError.message}`);
        } else {
          horseEntriesForThisRaceUpserted++;
        }
      }
      totalHorseEntriesUpsertedCount += horseEntriesForThisRaceUpserted;
      console.log(`Upserted ${horseEntriesForThisRaceUpserted} horse entries for race R#${parsedRace.raceNumber} (DB ID: ${raceId})`);
    }
    // --- End Database Operations ---

    const summaryMessage = `Track ${trackName} (ID: ${trackId}) on ${raceDate}: Processed ${parsedRacesFromHtml.length} races from HTML. Upserted ${racesUpsertedCount} races and ${totalHorseEntriesUpsertedCount} horse entries.`;
    console.log(summaryMessage);

    return new Response(
      JSON.stringify({
        trackId,
        trackName, // Keep for context
        trackUrl,  // Keep for context
        raceDate,
        summary: summaryMessage,
        racesParsedFromHtml: parsedRacesFromHtml.length, // How many were identified in HTML
        racesUpserted: racesUpsertedCount,
        totalHorseEntriesUpserted: totalHorseEntriesUpsertedCount,
        races: parsedRacesFromHtml, // Return the originally parsed data for the caller's reference
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error(`Error processing request for track ID ${body.trackId} on ${body.raceDate}:`, error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
