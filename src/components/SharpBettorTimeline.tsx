
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import BettingTimeline from './charts/BettingTimeline';
import ChartInfoPanel from './charts/ChartInfoPanel';
import RunnerLegend from './charts/RunnerLegend';

interface BettingDataPoint {
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

interface SharpBettorTimelineProps {
  bettingData: BettingDataPoint[];
}

const SharpBettorTimeline: React.FC<SharpBettorTimelineProps> = ({ bettingData }) => {
  // Post position colors (industry standard)
  const runnerColors = {
    runner1: "#DC2626", // red-600
    runner2: "#FFFFFF", // white
    runner3: "#2563EB", // blue-600
    runner4: "#FACC15", // yellow-400
    runner5: "#16A34A", // green-600
    runner6: "#000000", // black
  };

  // Runner names
  const runnerNames = {
    runner1: "Gold Search",
    runner2: "Rivalry",
    runner3: "Beer With Ice",
    runner4: "Quebrancho",
    runner5: "Dancing Noah",
    runner6: "More Than Five",
  };

  // Calculate max values for chart scaling
  const maxVolume = Math.max(...bettingData.map(item => item.volume));
  const maxOdds = Math.max(
    ...bettingData.flatMap(item => [
      item.runner1Odds || 0,
      item.runner2Odds || 0,
      item.runner3Odds || 0,
      item.runner4Odds || 0,
      item.runner5Odds || 0,
      item.runner6Odds || 0,
    ])
  );
  
  // Find spike points
  const spikes = bettingData.filter(item => item.isSpike);
  const lastSpikeTimestamp = spikes.length > 0 ? spikes[spikes.length - 1].timestamp : null;

  return (
    <Card className="border-4 border-betting-mediumBlue shadow-xl bg-betting-darkCard overflow-hidden">
      <CardHeader className="bg-naval-gradient px-4 py-3">
        <CardTitle className="text-lg font-semibold text-white">Sharp Bettor Timeline</CardTitle>
      </CardHeader>
      
      <CardContent className="p-2 pt-4">
        <BettingTimeline
          bettingData={bettingData}
          spikes={spikes}
          runnerNames={runnerNames}
          runnerColors={runnerColors}
          maxVolume={maxVolume}
          maxOdds={maxOdds}
          smallText={true}
        />
        
        <ChartInfoPanel 
          spikesCount={spikes.length}
          lastSpikeTimestamp={lastSpikeTimestamp}
        />
        
        <RunnerLegend 
          runnerNames={runnerNames}
          runnerColors={runnerColors}
        />
      </CardContent>
    </Card>
  );
};

export default SharpBettorTimeline;
