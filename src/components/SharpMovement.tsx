
import React from 'react';
import { SharpMove } from '../utils/mockData';
import { formatCurrency } from '../utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface SharpMovementProps {
  movements: SharpMove[];
}

const SharpMovement: React.FC<SharpMovementProps> = ({ movements }) => {
  return (
    <Card className="border-4 border-betting-mediumBlue shadow-xl bg-betting-darkCard overflow-hidden h-full">
      <CardHeader className="bg-naval-gradient px-4 py-3">
        <CardTitle className="text-lg font-semibold text-white">Sharp Movement</CardTitle>
      </CardHeader>
      
      <CardContent className="p-2 space-y-2">
        {movements.map((move, index) => (
          <div key={index} className="p-3 hover:bg-gray-800/30 rounded">
            <div className="flex justify-between items-center">
              <span className="font-medium">{move.horse}</span>
              <span className="text-sm text-gray-400">{move.timestamp}</span>
            </div>
            
            <div className="mt-2 flex justify-between items-center">
              <div className="font-mono text-sm bg-gray-800/70 px-2 py-1 rounded">
                {formatCurrency(move.amount)}
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">{move.oldOdds}</span>
                <span className="text-gray-400">→</span>
                <span 
                  className={`font-medium ${
                    move.direction === 'down' ? 'text-betting-positive' : 'text-betting-negative'
                  }`}
                >
                  {move.newOdds}
                </span>
                {move.direction === 'down' ? (
                  <span className="text-betting-positive">↓</span>
                ) : (
                  <span className="text-betting-negative">↑</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SharpMovement;
