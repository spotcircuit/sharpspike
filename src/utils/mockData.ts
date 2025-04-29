import { formatTime } from './formatters';

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

// Generate mock horse data
const generateHorses = (): Horse[] => {
  const horses = [
    { 
      id: 1, 
      pp: 1, 
      name: 'Dark Horse', 
      liveOdds: 12.81, 
      mlOdds: 15.00,
      modelOdds: 10.58, 
      difference: 2.23, 
      isFavorite: false,
      jockey: "K. Carmouche",
      trainer: "C. Brown",
      hFactors: { speed: true, form: true }
    },
    { 
      id: 2, 
      pp: 2, 
      name: 'Silver Streak', 
      liveOdds: 2.87, 
      mlOdds: 2.50,
      modelOdds: 2.54, 
      difference: 0.37, 
      isFavorite: true,
      jockey: "J. Rosario",
      trainer: "T. Pletcher",
      hFactors: { speed: true, pace: true, class: true }
    },
    { 
      id: 3, 
      pp: 3, 
      name: 'Fast Lane', 
      liveOdds: 3.13, 
      mlOdds: 3.00,
      modelOdds: 2.90, 
      difference: 0.23, 
      isFavorite: true,
      jockey: "F. Prat",
      trainer: "B. Cox",
      hFactors: { pace: true, form: true }
    },
    { 
      id: 4, 
      pp: 4, 
      name: 'Wind Chaser', 
      liveOdds: 15.22, 
      mlOdds: 12.00,
      modelOdds: 12.78, 
      difference: 2.41, 
      isFavorite: false,
      jockey: "J. Velazquez",
      trainer: "S. Asmussen",
      hFactors: { form: true }
    },
    { 
      id: 5, 
      pp: 5, 
      name: 'Golden Arrow', 
      liveOdds: 7.31, 
      mlOdds: 8.00,
      modelOdds: 8.00, 
      difference: -0.69, 
      isFavorite: false,
      jockey: "I. Ortiz Jr.",
      trainer: "W. Mott",
      hFactors: { speed: true, class: true }
    },
    { 
      id: 6, 
      pp: 6, 
      name: 'Midnight Runner', 
      liveOdds: 8.45, 
      mlOdds: 10.00,
      modelOdds: 9.32, 
      difference: -0.87, 
      isFavorite: false,
      jockey: "L. Saez",
      trainer: "D. Romans",
      hFactors: { pace: true }
    },
    { 
      id: 7, 
      pp: 7, 
      name: 'Thunder Bolt', 
      liveOdds: 5.39, 
      mlOdds: 6.00,
      modelOdds: 5.80, 
      difference: -0.41, 
      isFavorite: false,
      jockey: "J. Castellano",
      trainer: "C. McGaughey",
      hFactors: { speed: true, form: true, class: true }
    },
    { 
      id: 8, 
      pp: 8, 
      name: 'Lightning Flash', 
      liveOdds: 9.61, 
      mlOdds: 8.00,
      modelOdds: 11.30, 
      difference: -1.69, 
      isFavorite: false,
      jockey: "T. Gaffalione",
      trainer: "M. Maker",
      hFactors: { pace: true, form: true }
    },
  ];
  
  return horses;
};

// Generate pool data
const generatePoolData = (): PoolData[] => {
  return [
    { number: 1, odds: '46', win: 21462, place: 22383, show: 21978 },
    { number: 2, odds: '11', win: 33263, place: 31046, show: 22425 },
    { number: 3, odds: '20', win: 35934, place: 33194, show: 21697 },
    { number: 5, odds: '11', win: 33263, place: 31046, show: 22425 },
    { number: 6, odds: '19', win: 32185, place: 31512, show: 21978 },
    { number: 7, odds: '9/2', win: 321136, place: 39419, show: 39211 },
    { number: 8, odds: '8', win: 131219, place: 89576, show: 68411 },
    { number: 10, odds: '8', win: 131219, place: 89576, show: 68411 }
  ];
};

// Generate exotic pools data
const generateExoticPools = (): ExoticPool[] => {
  return [
    { name: '$2 Exacta', amount: 156634 },
    { name: '$1 Trifecta', amount: 183366 },
    { name: '$1 Superfecta', amount: 89388 },
    { name: '$1 Super High 5', amount: 22606 },
    { name: '$1 Double', amount: 32301 },
    { name: '$1 Pick 3', amount: 32337 },
    { name: '$1 Pick 5', amount: 74869 }
  ];
};

