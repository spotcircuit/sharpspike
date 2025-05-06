
import React from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { formatTime } from './utils/scraper-utils';

interface LastUpdateInfoProps {
  lastUpdateTime: string | null;
  isLoading: boolean;
  onRefresh: () => void;
  selectedTrack: string;
  selectedRace: number | null;
}

const LastUpdateInfo: React.FC<LastUpdateInfoProps> = ({ 
  lastUpdateTime, 
  isLoading, 
  onRefresh, 
  selectedTrack, 
  selectedRace 
}) => {
  return (
    <div className="flex items-center gap-3">
      {lastUpdateTime && (
        <div className="text-sm text-gray-400 flex items-center gap-1">
          <Clock className="h-4 w-4" />
          Last updated: {formatTime(lastUpdateTime)}
        </div>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isLoading || !selectedTrack || selectedRace === null}
      >
        {isLoading ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        <span className="ml-2">Refresh</span>
      </Button>
    </div>
  );
};

export default LastUpdateInfo;
