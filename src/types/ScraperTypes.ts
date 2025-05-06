
export interface ScrapeJob {
  id: string;
  url: string;
  track_name: string;
  job_type: "odds" | "will_pays" | "results";
  status: "pending" | "running" | "completed" | "failed";
  last_run_at: string | null;
  next_run_at: string;
  interval_seconds: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface OddsData {
  id: string;
  track_name: string;
  race_number: number;
  race_date: string;
  horse_number: number;
  horse_name: string;
  win_odds: string;
  pool_data: any;
  scraped_at: string;
}

export interface ExoticWillPay {
  id: string;
  track_name: string;
  race_number: number;
  race_date: string;
  wager_type: string;
  combination: string;
  payout: number | null;
  is_carryover: boolean;
  carryover_amount: number | null;
  scraped_at: string;
}

export interface ScraperStats {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  oddsRecords: number;
  willPaysRecords: number;
  resultsRecords: number;
  lastExecutionTime: string | null;
}

export interface TrackOption {
  value: string;
  label: string;
}

export const JOB_TYPE_OPTIONS = [
  { value: "odds", label: "Race Odds" },
  { value: "will_pays", label: "Exotic Will Pays" },
  { value: "results", label: "Race Results" }
];

export const INTERVAL_OPTIONS = [
  { value: 30, label: "30 seconds" },
  { value: 60, label: "1 minute" },
  { value: 120, label: "2 minutes" },
  { value: 300, label: "5 minutes" },
  { value: 600, label: "10 minutes" },
  { value: 1800, label: "30 minutes" },
  { value: 3600, label: "1 hour" }
];

export const TRACK_OPTIONS: TrackOption[] = [
  { value: "CHURCHILL DOWNS", label: "Churchill Downs" },
  { value: "BELMONT PARK", label: "Belmont Park" },
  { value: "SANTA ANITA", label: "Santa Anita" },
  { value: "AQUEDUCT", label: "Aqueduct" },
  { value: "SARATOGA", label: "Saratoga" },
  { value: "GULFSTREAM", label: "Gulfstream Park" },
  { value: "DEL MAR", label: "Del Mar" },
  { value: "KEENELAND", label: "Keeneland" },
  { value: "OAKLAWN PARK", label: "Oaklawn Park" },
  { value: "NZ-HAWERA", label: "NZ-Hawera (TB)" }
];
