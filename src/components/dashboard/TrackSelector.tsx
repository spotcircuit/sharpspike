
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TRACK_OPTIONS } from '@/types/ScraperTypes';
import { Loader2 } from 'lucide-react';

interface TrackSelectorProps {
  selectedTrack: string;
  selectedRace: number | null;
  races: number[];
  onTrackChange: (track: string) => void;
  onRaceChange: (race: number) => void;
  isLoading?: boolean;
}

const TrackSelector: React.FC<TrackSelectorProps> = ({
  selectedTrack,
  selectedRace,
  races,
  onTrackChange,
  onRaceChange,
  isLoading = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
      <Select
        value={selectedTrack}
        onValueChange={(value) => onTrackChange(value)}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full sm:w-40 bg-betting-darkPurple border-betting-tertiaryPurple text-white">
          <SelectValue placeholder="Select track" />
        </SelectTrigger>
        <SelectContent className="bg-betting-darkPurple border-betting-tertiaryPurple text-white">
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
          disabled={races.length === 0 || isLoading}
        >
          <SelectTrigger className="w-full sm:w-32 bg-betting-darkPurple border-betting-tertiaryPurple text-white">
            <div className="flex items-center justify-between">
              <SelectValue placeholder="Race #" />
              {isLoading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
            </div>
          </SelectTrigger>
          <SelectContent className="bg-betting-darkPurple border-betting-tertiaryPurple text-white">
            {races.length > 0 ? (
              races.map(race => (
                <SelectItem key={race} value={race.toString()}>
                  Race {race}
                </SelectItem>
              ))
            ) : (
              <div className="text-center py-2 text-gray-400">No races available</div>
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default TrackSelector;
