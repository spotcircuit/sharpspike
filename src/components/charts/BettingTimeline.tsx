
import React from 'react';
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

interface RunnerNamesMap {
  [key: string]: string;
}

interface RunnerColorsMap {
  [key: string]: string;
}

interface BettingTimelineProps {
  bettingData: BettingDataPoint[];
  spikes: BettingDataPoint[];
  runnerNames: RunnerNamesMap;
  runnerColors: RunnerColorsMap;
  maxVolume: number;
  maxOdds: number;
  smallText?: boolean;
}

const BettingTimeline: React.FC<BettingTimelineProps> = ({ 
  bettingData, 
  spikes, 
  runnerNames, 
  runnerColors,
  maxVolume,
  maxOdds,
  smallText = false
}) => {
  return (
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
            tick={{ fill: '#cbd5e1', fontSize: smallText ? 9 : 12 }}
            height={smallText ? 15 : 30}
          />
          <YAxis 
            yAxisId="volume"
            orientation="left"
            stroke="#cbd5e1" 
            tick={{ fill: '#cbd5e1', fontSize: smallText ? 9 : 12 }}
            width={smallText ? 30 : 40}
            domain={[0, maxVolume * 1.2]} 
          />
          <YAxis 
            yAxisId="odds"
            orientation="right"
            stroke="#f59e0b" 
            tick={{ fill: '#f59e0b', fontSize: smallText ? 9 : 12 }}
            width={smallText ? 30 : 40}
            domain={[0, maxOdds * 1.2]} 
            label={{ 
              value: 'Odds', 
              angle: -90, 
              position: 'insideRight', 
              fill: '#f59e0b',
              fontSize: smallText ? 10 : 12
            }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1D2133', 
              borderColor: '#3B82F6',
              color: '#fff',
              fontSize: smallText ? 10 : 12
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
            wrapperStyle={{ 
              fontSize: smallText ? 9 : 12 
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
            dot={{ r: smallText ? 2 : 3 }} 
            activeDot={{ r: smallText ? 4 : 6, fill: '#60A5FA' }} 
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
                    <circle cx={cx} cy={cy} r={smallText ? 3 : 4} fill={color} />
                    <text
                      x={cx}
                      y={cy}
                      dy={-8}
                      textAnchor="middle"
                      fill={color}
                      fontSize={smallText ? 8 : 10}
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
          
          {/* Reference lines for spikes */}
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
                fontSize: smallText ? 9 : 12
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BettingTimeline;
