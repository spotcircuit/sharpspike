
import { formatTime } from './formatters';
import { Horse } from './types';
import { generateHorses, updateOdds } from './data/horses';
import { generatePoolData, generateExoticPools } from './data/pools';
import { generatePaceData } from './data/pace';
import { generateSharpMovements } from './data/movements';
import { generateBettingTimeline } from './data/betting';
import { generateTrainingFigures } from './data/training';
import { generateTrackProfile } from './data/track';
import { generateHorseComments } from './data/comments';

// Re-export types and functions that were previously part of mockData.ts
export * from './types';
export { updateOdds } from './data/horses';

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
