
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TRACK_OPTIONS } from '@/types/ScraperTypes';

interface TrackRaceSelectorProps {
  selectedTrack: string;
  selectedRace: number | null;
  races: number[];
  onTrackChange: (track: string) => void;
  onRaceChange: (race: number) => void;
}

const TrackRaceSelector: React.FC<TrackRaceSelectorProps> = ({
  selectedTrack,
  selectedRace,
  races,
  onTrackChange,
  onRaceChange
}) => {
  return (
    <Card className="border-4 border-betting-tertiaryPurple bg-betting-darkCard">
      <CardHeader className="bg-purple-header">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-white">Select Track & Race</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-1/2">
            <label className="text-sm font-medium mb-2 block text-gray-300">Track</label>
            <select 
              className="w-full p-2 rounded bg-betting-darkPurple border border-betting-tertiaryPurple text-white"
              value={selectedTrack}
              onChange={(e) => onTrackChange(e.target.value)}
            >
              {TRACK_OPTIONS.map(track => (
                <option key={track.value} value={track.value}>{track.label}</option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-1/2">
            <label className="text-sm font-medium mb-2 block text-gray-300">Race</label>
            <select 
              className="w-full p-2 rounded bg-betting-darkPurple border border-betting-tertiaryPurple text-white"
              value={selectedRace || ''}
              onChange={(e) => onRaceChange(Number(e.target.value))}
              disabled={races.length === 0}
            >
              {races.length > 0 ? (
                races.map(race => (
                  <option key={race} value={race}>Race {race}</option>
                ))
              ) : (
                <option value="">No races available</option>
              )}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrackRaceSelector;
