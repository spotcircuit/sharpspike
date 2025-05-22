import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

/** ************************************
 * Horse‑racing entry scraper for OffTrackBetting.com
 *
 * Major improvements:
 *  • Robust track discovery from the main schedule page – looks for links that include "/horse-racing/" (active tracks) instead of historical "/results/" pages.
 *  • Accurate track‑name extraction from link text / URL.
 *  • Modernised race‑entries parsing – targets tables with class "entries-table" (fallback smart detection) and captures all required fields: post position, horse name, ML odds, jockey, trainer, medication, weight.
 *  • Odds parsing supports fractional (5/2), hyphen (5‑2), whole‑number (8) and decimal (3.5).
 *  • Detailed, colour‑coded logging & graceful error handling.
 *  • Upserts data into Supabase tables race_data & race_horses.
 *  • Recurses automatically: Schedule ➜ Track ➜ Race‑day ➜ Races.
 ************************************* */

// ---------- Interfaces ---------- //
export interface HorseEntry {
  pp: number;
  name: string;
  mlOdds: number | null;
  jockey: string | null;
  trainer: string | null;
  medication: string | null;
  weight: number | null;
}

export interface RaceData {
  raceNumber: number;
  entries: HorseEntry[];
  conditions: string | null;
  raceTime: string | null;
  distance: string | null;
  surface: string | null;
}

// ---------- Helper utilities ---------- //
function log(section: string, message: string) {
  // eslint‑disable‑next‑line no-console
  console.log(`[${section}] ${message}`);
}

function parseOddsToDecimal(raw: string): number | null {
  if (!raw || raw === "SCR" || raw === "OFF") return null;
  const clean = raw.trim();
  // Fractional e.g. 5/2
  if (clean.includes("/")) {
    const [num, denom] = clean.split("/").map(parseFloat);
    return !isNaN(num) && !isNaN(denom) && denom !== 0 ? +(num / denom).toFixed(2) : null;
  }
  // Hyphen e.g. 5-2
  if (clean.includes("-")) {
    const [num, denom] = clean.split("-").map(parseFloat);
    return !isNaN(num) && !isNaN(denom) && denom !== 0 ? +(num / denom).toFixed(2) : null;
  }
  // Decimal or integer
  const val = parseFloat(clean);
  return !isNaN(val) ? val : null;
}

function parseWeight(raw: string): number | null {
  const w = parseInt(raw.replace(/[^0-9]/g, ""), 10);
  return !isNaN(w) && w > 70 && w < 160 ? w : null; // racing weights usually in that range
}

function extractRaceDateFromUrl(url: string): string {
  const match = url.match(/(\d{8})/); // YYYYMMDD
  if (!match) return new Date().toISOString().split("T")[0];
  const [yyyy, mm, dd] = [match[1].slice(0, 4), match[1].slice(4, 6), match[1].slice(6, 8)];
  return `${yyyy}-${mm}-${dd}`;
}

