
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface NoRacesAlertProps {
  selectedTrack: string;
  races: number[];
}

const NoRacesAlert: React.FC<NoRacesAlertProps> = ({ selectedTrack, races }) => {
  if (races.length > 0 || !selectedTrack) {
    return null;
  }

  return (
    <Alert variant="default" className="bg-betting-darkPurple border-betting-tertiaryPurple border-4">
      <AlertCircle className="h-4 w-4 text-yellow-400" />
      <AlertDescription className="flex flex-col space-y-3 text-white">
        <div>
          No races found for {selectedTrack}. There may be a scrape job running to fetch this data,
          or you can manually import race results using our Results Importer tool.
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-yellow-400 border-betting-tertiaryPurple hover:bg-betting-darkPurple/20"
            asChild
          >
            <Link to={`/results/${selectedTrack}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Import Results
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-blue-400 border-betting-tertiaryPurple hover:bg-betting-darkPurple/20"
          >
            Check Active Jobs
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default NoRacesAlert;
