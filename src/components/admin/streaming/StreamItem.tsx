
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { format } from 'date-fns';
import { StreamItemIndicator } from './StreamStates';
import { StreamItem as StreamItemType } from '@/hooks/useDataStream';

interface StreamItemProps {
  item: StreamItemType;
  index: number;
  jobType?: 'odds' | 'will_pays' | 'results';
}

const StreamItem: React.FC<StreamItemProps> = ({ item, index, jobType }) => {
  const timestamp = item.scraped_at || item.created_at || new Date().toISOString();
  
  return (
    <div 
      className={`bg-betting-darkPurple/30 p-3 rounded-md border-l-4 ${
        index === 0 ? 'border-green-500 animate-pulse' : 'border-betting-tertiaryPurple'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          {jobType === 'odds' && (
            <span className="font-medium">
              {item.horse_name || `Horse #${item.horse_number}`} - {item.win_odds}
            </span>
          )}
          
          {jobType === 'will_pays' && (
            <span className="font-medium">
              {item.wager_type} - {item.combination} - ${item.payout?.toFixed(2) || 'Carryover'}
            </span>
          )}
          
          {jobType === 'results' && (
            <span className="font-medium">
              Race {item.race_number} Results
            </span>
          )}
        </div>
        
        <Badge variant="outline" className="text-xs">
          {format(new Date(timestamp), 'HH:mm:ss')}
        </Badge>
      </div>
      
      <div className="text-xs text-gray-400">
        <span className="inline-block mr-4">Race: {item.race_number}</span>
        <span>{item.track_name}</span>
      </div>
      
      {index === 0 && <StreamItemIndicator />}
    </div>
  );
};

export default StreamItem;
