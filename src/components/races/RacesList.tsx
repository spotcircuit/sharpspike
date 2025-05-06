
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, RefreshCw, ChevronDown } from 'lucide-react';
import { RaceData } from '@/utils/types';

interface RacesListProps {
  races: RaceData[];
  selectedRace: RaceData | null;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  onSelectRace: (race: RaceData) => void;
  onLoadRace: (raceId: string) => void;
  onDeleteRace: (raceId: string) => void;
}

const RacesList: React.FC<RacesListProps> = ({
  races,
  selectedRace,
  isLoading,
  searchQuery,
  onSearchChange,
  onRefresh,
  onSelectRace,
  onLoadRace,
  onDeleteRace
}) => {
  const filteredRaces = races.filter(race => 
    race.track_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    race.race_number.toString().includes(searchQuery)
  );

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search races..."
            className="pl-8 bg-betting-dark text-white border-betting-mediumBlue"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isLoading}
          className="ml-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      <div className="rounded-md border border-betting-mediumBlue overflow-hidden">
        <Table>
          <TableHeader className="bg-betting-dark">
            <TableRow>
              <TableHead className="text-gray-300">Track</TableHead>
              <TableHead className="text-gray-300">Race</TableHead>
              <TableHead className="text-gray-300">Date</TableHead>
              <TableHead className="text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRaces.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                  {isLoading ? 'Loading races...' : 'No race data found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredRaces.map((race) => (
                <TableRow 
                  key={race.id} 
                  className={`hover:bg-betting-dark/50 ${selectedRace?.id === race.id ? 'bg-betting-dark/70' : ''}`}
                  onClick={() => onSelectRace(race)}
                >
                  <TableCell className="font-medium">{race.track_name}</TableCell>
                  <TableCell>{race.race_number}</TableCell>
                  <TableCell>
                    {new Date(race.race_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-betting-dark border-betting-mediumBlue">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-betting-mediumBlue/50" />
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            onLoadRace(race.id);
                          }}
                          className="cursor-pointer"
                        >
                          Load into Application
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteRace(race.id);
                          }}
                          className="text-red-500 cursor-pointer"
                        >
                          Delete Race
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default RacesList;
