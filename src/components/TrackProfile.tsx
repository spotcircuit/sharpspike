
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface FinishPosition {
  position: number;
  count: number;
  percentage: number;
}

interface TrackStatistics {
  totalRaces: number;
  frontRunnerWin: number;
  pressersWin: number;
  midPackWin: number;
  closersWin: number;
  frontRunnerPercentage: number;
  pressersPercentage: number;
  midPackPercentage: number;
  closersPercentage: number;
}

interface TrackTiming {
  distance: string;
  bestTime: string;
  averageTime: string;
}

interface TrackProfileProps {
  statistics: TrackStatistics;
  postPositions: FinishPosition[];
  timings: TrackTiming[];
}

const TrackProfile: React.FC<TrackProfileProps> = ({ statistics, postPositions, timings }) => {
  return (
    <Card className="border-4 border-betting-mediumBlue shadow-xl bg-betting-darkCard overflow-hidden">
      <CardHeader className="bg-naval-gradient px-4 py-3">
        <CardTitle className="text-lg font-semibold text-white">Track Profile & Bias</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="text-white mb-4">
          <div className="text-center font-semibold bg-gray-800 p-2 rounded-t">
            <h3>Track Statistics: {statistics.totalRaces} Races</h3>
          </div>
          
          <div className="bg-gray-900 p-3 rounded-b">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="font-medium">Front-Runners</div>
                <div className="text-2xl text-yellow-500">{statistics.frontRunnerPercentage}%</div>
                <div className="text-xs text-gray-400">{statistics.frontRunnerWin}/{statistics.totalRaces}</div>
              </div>
              <div>
                <div className="font-medium">Pressers</div>
                <div className="text-2xl text-green-500">{statistics.pressersPercentage}%</div>
                <div className="text-xs text-gray-400">{statistics.pressersWin}/{statistics.totalRaces}</div>
              </div>
              <div>
                <div className="font-medium">Mid-Pack</div>
                <div className="text-2xl text-blue-500">{statistics.midPackPercentage}%</div>
                <div className="text-xs text-gray-400">{statistics.midPackWin}/{statistics.totalRaces}</div>
              </div>
              <div>
                <div className="font-medium">Closers</div>
                <div className="text-2xl text-purple-500">{statistics.closersPercentage}%</div>
                <div className="text-xs text-gray-400">{statistics.closersWin}/{statistics.totalRaces}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/60 p-3 rounded">
            <h3 className="text-sm font-medium text-white mb-2">Post Position Analysis</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-900/70">
                    <TableHead className="text-xs">PP</TableHead>
                    <TableHead className="text-xs">Wins</TableHead>
                    <TableHead className="text-xs">Win %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {postPositions.map((position) => (
                    <TableRow key={position.position} className="text-white border-b border-gray-700">
                      <TableCell className="py-1 text-xs">{position.position}</TableCell>
                      <TableCell className="py-1 text-xs">{position.count}</TableCell>
                      <TableCell className={`py-1 text-xs font-bold ${
                        position.percentage > 20 ? 'text-green-400' : 
                        position.percentage > 15 ? 'text-yellow-400' : 'text-white'
                      }`}>
                        {position.percentage}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="bg-gray-800/60 p-3 rounded">
            <h3 className="text-sm font-medium text-white mb-2">Track Times</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-900/70">
                    <TableHead className="text-xs">Distance</TableHead>
                    <TableHead className="text-xs">Best Time</TableHead>
                    <TableHead className="text-xs">Avg Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timings.map((timing) => (
                    <TableRow key={timing.distance} className="text-white border-b border-gray-700">
                      <TableCell className="py-1 text-xs">{timing.distance}</TableCell>
                      <TableCell className="py-1 text-xs text-green-400">{timing.bestTime}</TableCell>
                      <TableCell className="py-1 text-xs">{timing.averageTime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="mt-3 bg-gray-800/60 p-2 rounded text-center text-xs text-gray-300">
          <p>Track is playing fair with slight advantage to mid-pack closers today</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrackProfile;
