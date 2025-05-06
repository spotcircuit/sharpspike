
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RaceData, RaceHorse } from '@/utils/types';

interface HorseDetailsProps {
  selectedRace: RaceData | null;
  horses: RaceHorse[];
  isLoading: boolean;
  onLoadRace: (raceId: string) => void;
}

const HorseDetails: React.FC<HorseDetailsProps> = ({
  selectedRace,
  horses,
  isLoading,
  onLoadRace
}) => {
  if (!selectedRace) return null;
  
  return (
    <div className="bg-betting-darkPurple border-4 border-betting-tertiaryPurple rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">
          {selectedRace.track_name} - Race {selectedRace.race_number}
        </h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onLoadRace(selectedRace.id)}
          disabled={isLoading}
          className="bg-betting-tertiaryPurple hover:bg-betting-secondaryPurple text-white"
        >
          Load into Application
        </Button>
      </div>
      
      <div className="rounded-md border border-betting-tertiaryPurple overflow-hidden">
        <Table>
          <TableHeader className="bg-betting-darkPurple">
            <TableRow>
              <TableHead className="text-gray-300">PP</TableHead>
              <TableHead className="text-gray-300">Horse</TableHead>
              <TableHead className="text-gray-300">Jockey</TableHead>
              <TableHead className="text-gray-300">Trainer</TableHead>
              <TableHead className="text-gray-300">ML Odds</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {horses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                  {isLoading ? 'Loading horses...' : 'No horses found for this race.'}
                </TableCell>
              </TableRow>
            ) : (
              horses.map((horse) => (
                <TableRow key={horse.id} className="hover:bg-betting-darkPurple/50">
                  <TableCell>{horse.pp}</TableCell>
                  <TableCell className="font-medium text-white">{horse.name}</TableCell>
                  <TableCell>{horse.jockey || 'N/A'}</TableCell>
                  <TableCell>{horse.trainer || 'N/A'}</TableCell>
                  <TableCell>
                    {horse.ml_odds ? `${horse.ml_odds}-1` : 'N/A'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default HorseDetails;
