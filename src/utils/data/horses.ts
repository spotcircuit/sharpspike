
import { Horse } from '../types';

// Generate mock horse data
export const generateHorses = (): Horse[] => {
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
