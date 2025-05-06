
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

// Function to scrape odds data
export async function scrapeOdds(url: string, trackName: string, supabase: any) {
  console.log(`Scraping odds from: ${url}`);
  
  try {
    // Fetch the HTML content
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract race number from URL or page content
    let raceNumber = 1;
    const raceMatch = url.match(/race-(\d+)/i);
    if (raceMatch && raceMatch[1]) {
      raceNumber = parseInt(raceMatch[1]);
    } else {
      // Try to find race number in the page
      const raceText = $('.race-info').text() || $('.race-number').text();
      const pageRaceMatch = raceText.match(/Race\s*(\d+)/i);
      if (pageRaceMatch && pageRaceMatch[1]) {
        raceNumber = parseInt(pageRaceMatch[1]);
      }
    }
    
    const raceDate = new Date().toISOString().split('T')[0];
    
    // Extract odds data
    const oddsData = [];
    $('.odds-table tr, .horse-entry').each((i, el) => {
      // Skip header row
      if (i === 0 && $(el).find('th').length > 0) return;
      
      const horseNumber = parseInt($(el).find('.horse-number, .pp').text().trim()) || i;
      const horseName = $(el).find('.horse-name, .entry-name').text().trim();
      const winOdds = $(el).find('.win-odds, .odds').text().trim();
      
      if (horseName) {
        const entry = {
          horse_number: horseNumber,
          horse_name: horseName,
          win_odds: winOdds,
          track_name: trackName,
          race_number: raceNumber,
          race_date: raceDate,
          pool_data: {}
        };
        
        // Extract additional pool data if available
        const poolData: any = {};
        $(el).find('td').each((j, td) => {
          const header = $('th').eq(j).text().trim().toLowerCase();
          const value = $(td).text().trim();
          if (header && value && !['pp', 'horse', 'odds'].includes(header)) {
            poolData[header] = value;
          }
        });
        
        if (Object.keys(poolData).length > 0) {
          entry.pool_data = poolData;
        }
        
        oddsData.push(entry);
      }
    });
    
    if (oddsData.length === 0) {
      throw new Error("No odds data found on the page");
    }
    
    console.log(`Found odds for ${oddsData.length} horses`);
    
    // Insert data into the database
    for (const entry of oddsData) {
      const { error } = await supabase
        .from('odds_data')
        .insert(entry);
      
      if (error) {
        console.error("Error inserting odds data:", error);
      }
    }
    
    return { count: oddsData.length, raceNumber, trackName };
    
  } catch (error) {
    console.error("Error scraping odds:", error);
    throw error;
  }
}
