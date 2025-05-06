
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { OddsData } from '@/types/ScraperTypes';
import { RefreshCw } from 'lucide-react';
import { formatTime } from './utils/scraper-utils';

interface OddsDisplayProps {
  oddsData: OddsData[];
  isLoading: boolean;
}

const OddsDisplay: React.FC<OddsDisplayProps> = ({ oddsData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <RefreshCw className="h-8 w-8 animate-spin opacity-50" />
      </div>
    );
  }

  if (oddsData.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400">
        No odds data available for this race
      </div>
    );
  }
  
  // Group by horse (showing only latest odds for each)
  const latestOddsByHorse: Record<string, OddsData> = {};
  
  oddsData.forEach(data => {
    const key = `${data.horse_number}-${data.horse_name}`;
    if (!latestOddsByHorse[key] || new Date(data.scraped_at) > new Date(latestOddsByHorse[key].scraped_at)) {
      latestOddsByHorse[key] = data;
    }
  });
  
  const latestOdds = Object.values(latestOddsByHorse)
    .sort((a, b) => a.horse_number - b.horse_number);
  
  return (
    <div className="rounded-md border border-betting-tertiaryPurple overflow-hidden">
      <Table>
        <TableHeader className="bg-betting-darkPurple">
          <TableRow>
            <TableHead className="text-white w-16">#</TableHead>
            <TableHead className="text-white">Horse</TableHead>
            <TableHead className="text-white">Odds</TableHead>
            <TableHead className="text-white">Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {latestOdds.map(horse => (
            <TableRow key={`${horse.horse_number}-${horse.horse_name}`} className="hover:bg-betting-darkPurple/20">
              <TableCell className="font-medium">{horse.horse_number}</TableCell>
              <TableCell>{horse.horse_name}</TableCell>
              <TableCell className="font-bold">{horse.win_odds}</TableCell>
              <TableCell className="text-sm text-gray-400">
                {formatTime(horse.scraped_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OddsDisplay;
