
import React from 'react';
import { Clock, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime } from './utils/scraper-utils';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const formattedTime = lastUpdateTime 
    ? formatTime(lastUpdateTime)
    : null;
    
  return (
    <div className="flex items-center gap-3">
      {formattedTime && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-sm text-gray-400 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Last updated: {formattedTime}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Data was last refreshed at this time</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      <div className="flex gap-2">
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
        
        {selectedTrack && (
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link to={`/results/${selectedTrack}`}>
              <ExternalLink className="h-4 w-4 mr-1" />
              Results
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default LastUpdateInfo;
