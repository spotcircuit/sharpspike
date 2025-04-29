
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatTrainingFigure } from '../utils/formatters';

interface TrainingFigure {
  horse: string;
  date: string;
  figure: number;
  track: string;
  distance: string;
  improvement: number;
}

interface TrainingFiguresProps {
  figures: TrainingFigure[];
}

const TrainingFigures: React.FC<TrainingFiguresProps> = ({ figures }) => {
  // Sort by figure value (highest first)
  const sortedFigures = [...figures].sort((a, b) => b.figure - a.figure);
  
  return (
    <Card className="border-4 border-blue-600 shadow-xl bg-betting-darkCard overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 px-4 py-3">
        <CardTitle className="text-lg font-semibold text-white">Best Recent Training Figures</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/60">
              <tr>
                <th className="px-4 py-2 text-left text-xs text-gray-300">Horse</th>
                <th className="px-4 py-2 text-left text-xs text-gray-300">Date</th>
                <th className="px-4 py-2 text-center text-xs text-gray-300">Figure</th>
                <th className="px-4 py-2 text-left text-xs text-gray-300">Track</th>
                <th className="px-4 py-2 text-right text-xs text-gray-300">Δ</th>
              </tr>
            </thead>
            <tbody>
              {sortedFigures.map((item, index) => (
                <tr 
                  key={index}
                  className={`border-t border-gray-800/30 ${index % 2 === 0 ? 'bg-gray-800/10' : ''}`}
                >
                  <td className="px-4 py-2 font-medium">{item.horse}</td>
                  <td className="px-4 py-2 text-gray-400">{item.date}</td>
                  <td className="px-4 py-2 text-center font-mono">
                    <span className={item.figure >= 90 ? 'text-betting-positive' : 
                      item.figure >= 80 ? 'text-betting-highlight' : 'text-gray-200'}>
                      {formatTrainingFigure(item.figure)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-400">{item.track} ({item.distance})</td>
                  <td className="px-4 py-2 text-right">
                    <span className={item.improvement > 0 ? 'text-betting-positive' : 
                      item.improvement < 0 ? 'text-betting-negative' : 'text-gray-400'}>
                      {item.improvement > 0 ? `+${item.improvement}` : item.improvement}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainingFigures;
