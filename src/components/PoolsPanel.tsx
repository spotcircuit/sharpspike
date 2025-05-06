
import React, { useState } from 'react';
import { PoolData, ExoticPool } from '../utils/mockData';
import { formatCurrency } from '../utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface PoolsPanelProps {
  poolData: PoolData[];
  exoticPools: ExoticPool[];
}

const PoolsPanel: React.FC<PoolsPanelProps> = ({ poolData, exoticPools }) => {
  const [activeTab, setActiveTab] = useState<'POOLS' | 'PROBABLES' | 'WILL PAYS' | 'TOTALS'>('TOTALS');
  
  const renderTotals = () => (
    <div className="mt-4">
      <div className="grid grid-cols-5 gap-2 px-3 py-2 bg-gray-800/50 rounded text-gray-300 text-sm">
        <div>#</div>
        <div className="text-center">ODDS</div>
        <div className="text-center">WIN</div>
        <div className="text-center">PLACE</div>
        <div className="text-center">SHOW</div>
      </div>
      
      <div className="space-y-1 mt-2">
        {poolData.map((pool) => (
          <div key={pool.number} className="grid grid-cols-5 gap-2 px-3 py-2 hover:bg-gray-800/30 rounded">
            <div>{pool.number}</div>
            <div className="text-center">{pool.odds}</div>
            <div className="text-center">{formatCurrency(pool.win)}</div>
            <div className="text-center">{formatCurrency(pool.place)}</div>
            <div className="text-center">{formatCurrency(pool.show)}</div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 space-y-1">
        {exoticPools.map((exotic) => (
          <div key={exotic.name} className="flex justify-between px-3 py-2 hover:bg-gray-800/30 rounded">
            <div className="text-blue-400">{exotic.name}</div>
            <div>{formatCurrency(exotic.amount)}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPlaceholder = (tabName: string) => (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">{tabName} data will appear here</p>
    </div>
  );
  
  return (
    <Card className="border-4 border-betting-tertiaryPurple shadow-xl bg-betting-darkPurple overflow-hidden">
      <CardHeader className="bg-purple-header px-4 py-3">
        <CardTitle className="text-lg font-semibold text-white">Pool Data</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="flex border-b border-gray-800">
          {(['POOLS', 'PROBABLES', 'WILL PAYS', 'TOTALS'] as const).map((tab) => (
            <button
              key={tab}
              className={`flex-1 px-4 py-3 text-center ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white font-medium' 
                  : 'text-gray-400 hover:bg-gray-800/50'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="p-2">
          {activeTab === 'TOTALS' && renderTotals()}
          {activeTab === 'POOLS' && renderPlaceholder('Pools')}
          {activeTab === 'PROBABLES' && renderPlaceholder('Probables')}
          {activeTab === 'WILL PAYS' && renderPlaceholder('Will Pays')}
        </div>
      </CardContent>
    </Card>
  );
};

export default PoolsPanel;
