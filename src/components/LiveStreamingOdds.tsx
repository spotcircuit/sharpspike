
import React from 'react';
import { Horse } from '../utils/mockData';
import { formatOdds, getChangeClass, formatDifference } from '../utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface LiveStreamingOddsProps {
  horses: Horse[];
}

const LiveStreamingOdds: React.FC<LiveStreamingOddsProps> = ({ horses }) => {
  // Display a history of 10 odds data points per horse (simulated for now)
  const generateOddsHistory = (baseOdds: number) => {
    const history = [];
    for (let i = 0; i < 10; i++) {
      // Create small variations around the base odds
      const variance = (Math.random() * 0.4) - 0.2; // Between -0.2 and +0.2
      history.push(Math.max(1.1, baseOdds + variance));
    }
    return history;
  };

  return (
    <Card className="border-4 border-blue-600 shadow-xl bg-betting-darkCard overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 px-4 py-3">
        <CardTitle className="text-lg font-semibold text-white">Live Streaming Odds</CardTitle>
      </CardHeader>
      
      <CardContent className="p-2 space-y-1">
        {horses.map((horse) => {
          // Generate simulated odds history for each horse
          const oddsHistory = generateOddsHistory(horse.liveOdds);
          
          // Determine momentum trend by comparing the average of the first half vs second half
          const firstHalfAvg = oddsHistory.slice(0, 5).reduce((sum, odds) => sum + odds, 0) / 5;
          const secondHalfAvg = oddsHistory.slice(5).reduce((sum, odds) => sum + odds, 0) / 5;
          const trending = secondHalfAvg < firstHalfAvg ? 'down' : 'up';
          
          return (
            <div key={horse.id} className="flex flex-col py-2 px-4 hover:bg-gray-800/30 rounded">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center space-x-2">
                  {horse.isFavorite && (
                    <span className="h-2 w-2 rounded-full bg-red-500 inline-block"></span>
                  )}
                  <span>{horse.name}</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="font-mono text-lg">{formatOdds(horse.liveOdds)}</span>
                  <span className={`text-sm ${getChangeClass(horse.difference)}`}>
                    {formatDifference(horse.difference)}
                  </span>
                  {trending === 'down' ? 
                    <TrendingDown className="h-4 w-4 text-betting-negative" /> : 
                    <TrendingUp className="h-4 w-4 text-betting-positive" />
                  }
                </div>
              </div>
              
              {/* Historical odds visualization */}
              <div className="flex items-center h-6 mt-1 space-x-1">
                {oddsHistory.map((odds, idx) => (
                  <div 
                    key={idx}
                    className={`h-full w-1 rounded-sm ${
                      idx === oddsHistory.length - 1 
                        ? 'bg-blue-500' 
                        : idx % 2 === 0 
                          ? 'bg-gray-700' 
                          : 'bg-gray-600'
                    }`}
                    style={{ 
                      height: `${Math.min(100, Math.max(30, (1 / odds) * 50))}%` 
                    }}
                    title={`${formatOdds(odds)}`}
                  />
                ))}
                <div 
                  className="h-full w-2 rounded-sm bg-blue-400"
                  style={{ 
                    height: `${Math.min(100, Math.max(30, (1 / horse.liveOdds) * 50))}%` 
                  }}
                  title={`Current: ${formatOdds(horse.liveOdds)}`}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default LiveStreamingOdds;
