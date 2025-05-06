
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Database, Loader2 } from 'lucide-react';
import { LoadingState, ErrorState, EmptyState } from './StreamStates';
import StreamItem from './StreamItem';
import { useDataStream } from '@/hooks/useDataStream';

interface LiveDataStreamProps {
  trackName?: string;
  jobType?: 'odds' | 'will_pays' | 'results';
}

const LiveDataStream: React.FC<LiveDataStreamProps> = ({ 
  trackName,
  jobType = 'odds'
}) => {
  const { streamData, isLoading, error } = useDataStream({ trackName, jobType });
  
  const getStreamContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }
    
    if (error) {
      return <ErrorState error={error} />;
    }
    
    if (streamData.length === 0) {
      return <EmptyState />;
    }
    
    return (
      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
        {streamData.map((item, index) => (
          <StreamItem 
            key={item.id || index} 
            item={item}
            index={index}
            jobType={jobType}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="border-4 border-betting-tertiaryPurple bg-betting-darkPurple">
      <CardHeader className="bg-purple-header pb-2">
        <CardTitle className="text-lg flex items-center text-white">
          <Database className="h-4 w-4 mr-2" />
          Live Data Stream
          {isLoading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
        </CardTitle>
        <div className="text-sm text-gray-300">
          {trackName ? `Track: ${trackName}` : 'All Tracks'} • 
          {jobType ? ` Type: ${jobType}` : ' All Types'} •
          {' '}{streamData.length} records
        </div>
      </CardHeader>
      <CardContent>
        {getStreamContent()}
      </CardContent>
    </Card>
  );
};

export default LiveDataStream;
