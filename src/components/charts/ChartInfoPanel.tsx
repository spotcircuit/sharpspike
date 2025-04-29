
import React from 'react';
import { formatTime } from '../../utils/formatters';

interface ChartInfoPanelProps {
  spikesCount: number;
  lastSpikeTimestamp: number | null;
}

const ChartInfoPanel: React.FC<ChartInfoPanelProps> = ({ spikesCount, lastSpikeTimestamp }) => {
  return (
    <div className="mt-2 p-2 bg-blue-900/30 rounded text-xs text-gray-300">
      <div className="flex items-center justify-between">
        <span>Large bets detected: {spikesCount}</span>
        <span>Last spike: {lastSpikeTimestamp ? 
          formatTime(lastSpikeTimestamp) : 'None'}</span>
      </div>
      <div className="mt-1 text-center text-blue-400">
        * Red lines indicate significant money movement
      </div>
    </div>
  );
};

export default ChartInfoPanel;
