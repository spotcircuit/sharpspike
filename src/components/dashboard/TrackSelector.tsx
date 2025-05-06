
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TRACK_OPTIONS } from '@/types/ScraperTypes';

interface TrackSelectorProps {
  selectedTrack: string;
  selectedRace: number | null;
  races: number[];
  onTrackChange: (track: string) => void;
  onRaceChange: (race: number) => void;
}

const TrackSelector: React.FC<TrackSelectorProps> = ({
  selectedTrack,
  selectedRace,
  races,
  onTrackChange,
  onRaceChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
      <Select
        value={selectedTrack}
        onValueChange={(value) => onTrackChange(value)}
      >
        <SelectTrigger className="w-full sm:w-40 bg-betting-dark border-betting-mediumBlue text-white">
          <SelectValue placeholder="Select track" />
        </SelectTrigger>
        <SelectContent className="bg-betting-dark border-betting-mediumBlue text-white">
          {TRACK_OPTIONS.map(track => (
            <SelectItem key={track.value} value={track.value}>
              {track.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedTrack && (
        <Select
          value={selectedRace?.toString() || ''}
          onValueChange={(value) => onRaceChange(parseInt(value))}
          disabled={races.length === 0}
        >
          <SelectTrigger className="w-full sm:w-32 bg-betting-dark border-betting-mediumBlue text-white">
            <SelectValue placeholder="Race #" />
          </SelectTrigger>
          <SelectContent className="bg-betting-dark border-betting-mediumBlue text-white">
            {races.map(race => (
              <SelectItem key={race} value={race.toString()}>
                Race {race}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default TrackSelector;
