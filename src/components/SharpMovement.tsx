
import React from 'react';
import { SharpMove } from '../utils/mockData';
import { formatCurrency } from '../utils/formatters';

interface SharpMovementProps {
  movements: SharpMove[];
}

const SharpMovement: React.FC<SharpMovementProps> = ({ movements }) => {
  return (
    <div className="betting-card h-full overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3">
        <h2 className="text-lg font-medium text-white">Sharp Movement</h2>
      </div>
      
      <div className="p-2 space-y-2">
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
      </div>
    </div>
  );
};

export default SharpMovement;
