
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, RefreshCw, Search, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { RaceData, RaceHorse } from '@/utils/types';
import { updateMockData } from '@/utils/mockData';

const RaceDataManager: React.FC = () => {
  const { toast } = useToast();
  const [races, setRaces] = useState<RaceData[]>([]);
  const [horses, setHorses] = useState<RaceHorse[]>([]);
  const [selectedRace, setSelectedRace] = useState<RaceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('races');

  useEffect(() => {
    fetchRaces();
  }, []);

  useEffect(() => {
    if (selectedRace) {
      fetchHorsesForRace(selectedRace.id);
    }
  }, [selectedRace]);

  const fetchRaces = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('race_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setRaces(data || []);
      if (data && data.length > 0 && !selectedRace) {
        setSelectedRace(data[0]);
      }
    } catch (error) {
      console.error('Error fetching races:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch race data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHorsesForRace = async (raceId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('race_horses')
        .select('*')
        .eq('race_id', raceId)
        .order('pp', { ascending: true });

      if (error) {
        throw error;
      }

      setHorses(data || []);
    } catch (error) {
      console.error('Error fetching horses:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch horse data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRace = async (raceId: string) => {
    if (!confirm('Are you sure you want to delete this race and all its horses?')) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('race_data')
        .delete()
        .eq('id', raceId);

      if (error) {
        throw error;
      }

      // Horses will be deleted automatically due to ON DELETE CASCADE
      setRaces(races.filter(race => race.id !== raceId));
      if (selectedRace && selectedRace.id === raceId) {
        setSelectedRace(races.length > 1 ? races[0] : null);
      }

      toast({
        title: 'Success',
        description: 'Race deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting race:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete race.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadRaceIntoApp = async (raceId: string) => {
    setIsLoading(true);
    try {
      // Fetch the race data
      const { data: raceData, error: raceError } = await supabase
        .from('race_data')
        .select('*')
        .eq('id', raceId)
        .single();

      if (raceError) throw raceError;

      // Fetch the horses for this race
      const { data: horseData, error: horseError } = await supabase
        .from('race_horses')
        .select('*')
        .eq('race_id', raceId)
        .order('pp', { ascending: true });

      if (horseError) throw horseError;

      // Update the application state with this data
      updateMockData({
        horses: horseData.map((horse, index) => ({
          id: index + 1,
          pp: horse.pp,
          name: horse.name,
          isFavorite: index === 0,
          liveOdds: horse.ml_odds || 3.5 + (Math.random() * 3),
          mlOdds: horse.ml_odds,
          modelOdds: (horse.ml_odds || 3.5) + (Math.random() * 0.5 - 0.25),
          difference: parseFloat((Math.random() * 0.6 - 0.3).toFixed(2)),
          jockey: horse.jockey || '',
          trainer: horse.trainer || '',
          jockeyWinPct: Math.floor(10 + Math.random() * 20),
          trainerWinPct: Math.floor(10 + Math.random() * 20),
          hFactors: {
            speed: Math.random() > 0.5,
            pace: Math.random() > 0.5,
            form: Math.random() > 0.5,
            class: Math.random() > 0.5,
          },
          irregularBetting: Math.random() > 0.9,
        })),
        lastUpdated: new Date().toLocaleTimeString(),
        trackName: raceData.track_name,
        raceNumber: raceData.race_number,
      });

      toast({
        title: 'Success',
        description: `Loaded ${raceData.track_name} Race ${raceData.race_number} into the application.`,
      });
    } catch (error) {
      console.error('Error loading race data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load race data into the application.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRaces = races.filter(race => 
    race.track_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    race.race_number.toString().includes(searchQuery)
  );

  return (
    <Card className="bg-betting-navyBlue border-betting-mediumBlue">
      <CardHeader>
        <CardTitle>Race Data Manager</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="races">Races</TabsTrigger>
            <TabsTrigger value="horses" disabled={!selectedRace}>Horse Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="races">
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search races..."
                  className="pl-8 bg-betting-dark text-white border-betting-mediumBlue"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchRaces}
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
                        onClick={() => setSelectedRace(race)}
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
                                  loadRaceIntoApp(race.id);
                                }}
                                className="cursor-pointer"
                              >
                                Load into Application
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteRace(race.id);
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
          </TabsContent>
          
          <TabsContent value="horses">
            {selectedRace && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">
                    {selectedRace.track_name} - Race {selectedRace.race_number}
                  </h3>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => loadRaceIntoApp(selectedRace.id)}
                    disabled={isLoading}
                  >
                    Load into Application
                  </Button>
                </div>
                
                <div className="rounded-md border border-betting-mediumBlue overflow-hidden">
                  <Table>
                    <TableHeader className="bg-betting-dark">
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
                          <TableRow key={horse.id} className="hover:bg-betting-dark/50">
                            <TableCell>{horse.pp}</TableCell>
                            <TableCell className="font-medium">{horse.name}</TableCell>
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
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RaceDataManager;
