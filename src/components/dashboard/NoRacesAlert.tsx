
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface NoRacesAlertProps {
  selectedTrack: string;
  races: number[];
}

const NoRacesAlert: React.FC<NoRacesAlertProps> = ({ selectedTrack, races }) => {
  if (races.length > 0 || !selectedTrack) {
    return null;
  }

  return (
    <Alert variant="default" className="bg-betting-darkCard border-yellow-600">
      <AlertCircle className="h-4 w-4 text-yellow-400" />
      <AlertDescription>
        No races found for {selectedTrack}. There may be a scrape job running to fetch this data.
        Click the "Active Jobs" button to check the status of running jobs, or click "Run All Jobs" to trigger the scraper.
        You can also check the "DB Monitor" to see if any data is being added to the database.
      </AlertDescription>
    </Alert>
  );
};

export default NoRacesAlert;
