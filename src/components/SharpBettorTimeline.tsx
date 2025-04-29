
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { formatTime } from '../utils/formatters';

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
  
  // Runner colors
  const runnerColors = {
    runner1: "#8B5CF6", // Vivid Purple
    runner2: "#D946EF", // Magenta Pink
    runner3: "#F97316", // Bright Orange
    runner4: "#0EA5E9", // Ocean Blue
    runner5: "#33C3F0", // Sky Blue
    runner6: "#10B981", // Emerald Green
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

  return (
    <Card className="border-4 border-blue-600 shadow-xl bg-betting-darkCard overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 px-4 py-3">
        <CardTitle className="text-lg font-semibold text-white">Sharp Bettor Timeline</CardTitle>
      </CardHeader>
      
      <CardContent className="p-2 pt-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={bettingData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="time" 
                stroke="#cbd5e1" 
                tick={{ fill: '#cbd5e1' }} 
              />
              <YAxis 
                yAxisId="volume"
                orientation="left"
                stroke="#cbd5e1" 
                tick={{ fill: '#cbd5e1' }} 
                domain={[0, maxVolume * 1.2]} 
              />
              <YAxis 
                yAxisId="odds"
                orientation="right"
                stroke="#f59e0b" 
                tick={{ fill: '#f59e0b' }} 
                domain={[0, maxOdds * 1.2]} 
                label={{ value: 'Odds', angle: -90, position: 'insideRight', fill: '#f59e0b' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1D2133', 
                  borderColor: '#3B82F6',
                  color: '#fff' 
                }} 
                labelFormatter={(time) => `Time: ${time}`}
                formatter={(value, name) => {
                  if (name === 'volume') return [`$${value.toLocaleString()}`, 'Bet Volume'];
                  if (name.toString().includes('Odds')) {
                    const runnerNumber = name.toString().replace('runnerOdds', '');
                    return [`${value}`, `${runnerNames[`runner${runnerNumber}` as keyof typeof runnerNames]} Odds`];
                  }
                  const runnerNumber = name.toString().replace('runner', '');
                  const runnerName = runnerNames[name as keyof typeof runnerNames] || `Runner ${runnerNumber}`;
                  return [`#${value}`, runnerName];
                }}
              />
              <Legend 
                formatter={(value) => {
                  if (value === 'volume') return 'Bet Volume';
                  if (value.toString().includes('Odds')) {
                    const runnerNumber = value.toString().replace('runnerOdds', '');
                    return `${runnerNames[`runner${runnerNumber}` as keyof typeof runnerNames]} Odds`;
                  }
                  const runnerNumber = value.toString().replace('runner', '');
                  return runnerNames[value as keyof typeof runnerNames] || `Runner ${runnerNumber}`;
                }}
              />
              
              {/* Main volume line */}
              <Line 
                type="monotone" 
                dataKey="volume" 
                yAxisId="volume"
                name="volume"
                stroke="#3B82F6" 
                strokeWidth={2} 
                dot={{ r: 3 }} 
                activeDot={{ r: 6, fill: '#60A5FA' }} 
              />
              
              {/* Runner position lines */}
              {Object.entries(runnerColors).map(([runner, color]) => (
                <Line
                  key={runner}
                  type="monotone"
                  dataKey={runner}
                  name={runner}
                  yAxisId="volume"
                  stroke={color}
                  strokeWidth={1.5}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    const value = payload[runner as keyof typeof payload];
                    if (!value) return null;
                    
                    return (
                      <g key={`dot-${runner}-${cx}-${cy}`}>
                        <circle cx={cx} cy={cy} r={4} fill={color} />
                        <text
                          x={cx}
                          y={cy}
                          dy={-8}
                          textAnchor="middle"
                          fill={color}
                          fontSize={10}
                          fontWeight="bold"
                        >
                          {value}
                        </text>
                      </g>
                    );
                  }}
                />
              ))}
              
              {/* Runner odds lines */}
              {Object.entries(runnerColors).map(([runner, color]) => (
                <Line
                  key={`${runner}Odds`}
                  type="monotone"
                  dataKey={`${runner}Odds`}
                  name={`${runner}Odds`}
                  yAxisId="odds"
                  stroke={`${color}80`}
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                  dot={false}
                />
              ))}
              
              {/* Fixed the issue: Added yAxisId to ReferenceLine components */}
              {spikes.map((spike, index) => (
                <ReferenceLine 
                  key={index} 
                  x={spike.time} 
                  stroke="#F87171" 
                  strokeWidth={2} 
                  strokeDasharray="3 3"
                  yAxisId="volume"
                  label={{
                    value: 'Spike',
                    position: 'top',
                    fill: '#F87171',
                    fontSize: 12
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 p-2 bg-blue-900/30 rounded text-xs text-gray-300">
          <div className="flex items-center justify-between">
            <span>Large bets detected: {spikes.length}</span>
            <span>Last spike: {spikes.length > 0 ? 
              formatTime(spikes[spikes.length - 1].timestamp) : 'None'}</span>
          </div>
          <div className="mt-1 text-center text-betting-highlight">
            * Red lines indicate significant money movement
          </div>
          <div className="mt-1 flex flex-wrap gap-2 justify-center">
            {Object.entries(runnerNames).map(([runner, name], index) => (
              <div key={runner} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: runnerColors[runner as keyof typeof runnerColors] }}></div>
                <span>#{index + 1} {name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SharpBettorTimeline;
