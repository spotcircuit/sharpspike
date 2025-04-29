
import React from 'react';
import { Horse } from '../utils/mockData';
import { formatOdds, getChangeClass, formatDifference } from '../utils/formatters';

interface LiveStreamingOddsProps {
  horses: Horse[];
}

const LiveStreamingOdds: React.FC<LiveStreamingOddsProps> = ({ horses }) => {
  return (
    <div className="betting-card h-full overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3">
        <h2 className="text-lg font-medium text-white">Live Streaming Odds</h2>
      </div>
      <div className="p-2 space-y-1">
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
      </div>
    </div>
  );
};

export default LiveStreamingOdds;
