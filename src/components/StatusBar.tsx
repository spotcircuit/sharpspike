
import React from 'react';
import { Clock } from 'lucide-react';

interface StatusBarProps {
  lastUpdated: string;
  onRefresh: () => void;
  nextUpdateIn: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ lastUpdated, onRefresh, nextUpdateIn }) => {
  return (
    <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between rounded-md animate-fade-in">
      <div className="flex items-center space-x-2">
        <span>Dashboard updated successfully!</span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span className="text-sm">Last updated: {lastUpdated}</span>
        </div>
        <div className="text-sm">
          Next update in: <span className="font-mono">{nextUpdateIn}s</span>
        </div>
        <button 
          onClick={onRefresh}
          className="px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded text-sm"
        >
          Refresh Now
        </button>
      </div>
    </div>
  );
};

export default StatusBar;
