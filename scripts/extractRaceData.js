import { fileURLToPath } from "url";
import cheerio from 'cheerio';

/**
 * Extracts horse race data from an OffTrackBetting race page.
 * @param {string} url - URL of the race page.
 * @returns {Promise<Array<{place: string, horse: string, odds: string}>>}
 */
export async function extractRaceData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const results = [];

  // Attempt to parse standard result tables
  $('table tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length >= 3) {
      const place = $(cells[0]).text().trim();
      const horse = $(cells[1]).text().trim();
      const odds = $(cells[2]).text().trim();
      if (place && horse && odds) {
        results.push({ place, horse, odds });
      }
    }
  });

  // Fallback: parse list formatted results
  if (results.length === 0) {
    $('.finish-order li').each((_, li) => {
      const text = $(li).text().trim();
      const match = text.match(/^(\d+)\.\s+([^\-]+)\s+-?\s*(\S+)/);
      if (match) {
        results.push({ place: match[1], horse: match[2].trim(), odds: match[3] });
      }
    });
  }

  return results;
}

// CLI usage
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const target = process.argv[2];
  if (!target) {
    console.error('Usage: node scripts/extractRaceData.js <race_url>');
    process.exit(1);
  }
  extractRaceData(target)
    .then(data => console.log(JSON.stringify(data, null, 2)))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
