
import React from 'react';
import { Horse } from '../utils/types';
import { formatOdds, getChangeClass, formatDifference } from '../utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface OddsTableProps {
  horses: Horse[];
  highlightUpdates?: boolean;
}

const OddsTable: React.FC<OddsTableProps> = ({ horses, highlightUpdates = false }) => {
  return (
    <Card className="border-4 border-betting-mediumBlue shadow-xl bg-betting-darkCard overflow-hidden w-full">
      <CardHeader className="bg-naval-gradient px-4 py-3">
        <CardTitle className="text-lg font-semibold text-white">Odds Table</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-gray-200">
                <th className="px-4 py-3 text-left">PP</th>
                <th className="px-4 py-3 text-left">Horse</th>
                <th className="px-4 py-3 text-right">Live Odds</th>
                <th className="px-4 py-3 text-right">ML Odds</th>
                <th className="px-4 py-3 text-right">Model Odds</th>
                <th className="px-4 py-3 text-right">Difference</th>
                <th className="px-4 py-3 text-left">Jockey</th>
                <th className="px-4 py-3 text-left">Trainer</th>
                <th className="px-4 py-3 text-center">J/T Stats</th>
                <th className="px-4 py-3 text-center">HFactors</th>
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
                    {formatOdds(horse.mlOdds || 0)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatOdds(horse.modelOdds)}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono ${getChangeClass(horse.difference)}`}>
                    {formatDifference(horse.difference)}
                  </td>
                  <td className="px-4 py-3 text-left">
                    {horse.jockey || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-left">
                    {horse.trainer || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-xs">{horse.jockeyWinPct || '0'}%</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-xs">{horse.trainerWinPct || '0'}%</span>
                      {horse.fireNumber && (
                        <span className="fire-number ml-1">{horse.fireNumber}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      {horse.hFactors ? (
                        <>
                          {horse.hFactors.speed && <span className="px-1 py-0.5 text-xs bg-blue-700 text-white rounded">S</span>}
                          {horse.hFactors.pace && <span className="px-1 py-0.5 text-xs bg-green-700 text-white rounded">P</span>}
                          {horse.hFactors.form && <span className="px-1 py-0.5 text-xs bg-yellow-700 text-white rounded">F</span>}
                          {horse.hFactors.class && <span className="px-1 py-0.5 text-xs bg-red-700 text-white rounded">C</span>}
                        </>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </div>
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

export default OddsTable;
