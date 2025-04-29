
import React from 'react';
import { PaceData } from '../utils/mockData';

interface PaceAnalysisProps {
  paceData: PaceData[];
}

const MAX_BARS = 10;

const PaceAnalysis: React.FC<PaceAnalysisProps> = ({ paceData }) => {
  const renderPaceBars = (count: number, type: 'early' | 'middle' | 'late') => {
    const bars = [];
    for (let i = 0; i < MAX_BARS; i++) {
      const isActive = i < count;
      
      // Determine color based on type and activity state
      let bgColor = 'bg-gray-700';
      
      if (isActive) {
        if (type === 'early') bgColor = 'bg-blue-500';
        if (type === 'middle') bgColor = 'bg-purple-500';
        if (type === 'late') bgColor = 'bg-red-500';
      }
      
      bars.push(
        <div 
          key={`${type}-${i}`} 
          className={`h-3 w-1 rounded ${bgColor} mx-0.5`}
        ></div>
      );
    }
    return <div className="flex">{bars}</div>;
  };
  
  return (
    <div className="betting-card h-full overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3">
        <h2 className="text-lg font-medium text-white">Pace Analysis</h2>
      </div>
      
      <div className="p-2">
        <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-gray-800/50 rounded text-gray-300 text-sm">
          <div>Runner</div>
          <div className="text-center">Early</div>
          <div className="text-center">Middle</div>
          <div className="text-center">Late</div>
        </div>
        
        <div className="space-y-1 mt-2">
          {paceData.map((horse) => (
            <div key={horse.name} className="grid grid-cols-4 gap-2 px-3 py-3 hover:bg-gray-800/30 rounded items-center">
              <div>{horse.name}</div>
              <div className="flex justify-center">{renderPaceBars(horse.early, 'early')}</div>
              <div className="flex justify-center">{renderPaceBars(horse.middle, 'middle')}</div>
              <div className="flex justify-center">{renderPaceBars(horse.late, 'late')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaceAnalysis;
