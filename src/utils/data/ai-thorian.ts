
import { ValuePick, PickCombination } from '../types';

export const generateValuePicks = (): ValuePick[] => {
  return [
    {
      horse: "Gold Search",
      odds: "3/1",
      value: 18.4,
      confidence: 75
    },
    {
      horse: "Rivalry",
      odds: "7/2",
      value: 11.2,
      confidence: 62
    },
    {
      horse: "Beer With Ice",
      odds: "9/1",
      value: 7.5,
      confidence: 45
    },
    {
      horse: "More Than Five",
      odds: "5/1",
      value: 4.2,
      confidence: 58
    }
  ];
};

export const generatePick3Combos = (): PickCombination[] => {
  return [
    {
      combination: "3-5-2",
      probability: 23.4,
      payout: "$87.60"
    },
    {
      combination: "3-5-7",
      probability: 18.2,
      payout: "$126.40"
    },
    {
      combination: "3-1-2",
      probability: 15.7,
      payout: "$154.20"
    },
    {
      combination: "5-1-2",
      probability: 12.1,
      payout: "$211.80"
    }
  ];
};