// Generate pace data
const generatePaceData = (): PaceData[] => {
  return [
    { name: 'Fast Lane', early: 0, middle: 7, late: 6 },
    { name: 'Thunder Bolt', early: 8, middle: 0, late: 8 },
    { name: 'Silver Streak', early: 2, middle: 0, late: 0 },
    { name: 'Golden Arrow', early: 0, middle: 8, late: 0 },
    { name: 'Dark Horse', early: 5, middle: 8, late: 10 },
    { name: 'Lightning Flash', early: 0, middle: 4, late: 3 },
    { name: 'Wind Chaser', early: 4, middle: 8, late: 0 }
  ];
};

// Generate sharp movement data
const generateSharpMovements = (): SharpMove[] => {
  return [
    { 
      horse: 'Fast Lane', 
      timestamp: '12:45:15', 
      amount: 12500, 
      oldOdds: '3.40', 
      newOdds: '3.20', 
      direction: 'down' 
    },
    { 
      horse: 'Silver Streak', 
      timestamp: '12:52:42', 
      amount: 8700, 
      oldOdds: '3.00', 
      newOdds: '2.80', 
      direction: 'down' 
    },
    { 
      horse: 'Golden Arrow', 
      timestamp: '12:58:11', 
      amount: 5400, 
      oldOdds: '6.90', 
      newOdds: '7.30', 
      direction: 'up' 
    },
    { 
      horse: 'Wind Chaser', 
      timestamp: '13:02:52', 
      amount: 3300, 
      oldOdds: '15.50', 
      newOdds: '15.00', 
      direction: 'down' 
    }
  ];
};

// Generate betting timeline data
const generateBettingTimeline = (): BettingDataPoint[] => {
  const now = new Date();
  const data: BettingDataPoint[] = [];
  
  // Generate data points for the last 30 minutes with 2 minute intervals
  for (let i = 0; i < 15; i++) {
    const time = new Date(now.getTime() - (30 - i * 2) * 60000);
    const timestamp = time.getTime();
    const timeStr = `${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`;
    
    // Base volume with some randomness
    const volume = Math.round(5000 + Math.random() * 15000);
    
    // Generate runner positions and odds
    const runner1 = Math.floor(Math.random() * 6) + 1;
    const runner2 = Math.floor(Math.random() * 6) + 1;
    const runner3 = Math.floor(Math.random() * 6) + 1;
    const runner4 = Math.floor(Math.random() * 6) + 1;
    const runner5 = Math.floor(Math.random() * 6) + 1;
    const runner6 = Math.floor(Math.random() * 6) + 1;
    
    // Generate odds (starting around 2.0-15.0 with small fluctuations)
    const baseOdds = {
      runner1: 8.0,
      runner2: 4.5,
      runner3: 11.0,
      runner4: 15.0,
      runner5: 9.0,
      runner6: 2.2,
    };
    
    const oddsVariation = 0.3; // Maximum variation per time period
    
    data.push({ 
      time: timeStr,
      volume,
      timestamp,
      isSpike: false,
      runner1,
      runner2,
      runner3,
      runner4,
      runner5,
      runner6,
      runner1Odds: baseOdds.runner1 + (Math.random() * oddsVariation * 2 - oddsVariation) * i,
      runner2Odds: baseOdds.runner2 + (Math.random() * oddsVariation * 2 - oddsVariation) * i,
      runner3Odds: baseOdds.runner3 + (Math.random() * oddsVariation * 2 - oddsVariation) * i,
      runner4Odds: baseOdds.runner4 + (Math.random() * oddsVariation * 2 - oddsVariation) * i,
      runner5Odds: baseOdds.runner5 + (Math.random() * oddsVariation * 2 - oddsVariation) * i,
      runner6Odds: baseOdds.runner6 + (Math.random() * oddsVariation * 2 - oddsVariation) * i,
    });
  }
  
  // Add spikes at specific points
  const spikeIndices = [4, 9, 13]; // Spikes at these positions
  spikeIndices.forEach(index => {
    if (data[index]) {
      // Make this a spike with significantly higher volume
      data[index].volume = Math.round(data[index].volume * (2 + Math.random()));
      data[index].isSpike = true;
    }
  });
  
  return data;
};