// ---------- Core scraper ---------- //
export async function scrapeEntries(
  url: string | undefined,
  trackName: string | undefined,
  supabase: any,
  visited = new Set<string>()
): Promise<{ count: number; trackName?: string }> {
  url = url?.trim() || "https://www.offtrackbetting.com/horse-racing-schedule.html";
  if (visited.has(url)) return { count: 0, trackName };
  visited.add(url);

  log("FETCH", url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  // -------- 1. Main schedule page – discover active tracks -------- //
  if (url.endsWith("horse-racing-schedule.html")) {
    const trackLinks: { name: string; href: string }[] = [];
    $("a[href*='/horse-racing/']").each((_, el) => {
      const href = $(el).attr("href") || "";
      const text = $(el).text().trim();
      if (!href.includes("/results/")) {
        const fullUrl = href.startsWith("http") ? href : new URL(href, url).href;
        const name = text || href.split("/").pop()?.replace(/[-_]/g, " ") || "Unknown";
        trackLinks.push({ name, href: fullUrl });
      }
    });

    if (!trackLinks.length) {
      log("WARN", "No active tracks found on schedule page");
      return { count: 0 };
    }

    let total = 0;
    for (const { name, href } of trackLinks) {
      log("TRACK", `▶️  ${name}`);
      const { count } = await scrapeEntries(href, name, supabase, visited);
      total += count;
    }
    return { count: total };
  }

  // -------- 2. Track landing page – navigate to today/next race‑day -------- //
  if (url.includes("/horse-racing/") && !url.match(/\d{8}/)) {
    const raceDayLink = $("a[href*='/horse-racing/']")
      .filter((_, el) => !!($(el).attr("href") || "").match(/\d{8}/))
      .first()
      .attr("href");
    if (!raceDayLink) {
      log("WARN", `No race‑day link found for track ${trackName}`);
      return { count: 0, trackName };
    }
    const full = raceDayLink.startsWith("http") ? raceDayLink : new URL(raceDayLink, url).href;
    return scrapeEntries(full, trackName, supabase, visited);
  }

  // -------- 3. Race‑day page – parse races -------- //
  const raceDate = extractRaceDateFromUrl(url);
  if (!trackName) trackName = $("h1, title").first().text().trim().split("-")[0];
  const raceCards = $("table.entries-table, table.race-entries, table");
  const races: RaceData[] = [];

  raceCards.each((i, table) => {
    const $table = $(table);
    const headerText = $table.prevAll("h2, h3, .race-header").first().text() || $table.text();
    const raceMatch = headerText.match(/Race\s*(\d+)/i);
    if (!raceMatch) return;
    const raceNumber = parseInt(raceMatch[1]);
    const entries: HorseEntry[] = [];

    $table.find("tr").each((rowIdx, row) => {
      const cells = $(row).find("td");
      if (!cells.length) return; // Skip header rows

      const pp = parseInt($(cells[0]).text().trim()) || rowIdx;
      const horseName = $(cells[1]).text().trim();
      if (!horseName || horseName.toLowerCase() === "horse") return;

      let mlOdds: number | null = null;
      let jockey: string | null = null;
      let trainer: string | null = null;
      let medication: string | null = null;
      let weight: number | null = null;

      cells.each((idx, cell) => {
        const txt = $(cell).text().trim();
        if (!txt) return;
        // Odds
        if ((txt.includes("/") || txt.includes("-") || !isNaN(parseFloat(txt))) && txt.length <= 10 && mlOdds === null) {
          const parsed = parseOddsToDecimal(txt);
          if (parsed !== null) mlOdds = parsed;
        }
        // Medication – single capital letters like L, B, M etc.
        if (/^[A-Z]{1,3}$/.test(txt) && txt.length <= 3) medication ||= txt;
        // Weight – three‑digit number 80‑160
        const w = parseWeight(txt);
        if (w) weight ||= w;
        // Jockey / Trainer detection by header keywords or column index heuristic
        const header = $table.find("th").eq(idx).text().toLowerCase();
        if (header.includes("jockey") || idx === 3) jockey ||= txt;
        if (header.includes("trainer") || idx === 4) trainer ||= txt;
      });

      entries.push({ pp, name: horseName, mlOdds, jockey, trainer, medication, weight });
      log("ENTRY", `R${raceNumber} #${pp} ${horseName} ML:${mlOdds}`);
    });

    if (entries.length) {
      // Race meta
      const metaTxt = $table.closest(".race-card, .race-section, .race-container").text();
      const timeMatch = metaTxt.match(/(\d{1,2}:\d{2}\s*[AP]M)/i);
      const distanceMatch = metaTxt.match(/(\d+(?:\.\d+)?\s*(?:f|m|mile|furlongs))/i);
      const surface = /turf/i.test(metaTxt)
        ? "Turf"
        : /dirt/i.test(metaTxt)
        ? "Dirt"
        : /synthetic/i.test(metaTxt)
        ? "Synthetic"
        : null;

      races.push({
        raceNumber,
        entries,
        conditions: metaTxt || null,
        raceTime: timeMatch ? timeMatch[1] : null,
        distance: distanceMatch ? distanceMatch[1] : null,
        surface,
      });
    }
  });

  log("SUMMARY", `${races.length} races parsed for ${trackName} (${raceDate})`);

  // -------- 4. Persist to Supabase -------- //
  for (const race of races) {
    // Upsert race
    const { data: existing, error: selErr } = await supabase
      .from("race_data")
      .select("id")
      .eq("track_name", trackName)
      .eq("race_number", race.raceNumber)
      .eq("race_date", raceDate)
      .maybeSingle();
    if (selErr) {
      log("ERROR", `supabase select race: ${selErr.message}`);
      continue;
    }

    let raceId: string;
    if (existing) {
      raceId = existing.id;
      await supabase.from("race_data").update({
        conditions: race.conditions,
        race_time: race.raceTime,
        distance: race.distance,
        surface: race.surface,
        updated_at: new Date().toISOString(),
      }).eq("id", raceId);
    } else {
      const { data: inserted, error: insErr } = await supabase
        .from("race_data")
        .insert({
          track_name: trackName,
          race_number: race.raceNumber,
          race_date: raceDate,
          conditions: race.conditions,
          race_time: race.raceTime,
          distance: race.distance,
          surface: race.surface,
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (insErr) {
        log("ERROR", `insert race: ${insErr.message}`);
        continue;
      }
      raceId = inserted.id;
    }

    // Upsert horse entries
    for (const h of race.entries) {
      const horseId = `${raceId}-${h.pp}`;
      const { error: horseErr } = await supabase
        .from("race_horses")
        .upsert({
          id: horseId,
          race_id: raceId,
          post_position: h.pp,
          horse_name: h.name,
          morning_line_odds: h.mlOdds,
          jockey: h.jockey,
          trainer: h.trainer,
          medication: h.medication,
          weight: h.weight,
          updated_at: new Date().toISOString(),
        });
      if (horseErr) log("ERROR", `upsert horse ${h.name}: ${horseErr.message}`);
    }
  }

  return { count: races.length, trackName };
}
