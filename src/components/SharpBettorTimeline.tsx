
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
} from 'recharts';
import { formatTime } from '../utils/formatters';

interface BettingDataPoint {
  time: string;
  volume: number;
  timestamp: number;
  isSpike?: boolean;
}

interface SharpBettorTimelineProps {
  bettingData: BettingDataPoint[];
}

const SharpBettorTimeline: React.FC<SharpBettorTimelineProps> = ({ bettingData }) => {
  const maxVolume = Math.max(...bettingData.map(item => item.volume));
  
  // Find spike points
  const spikes = bettingData.filter(item => item.isSpike);

  return (
    <Card className="border-4 border-blue-600 shadow-xl bg-betting-darkCard overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 px-4 py-3">
        <CardTitle className="text-lg font-semibold text-white">Sharp Bettor Timeline</CardTitle>
      </CardHeader>
      
      <CardContent className="p-2 pt-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={bettingData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="time" 
                stroke="#cbd5e1" 
                tick={{ fill: '#cbd5e1' }} 
              />
              <YAxis 
                stroke="#cbd5e1" 
                tick={{ fill: '#cbd5e1' }} 
                domain={[0, maxVolume * 1.2]} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1D2133', 
                  borderColor: '#3B82F6',
                  color: '#fff' 
                }} 
                labelFormatter={(time) => `Time: ${time}`}
                formatter={(value) => [`$${value.toLocaleString()}`, 'Bet Volume']}
              />
              <Line 
                type="monotone" 
                dataKey="volume" 
                stroke="#3B82F6" 
                strokeWidth={2} 
                dot={{ r: 3 }} 
                activeDot={{ r: 6, fill: '#60A5FA' }} 
              />
              {spikes.map((spike, index) => (
                <ReferenceLine 
                  key={index} 
                  x={spike.time} 
                  stroke="#F87171" 
                  strokeWidth={2} 
                  strokeDasharray="3 3"
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
        </div>
      </CardContent>
    </Card>
  );
};

export default SharpBettorTimeline;
