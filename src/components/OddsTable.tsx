
import React from 'react';
import { Horse } from '../utils/mockData';
import { formatOdds, getChangeClass, formatDifference } from '../utils/formatters';

interface OddsTableProps {
  horses: Horse[];
  highlightUpdates?: boolean;
}

const OddsTable: React.FC<OddsTableProps> = ({ horses, highlightUpdates = false }) => {
  return (
    <div className="w-full overflow-hidden betting-card">
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-gray-200">
            <th className="px-4 py-3 text-left">PP</th>
            <th className="px-4 py-3 text-left">Horse</th>
            <th className="px-4 py-3 text-right">Live Odds</th>
            <th className="px-4 py-3 text-right">Model Odds</th>
            <th className="px-4 py-3 text-right">Difference</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {horses.map((horse) => (
            <tr 
              key={horse.id}
              className={`${highlightUpdates ? 'transition-all duration-500' : ''}`}
            >
              <td className="px-4 py-3 text-left">{horse.pp}</td>
              <td className="px-4 py-3 text-left flex items-center space-x-2">
                {horse.isFavorite && (
                  <span className="h-2 w-2 rounded-full bg-red-500 inline-block"></span>
                )}
                <span>{horse.name}</span>
              </td>
              <td className="px-4 py-3 text-right font-mono">
                {formatOdds(horse.liveOdds)}
              </td>
              <td className="px-4 py-3 text-right font-mono">
                {formatOdds(horse.modelOdds)}
              </td>
              <td className={`px-4 py-3 text-right font-mono ${getChangeClass(horse.difference)}`}>
                {formatDifference(horse.difference)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OddsTable;
