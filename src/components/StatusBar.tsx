
import React from 'react';
import { Clock, RefreshCw } from 'lucide-react';

interface StatusBarProps {
  lastUpdated: string;
  onRefresh: () => void;
  nextUpdateIn: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ lastUpdated, onRefresh, nextUpdateIn }) => {
  return (
    <div className="bg-naval-gradient text-white px-4 py-2 flex items-center justify-between rounded-md animate-fade-in border-4 border-betting-mediumBlue shadow-lg">
      <div className="flex items-center space-x-2">
        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
        <span>Dashboard updated successfully!</span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span className="text-sm">Last updated: {lastUpdated}</span>
        </div>
        <div className="text-sm">
          Next update in: <span className="font-mono bg-betting-navyBlue px-2 py-0.5 rounded">{nextUpdateIn}s</span>
        </div>
        <button 
          onClick={onRefresh}
          className="px-3 py-1 bg-betting-navyBlue hover:bg-betting-mediumBlue rounded text-sm flex items-center gap-1 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh Now
        </button>
      </div>
    </div>
  );
};

export default StatusBar;
