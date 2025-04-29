
import React from 'react';
import { Horse } from '../utils/mockData';
import { formatOdds, getChangeClass, formatDifference } from '../utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface LiveStreamingOddsProps {
  horses: Horse[];
}

const LiveStreamingOdds: React.FC<LiveStreamingOddsProps> = ({ horses }) => {
  return (
    <Card className="border-4 border-blue-600 shadow-xl bg-betting-darkCard overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 px-4 py-3">
        <CardTitle className="text-lg font-semibold text-white">Live Streaming Odds</CardTitle>
      </CardHeader>
      
      <CardContent className="p-2 space-y-1">
        {horses.map((horse) => (
          <div key={horse.id} className="flex justify-between items-center py-2 px-4 hover:bg-gray-800/30 rounded">
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
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default LiveStreamingOdds;