// Generate training figures
const generateTrainingFigures = (): TrainingFigure[] => {
  return [
    {
      horse: 'Silver Streak',
      date: '04/20/25',
      figure: 94,
      track: 'Saratoga',
      distance: '5f',
      improvement: 7
    },
    {
      horse: 'Dark Horse',
      date: '04/18/25',
      figure: 89,
      track: 'Belmont',
      distance: '6f',
      improvement: 5
    },
    {
      horse: 'Fast Lane',
      date: '04/22/25',
      figure: 91,
      track: 'Churchill',
      distance: '7f',
      improvement: 3
    },
    {
      horse: 'Thunder Bolt',
      date: '04/19/25',
      figure: 85,
      track: 'Aqueduct',
      distance: '4f',
      improvement: 2
    },
    {
      horse: 'Golden Arrow',
      date: '04/21/25',
      figure: 78,
      track: 'Keeneland',
      distance: '5f',
      improvement: -2
    },
    {
      horse: 'Wind Chaser',
      date: '04/17/25',
      figure: 72,
      track: 'Pimlico',
      distance: '6f',
      improvement: -1
    }
  ];
};

// Generate track profile data
const generateTrackProfile = () => {
  return {
    statistics: {
      totalRaces: 19,
      frontRunnerWin: 7,
      pressersWin: 3,
      midPackWin: 7,
      closersWin: 2,
      frontRunnerPercentage: 36.8,
      pressersPercentage: 15.8,
      midPackPercentage: 36.8,
      closersPercentage: 10.5,
    },
    postPositions: [
      { position: 1, count: 3, percentage: 15.8 },
      { position: 2, count: 2, percentage: 10.5 },
      { position: 3, count: 1, percentage: 5.3 },
      { position: 4, count: 2, percentage: 10.5 },
      { position: 5, count: 4, percentage: 21.1 },
      { position: 6, count: 0, percentage: 0 },
      { position: 7, count: 3, percentage: 15.8 },
      { position: 8, count: 1, percentage: 5.3 },
    ],
    timings: [
      { distance: '6f', bestTime: '1:09.2', averageTime: '1:11.5' },
      { distance: '1m', bestTime: '1:35.7', averageTime: '1:37.2' },
      { distance: '1 1/8m', bestTime: '1:48.4', averageTime: '1:50.6' },
    ],
  };
};

// Generate horse comments
const generateHorseComments = () => {
  return [
    {
      name: "Gold Search",
      comment: "Gold Search is ideally positioned for a stalk-and-pounce trip. Foley works of note, he looks tough to endorse, has a good record of 18% with horses dropping in class, and this colt's top-ranked FIRE and Fast Fig make him a solid threat."
    },
    {
      name: "Rivalry",
      comment: "Rivalry cuts back to a sprint for the third start off the layoff. He's previously faced much tougher, and today's lower level combined with a sharp early pace figures positions him as a serious late threat."
    },
    {
      name: "Beer With Ice",
      comment: "Son of A Giant figures to lead early but couldn't outfinish softer at Turfway. Recent upward class moves have not helped his cause, and despite decent early speed figures, he looks vulnerable late."
    },
    {
      name: "Quebrancho",
      comment: "Quebrancho is questionable at this distance, having never recently contested a similar sprint. Trainer Bahena's stable's decent recent results but his horse needs considerable improvement."
    },
    {
      name: "Dancing Noah",
      comment: "Dancing Noah has limited sprint experience and no meaningful recent trainer stats. His efforts have been mediocre, and improvement would be needed."
    },
    {
      name: "More Than Five",
      comment: "More Than Five boasts decent recent performances against tougher and has strong figures to back him. Garcia's respectable dirt figures further strengthens his case as a solid contender."
    }
  ];
};

// Simulate changing odds
export const updateOdds = (horses: Horse[]): Horse[] => {
  return horses.map(horse => {
    // Small random change in live odds
    const change = (Math.random() * 0.25) * (Math.random() > 0.5 ? 1 : -1);
    const newLiveOdds = Math.max(1.05, horse.liveOdds + change);
    
    // Update the difference
    const newDifference = parseFloat((newLiveOdds - horse.modelOdds).toFixed(2));
    
    return {
      ...horse,
      liveOdds: parseFloat(newLiveOdds.toFixed(2)),
      difference: newDifference
    };
  });
};

// Export all mock data
export const getMockData = () => {
  return {
    horses: generateHorses(),
    poolData: generatePoolData(),
    exoticPools: generateExoticPools(),
    paceData: generatePaceData(),
    sharpMovements: generateSharpMovements(),
    bettingTimeline: generateBettingTimeline(),
    trainingFigures: generateTrainingFigures(),
    trackProfile: generateTrackProfile(),
    horseComments: generateHorseComments(),
    lastUpdated: new Date().toLocaleTimeString()
  };
};
