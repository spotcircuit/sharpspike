
export interface RaceResult {
  id: string;
  track_name: string;
  race_number: number;
  race_date: string;
  results_data: any;
  source_url?: string;
  created_at: string;
  odds_data?: OddsPulseData; // Added to store odds data without changing schema
}

// New types for Odds Pulse API integration
export interface OddsPulseData {
  timestamp: string;
  source: string;
  track_id: string;
  race_number: number;
  odds_data: HorseOdds[];
}

export interface HorseOdds {
  horse_id: string;
  horse_name: string;
  program_number: string;
  morning_line?: number;
  current_odds: number;
  odds_history?: OddsHistoryEntry[];
}

export interface OddsHistoryEntry {
  timestamp: string;
  odds: number;
}
