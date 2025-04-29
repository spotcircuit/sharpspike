
import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface RaceNavBarProps {
  currentTrack?: string;
  currentRace?: number;
  mtp?: number;
  allowanceInfo?: {
    purse: string;
    age: string;
    distance: string;
    surface: string;
  };
  onTrackChange?: (track: string) => void;
  onRaceChange?: (race: number) => void;
}

const RaceNavBar: React.FC<RaceNavBarProps> = ({
  currentTrack = "CHURCHILL DOWNS",
  currentRace = 7,
  mtp = 21,
  allowanceInfo = {
    purse: "$127K",
    age: "3YO+",
    distance: "6F",
    surface: "Fast"
  },
  onTrackChange,
  onRaceChange
}) => {
  const [track, setTrack] = useState(currentTrack);
  const [race, setRace] = useState(currentRace);

  const tracks = ["CHURCHILL DOWNS", "BELMONT PARK", "SANTA ANITA", "DEL MAR", "KEENELAND"];
  const races = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleTrackChange = (value: string) => {
    setTrack(value);
    if (onTrackChange) onTrackChange(value);
  };

  const handleRaceChange = (value: string) => {
    const raceNumber = parseInt(value);
    setRace(raceNumber);
    if (onRaceChange) onRaceChange(raceNumber);
  };

  const navigateToPreviousRace = () => {
    if (race > 1) {
      const newRace = race - 1;
      setRace(newRace);
      if (onRaceChange) onRaceChange(newRace);
    }
  };

  const navigateToNextRace = () => {
    if (race < 12) {
      const newRace = race + 1;
      setRace(newRace);
      if (onRaceChange) onRaceChange(newRace);
    }
  };

  return (
    <div className="flex items-center justify-between bg-naval-gradient p-3 rounded-md shadow-md mb-4 border-4 border-betting-mediumBlue">
      <div className="flex items-center space-x-2">
        <Select value={track} onValueChange={handleTrackChange}>
          <SelectTrigger className="w-[200px] bg-white text-black">
            <SelectValue placeholder="Select Track" />
          </SelectTrigger>
          <SelectContent className="bg-white text-black">
            {tracks.map((trackName) => (
              <SelectItem key={trackName} value={trackName}>
                {trackName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={navigateToPreviousRace}
            disabled={race <= 1}
            className="bg-white text-betting-navyBlue"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="mx-2">
            <Select value={race.toString()} onValueChange={handleRaceChange}>
              <SelectTrigger className="w-[120px] bg-white text-black">
                <SelectValue placeholder="Race" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black">
                {races.map((raceNumber) => (
                  <SelectItem key={raceNumber} value={raceNumber.toString()}>
                    RACE {raceNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={navigateToNextRace}
            disabled={race >= 12}
            className="bg-white text-betting-navyBlue"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="ml-2 rounded-md bg-betting-navyBlue text-white px-4 py-2 font-bold">
          {mtp} MTP
        </div>
      </div>

      <div className="text-white flex items-center space-x-2">
        <span className="font-semibold">ALLOWANCE</span>
        <span>Purse: {allowanceInfo.purse} | {allowanceInfo.age} | {allowanceInfo.distance} | Dirt: {allowanceInfo.surface}</span>
        <Button variant="link" className="text-betting-skyBlue hover:text-blue-100">
          MORE
        </Button>
      </div>
    </div>
  );
};

export default RaceNavBar;
