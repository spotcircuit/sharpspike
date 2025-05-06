
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RaceResult } from '@/types/RaceResultTypes';
import { RefreshCw } from 'lucide-react';

interface ResultsDisplayProps {
  results: RaceResult[];
  isLoading: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <RefreshCw className="h-8 w-8 animate-spin opacity-50" />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400">
        No results available for this race
      </div>
    );
  }
  
  const result = results[0];
  const finishOrder = result.results_data?.finishOrder || [];
  const payouts = result.results_data?.payouts || {};
  
  return (
    <div className="space-y-6">
      <Card className="bg-betting-darkCard border-betting-mediumBlue">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Final Order of Finish</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-betting-darkPurple">
                <TableRow>
                  <TableHead className="text-white w-16">Pos</TableHead>
                  <TableHead className="text-white">Horse</TableHead>
                  <TableHead className="text-white">Jockey</TableHead>
                  <TableHead className="text-white">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {finishOrder.length > 0 ? (
                  finishOrder.map((horse: any, index: number) => (
                    <TableRow key={index} className="hover:bg-betting-darkPurple/20">
                      <TableCell className="font-medium">{horse.position}</TableCell>
                      <TableCell>{horse.name}</TableCell>
                      <TableCell>{horse.jockey || 'N/A'}</TableCell>
                      <TableCell>{horse.time || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-400">
                      No finish order data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-betting-darkCard border-betting-mediumBlue">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(payouts).length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(payouts).map(([bet, amount]) => (
                <div key={bet} className="flex justify-between items-center border-b border-betting-mediumBlue pb-2">
                  <span className="font-medium">{bet}</span>
                  <span className="font-bold text-lg">
                    ${typeof amount === 'number' ? amount.toFixed(2) : String(amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400">
              No payout data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsDisplay;
