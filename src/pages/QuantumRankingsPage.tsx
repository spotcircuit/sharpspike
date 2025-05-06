
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LineChart, BarChartIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

// Sample data for demonstration
const SAMPLE_RANKING_DATA = {
  "CHURCHILL DOWNS": {
    1: [
      { rank: 1, horseName: "Lucky Strike", score: 98.7, odds: "2-1", jockey: "J. Velazquez" },
      { rank: 2, horseName: "Northern Wind", score: 95.4, odds: "5-2", jockey: "M. Smith" },
      { rank: 3, horseName: "Solar Flash", score: 92.1, odds: "4-1", jockey: "J. Rosario" },
      { rank: 4, horseName: "Electric Blue", score: 90.5, odds: "8-1", jockey: "F. Prat" },
      { rank: 5, horseName: "Midnight Fury", score: 89.3, odds: "10-1", jockey: "L. Saez" },
      { rank: 6, horseName: "Golden Crown", score: 87.8, odds: "15-1", jockey: "T. Gaffalione" }
    ],
    2: [
      { rank: 1, horseName: "Rapid Thunder", score: 97.2, odds: "3-1", jockey: "F. Prat" },
      { rank: 2, horseName: "Dark Knight", score: 94.9, odds: "7-2", jockey: "J. Rosario" },
      { rank: 3, horseName: "Silver Bullet", score: 93.7, odds: "6-1", jockey: "M. Smith" },
      { rank: 4, horseName: "Blazing Sun", score: 91.2, odds: "8-1", jockey: "J. Castellano" },
      { rank: 5, horseName: "Winter Storm", score: 89.8, odds: "12-1", jockey: "I. Ortiz Jr." },
      { rank: 6, horseName: "Crimson Tide", score: 88.5, odds: "20-1", jockey: "J. Velazquez" }
    ]
  },
  "SARATOGA": {
    3: [
      { rank: 1, horseName: "Mountain King", score: 99.1, odds: "5-2", jockey: "I. Ortiz Jr." },
      { rank: 2, horseName: "Ocean Breeze", score: 96.8, odds: "3-1", jockey: "J. Castellano" },
      { rank: 3, horseName: "Thunder Roll", score: 94.5, odds: "7-2", jockey: "L. Saez" },
      { rank: 4, horseName: "Royal Flush", score: 92.3, odds: "9-1", jockey: "T. Gaffalione" },
      { rank: 5, horseName: "Diamond Cut", score: 90.1, odds: "12-1", jockey: "J. Alvarado" },
      { rank: 6, horseName: "Emerald Fire", score: 88.9, odds: "15-1", jockey: "M. Franco" }
    ],
    4: [
      { rank: 1, horseName: "Prairie Wind", score: 98.3, odds: "2-1", jockey: "L. Saez" },
      { rank: 2, horseName: "Storm Chaser", score: 95.7, odds: "5-2", jockey: "I. Ortiz Jr." },
      { rank: 3, horseName: "Highland Chief", score: 93.4, odds: "4-1", jockey: "J. Rosario" },
      { rank: 4, horseName: "Valley Runner", score: 91.9, odds: "6-1", jockey: "F. Prat" },
      { rank: 5, horseName: "Desert King", score: 90.2, odds: "10-1", jockey: "J. Velazquez" },
      { rank: 6, horseName: "Arctic Blast", score: 88.7, odds: "15-1", jockey: "M. Smith" }
    ]
  }
};

const QuantumRankingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTrack, setSelectedTrack] = useState<string>("CHURCHILL DOWNS");
  const [selectedRace, setSelectedRace] = useState<number>(1);
  
  // Get available tracks and races
  const tracks = Object.keys(SAMPLE_RANKING_DATA);
  const races = selectedTrack ? Object.keys(SAMPLE_RANKING_DATA[selectedTrack]).map(Number) : [];
  const rankings = selectedTrack && selectedRace ? SAMPLE_RANKING_DATA[selectedTrack][selectedRace] : [];

  return (
    <div className="min-h-screen bg-gradient-radial from-betting-dark to-black p-4 text-white">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex justify-between items-center p-4 bg-betting-darkPurple border-4 border-betting-secondaryPurple rounded-lg shadow-lg">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-blue-600">
              QUANTUM 5D RANKINGS
            </h1>
            <p className="text-gray-400">
              Top 6 ranked horses for each race and track
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              className="bg-betting-navyBlue hover:bg-betting-mediumBlue text-white font-medium"
            >
              <LineChart className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </header>

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
                    className="w-full p-2 rounded bg-betting-darkPurple border border-betting-secondaryPurple text-white"
                    value={selectedTrack}
                    onChange={(e) => {
                      setSelectedTrack(e.target.value);
                      setSelectedRace(Number(Object.keys(SAMPLE_RANKING_DATA[e.target.value])[0]));
                    }}
                  >
                    {tracks.map(track => (
                      <option key={track} value={track}>{track}</option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-1/2">
                  <label className="text-sm font-medium mb-2 block text-gray-300">Race</label>
                  <select 
                    className="w-full p-2 rounded bg-betting-darkPurple border border-betting-secondaryPurple text-white"
                    value={selectedRace}
                    onChange={(e) => setSelectedRace(Number(e.target.value))}
                  >
                    {races.map(race => (
                      <option key={race} value={race}>Race {race}</option>
                    ))}
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
                  <TableHead className="text-white">Horse</TableHead>
                  <TableHead className="text-white">Quantum Score</TableHead>
                  <TableHead className="text-white">Odds</TableHead>
                  <TableHead className="text-white">Jockey</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankings.map((horse) => (
                  <TableRow key={horse.rank} className="hover:bg-betting-darkPurple/20">
                    <TableCell className="font-medium">{horse.rank}</TableCell>
                    <TableCell>{horse.horseName}</TableCell>
                    <TableCell>
                      <span className="font-mono bg-betting-darkPurple px-2 py-1 rounded text-orange-400">
                        {horse.score}
                      </span>
                    </TableCell>
                    <TableCell>{horse.odds}</TableCell>
                    <TableCell>{horse.jockey}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuantumRankingsPage;
