
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LineChart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { TRACK_OPTIONS } from '@/types/ScraperTypes';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

// Sample data for demonstration
const SAMPLE_RANKING_DATA = {
  "CHURCHILL DOWNS": {
    1: [
      { rank: 1, pp: 4, horseName: "Lucky Strike", mlOdds: "2-1", qModelOdds: "8-5", score: 98.7, jockey: "J. Velazquez", trainer: "B. Baffert" },
      { rank: 2, pp: 7, horseName: "Northern Wind", mlOdds: "5-2", qModelOdds: "5-2", score: 95.4, jockey: "M. Smith", trainer: "T. Pletcher" },
      { rank: 3, pp: 2, horseName: "Solar Flash", mlOdds: "4-1", qModelOdds: "7-2", score: 92.1, jockey: "J. Rosario", trainer: "S. Asmussen" },
      { rank: 4, pp: 8, horseName: "Electric Blue", mlOdds: "8-1", qModelOdds: "6-1", score: 90.5, jockey: "F. Prat", trainer: "C. Brown" },
      { rank: 5, pp: 1, horseName: "Midnight Fury", mlOdds: "10-1", qModelOdds: "12-1", score: 89.3, jockey: "L. Saez", trainer: "D. O'Neill" },
      { rank: 6, pp: 5, horseName: "Golden Crown", mlOdds: "15-1", qModelOdds: "20-1", score: 87.8, jockey: "T. Gaffalione", trainer: "W. Mott" }
    ],
    2: [
      { rank: 1, pp: 3, horseName: "Rapid Thunder", mlOdds: "3-1", qModelOdds: "5-2", score: 97.2, jockey: "F. Prat", trainer: "B. Cox" },
      { rank: 2, pp: 6, horseName: "Dark Knight", mlOdds: "7-2", qModelOdds: "3-1", score: 94.9, jockey: "J. Rosario", trainer: "S. Asmussen" },
      { rank: 3, pp: 5, horseName: "Silver Bullet", mlOdds: "6-1", qModelOdds: "4-1", score: 93.7, jockey: "M. Smith", trainer: "T. Pletcher" },
      { rank: 4, pp: 2, horseName: "Blazing Sun", mlOdds: "8-1", qModelOdds: "8-1", score: 91.2, jockey: "J. Castellano", trainer: "C. Brown" },
      { rank: 5, pp: 4, horseName: "Winter Storm", mlOdds: "12-1", qModelOdds: "10-1", score: 89.8, jockey: "I. Ortiz Jr.", trainer: "W. Mott" },
      { rank: 6, pp: 1, horseName: "Crimson Tide", mlOdds: "20-1", qModelOdds: "15-1", score: 88.5, jockey: "J. Velazquez", trainer: "B. Baffert" }
    ]
  },
  "SARATOGA": {
    3: [
      { rank: 1, pp: 7, horseName: "Mountain King", mlOdds: "5-2", qModelOdds: "3-1", score: 99.1, jockey: "I. Ortiz Jr.", trainer: "C. Brown" },
      { rank: 2, pp: 4, horseName: "Ocean Breeze", mlOdds: "3-1", qModelOdds: "7-2", score: 96.8, jockey: "J. Castellano", trainer: "T. Pletcher" },
      { rank: 3, pp: 9, horseName: "Thunder Roll", mlOdds: "7-2", qModelOdds: "4-1", score: 94.5, jockey: "L. Saez", trainer: "S. Asmussen" },
      { rank: 4, pp: 3, horseName: "Royal Flush", mlOdds: "9-1", qModelOdds: "8-1", score: 92.3, jockey: "T. Gaffalione", trainer: "B. Cox" },
      { rank: 5, pp: 1, horseName: "Diamond Cut", mlOdds: "12-1", qModelOdds: "10-1", score: 90.1, jockey: "J. Alvarado", trainer: "W. Mott" },
      { rank: 6, pp: 6, horseName: "Emerald Fire", mlOdds: "15-1", qModelOdds: "12-1", score: 88.9, jockey: "M. Franco", trainer: "D. O'Neill" }
    ],
    4: [
      { rank: 1, pp: 5, horseName: "Prairie Wind", mlOdds: "2-1", qModelOdds: "8-5", score: 98.3, jockey: "L. Saez", trainer: "B. Baffert" },
      { rank: 2, pp: 8, horseName: "Storm Chaser", mlOdds: "5-2", qModelOdds: "5-2", score: 95.7, jockey: "I. Ortiz Jr.", trainer: "C. Brown" },
      { rank: 3, pp: 3, horseName: "Highland Chief", mlOdds: "4-1", qModelOdds: "7-2", score: 93.4, jockey: "J. Rosario", trainer: "S. Asmussen" },
      { rank: 4, pp: 1, horseName: "Valley Runner", mlOdds: "6-1", qModelOdds: "5-1", score: 91.9, jockey: "F. Prat", trainer: "T. Pletcher" },
      { rank: 5, pp: 7, horseName: "Desert King", mlOdds: "10-1", qModelOdds: "12-1", score: 90.2, jockey: "J. Velazquez", trainer: "B. Cox" },
      { rank: 6, pp: 2, horseName: "Arctic Blast", mlOdds: "15-1", qModelOdds: "20-1", score: 88.7, jockey: "M. Smith", trainer: "D. O'Neill" }
    ]
  }
};

const QuantumRankingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTrack, setSelectedTrack] = useState<string>("CHURCHILL DOWNS");
  const [selectedRace, setSelectedRace] = useState<number>(1);
  
  // Get available tracks and races
  const tracks = TRACK_OPTIONS.map(track => track.value);
  const races = selectedTrack ? Object.keys(SAMPLE_RANKING_DATA[selectedTrack] || {}).map(Number) : [];
  const rankings = selectedTrack && selectedRace && SAMPLE_RANKING_DATA[selectedTrack] ? 
    SAMPLE_RANKING_DATA[selectedTrack][selectedRace] || [] : [];

  return (
    <DashboardLayout 
      title="QUANTUM 5D RANKINGS"
      subtitle="Top ranked horses for each race and track"
      extraButtons={
        <Button
          onClick={() => navigate('/')}
          className="bg-betting-navyBlue hover:bg-betting-mediumBlue text-white font-medium"
        >
          <LineChart className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-6 mb-6">
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
                  onChange={(e) => {
                    setSelectedTrack(e.target.value);
                    // Reset to the first available race when track changes
                    const firstRace = Object.keys(SAMPLE_RANKING_DATA[e.target.value] || {})[0];
                    setSelectedRace(firstRace ? Number(firstRace) : null);
                  }}
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
                  onChange={(e) => setSelectedRace(Number(e.target.value))}
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
      </div>

      <Card className="border-4 border-betting-tertiaryPurple bg-betting-darkCard">
        <CardHeader className="bg-purple-header">
          <CardTitle className="text-lg font-semibold text-white">
            {selectedTrack} - Race {selectedRace} Top Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Table>
            <TableHeader className="bg-betting-darkPurple">
              <TableRow>
                <TableHead className="text-white">Rank</TableHead>
                <TableHead className="text-white">PP</TableHead>
                <TableHead className="text-white">Horse</TableHead>
                <TableHead className="text-white">ML Odds</TableHead>
                <TableHead className="text-white">QModel Odds</TableHead>
                <TableHead className="text-white">Quantum Score</TableHead>
                <TableHead className="text-white">Jockey</TableHead>
                <TableHead className="text-white">Trainer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankings.map((horse) => (
                <TableRow key={horse.rank} className="hover:bg-betting-darkPurple/20">
                  <TableCell className="font-medium">{horse.rank}</TableCell>
                  <TableCell>{horse.pp}</TableCell>
                  <TableCell>{horse.horseName}</TableCell>
                  <TableCell>{horse.mlOdds}</TableCell>
                  <TableCell>{horse.qModelOdds}</TableCell>
                  <TableCell>
                    <span className="font-mono bg-betting-darkPurple px-2 py-1 rounded text-orange-400">
                      {horse.score}
                    </span>
                  </TableCell>
                  <TableCell>{horse.jockey}</TableCell>
                  <TableCell>{horse.trainer}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default QuantumRankingsPage;
