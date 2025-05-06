
// Define all type interfaces
export interface Horse {
  id: number;
  pp: number;
  name: string;
  isFavorite?: boolean;
  liveOdds: number;
  mlOdds?: number;
  modelOdds: number;
  difference: number;
  jockey?: string;
  trainer?: string;
  jockeyWinPct?: number;
  trainerWinPct?: number;
  fireNumber?: number;
  irregularBetting?: boolean;
  hFactors?: {
    speed?: boolean;
    pace?: boolean;
    form?: boolean;
    class?: boolean;
  };
}

export interface PoolData {
  number: number;
  odds: string;
  win: number;
  place: number;
  show: number;
}

export interface ExoticPool {
  name: string;
  amount: number;
}

export interface PaceData {
  name: string;
  early: number;
  middle: number;
  late: number;
}

export interface SharpMove {
  horse: string;
  timestamp: string;
  amount: number;
  oldOdds: string;
  newOdds: string;
  direction: 'up' | 'down';
}

export interface BettingDataPoint {
  time: string;
  volume: number;
  timestamp: number;
  isSpike?: boolean;
  runner1?: number;
  runner2?: number;
  runner3?: number;
  runner4?: number;
  runner5?: number;
  runner6?: number;
  runner1Odds?: number;
  runner2Odds?: number;
  runner3Odds?: number;
  runner4Odds?: number;
  runner5Odds?: number;
  runner6Odds?: number;
}

export interface TrainingFigure {
  horse: string;
  date: string;
  figure: number;
  track: string;
  distance: string;
  improvement: number;
}

export interface TrackStatistics {
  totalRaces: number;
  frontRunnerWin: number;
  pressersWin: number;
  midPackWin: number;
  closersWin: number;
  frontRunnerPercentage: number;
  pressersPercentage: number;
  midPackPercentage: number;
  closersPercentage: number;
}

export interface PostPosition {
  position: number;
  count: number;
  percentage: number;
}

export interface TrackTiming {
  distance: string;
  bestTime: string;
  averageTime: string;
}

export interface HorseComment {
  name: string;
  comment: string;
}

// New interfaces for paddock comments and AI-Thorian
export interface PaddockComment {
  timestamp: string;
  horse: string;
  comment: string;
}

export interface ValuePick {
  horse: string;
  odds: string;
  value: number;
  confidence: number;
}

export interface PickCombination {
  combination: string;
  probability: number;
  payout: string;
}

// New type for PDF extraction data
export interface PDFExtractionResult {
  success: boolean;
  horses?: Horse[];
  trackName?: string;
  raceNumber?: number;
  error?: string;
}
