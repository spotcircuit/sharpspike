
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface PickCombination {
  combination: string;
  probability: number;
  payout: string;
}

interface ValuePick {
  horse: string;
  odds: string;
  value: number;
  confidence: number;
}

interface AIThorianValueProps {
  valuePicks: ValuePick[];
  pick3Combos: PickCombination[];
}

const AIThorianValue: React.FC<AIThorianValueProps> = ({ valuePicks, pick3Combos }) => {
  return (
    <Card className="border-4 border-betting-secondaryPurple shadow-xl bg-betting-darkCard overflow-hidden h-full">
      <CardHeader className="bg-amber-700 px-4 py-3">
        <CardTitle className="text-lg font-semibold text-yellow-300">AI Quantum Bets (e.g., Ex-Tri-Pick3)</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="mb-6">
          <h3 className="text-md font-bold text-betting-skyBlue mb-2">Value Picks</h3>
          <div className="grid grid-cols-4 text-xs font-semibold text-gray-400 mb-1 px-2">
            <div>Horse</div>
            <div>Odds</div>
            <div>Value %</div>
            <div>Confidence</div>
          </div>
          <div className="space-y-2">
            {valuePicks.map((pick, index) => (
              <div key={index} className="grid grid-cols-4 bg-gray-800/40 p-2 rounded-md text-sm">
                <div className="font-medium">{pick.horse}</div>
                <div className="font-mono">{pick.odds}</div>
                <div className={`${pick.value > 15 ? 'text-betting-positive' : pick.value > 5 ? 'text-yellow-400' : 'text-gray-200'}`}>
                  +{pick.value}%
                </div>
                <div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-betting-skyBlue h-2 rounded-full" 
                      style={{ width: `${pick.confidence}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-md font-bold text-betting-skyBlue mb-2">Pick 3 Rolling Combinations</h3>
          <div className="grid grid-cols-3 text-xs font-semibold text-gray-400 mb-1 px-2">
            <div>Combination</div>
            <div>Probability</div>
            <div>Est. Payout</div>
          </div>
          <div className="space-y-2">
            {pick3Combos.map((combo, index) => (
              <div key={index} className="grid grid-cols-3 bg-gray-800/40 p-2 rounded-md text-sm">
                <div className="font-medium">{combo.combination}</div>
                <div>{combo.probability}%</div>
                <div className="font-mono">{combo.payout}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIThorianValue;
